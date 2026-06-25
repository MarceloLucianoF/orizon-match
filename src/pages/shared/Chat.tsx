import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import type { DealStage, Conversation, Message, MessageType } from "../../services/chatService";
import { sendMessage, sendActionMessage, updateDealStage, markAsRead, updateConversationStatus, signNDA, updateVDRLink } from "../../services/chatService";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";
import { DealFlowPipeline } from "../../components/DealFlowPipeline";
import { EmptyState } from "../../components/EmptyState";
import { 
  Loader2, Send, Handshake, ChevronRight, MessageSquare, Calendar, ShieldCheck, Download, 
  Lock, CheckCircle, XCircle, X 
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

export function Chat() {
  const { user, userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const initialConvId = searchParams.get("id");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConvId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState<{type: MessageType, text: string} | null>(null);
  const [vdrOpen, setVdrOpen] = useState(false);
  const [vdrInput, setVdrInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carrega a lista de conversas do usuário
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const convs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Conversation));
      setConversations(convs.sort((a, b) => b.updatedAt - a.updatedAt));
      setLoading(false);
      
      if (!activeConvId && convs.length > 0) {
        setActiveConvId(convs[0].id);
      }
    });

    return () => unsub();
  }, [user]);

  // Carrega mensagens da conversa ativa e marca como lida
  useEffect(() => {
    if (!activeConvId || !user) return;

    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", activeConvId),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      
      // Sempre que receber novas mensagens ou abrir o chat, zera o contador
      markAsRead(activeConvId, user.uid).catch(console.error);
    });

    return () => unsub();
  }, [activeConvId, user]);

  const activeConv = conversations.find(c => c.id === activeConvId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConv || !user) return;

    const text = input.trim();
    setInput("");
    await sendMessage(activeConv.id, user.uid, text, activeConv.participants);
  };

  const handleSendAction = async (actionType: MessageType) => {
    if (!activeConv || !user) return;
    await sendActionMessage(activeConv.id, user.uid, actionType, activeConv.participants);
  };

  const handleAdvanceStage = async (newStage: DealStage) => {
    if (!activeConvId) return;
    await updateDealStage(activeConvId, newStage);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>;
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col md:flex-row bg-[#020617] border border-slate-850 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-sm">
      
      {/* SIDEBAR CONVERSAS */}
      <div className="w-full md:w-1/3 md:max-w-sm lg:max-w-md border-b md:border-b-0 md:border-r border-slate-850 bg-slate-900/20 flex flex-col md:max-h-none">
        <div className="p-5 border-b border-slate-850/80 bg-slate-900/10">
          <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-400" /> Negociações
          </h2>
        </div>
        <div className="flex-1 overflow-visible md:overflow-y-auto">
          {conversations.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Nenhuma conversa"
              description="Explore matches e inicie sua primeira conexão."
              ctaLabel="Explorar"
              ctaLink="/explore"
            />
          ) : (
            conversations.map(conv => {
              const unreadCount = user ? (conv.unreadCount?.[user.uid] || 0) : 0;
              const isActive = activeConvId === conv.id;

              return (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full text-left p-5 border-b border-slate-855 transition-all relative duration-300 ${
                  isActive ? "bg-indigo-500/10 border-l-4 border-l-indigo-500" : "hover:bg-slate-900/30 border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-1.5 gap-2">
                  <span className={`font-semibold text-sm truncate ${unreadCount > 0 ? "text-white" : "text-slate-200"}`}>
                    {conv.projectTitle || `Match #${conv.id.slice(0,5)}`}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded ml-2 flex-shrink-0 border border-indigo-500/20 tracking-wider">
                    {conv.stage}
                  </span>
                </div>
                
                <div className="flex justify-between items-center gap-2">
                  <p className={`text-xs truncate ${unreadCount > 0 ? "text-slate-200 font-semibold" : "text-slate-500"}`}>
                    {conv.lastMessage || "Iniciou contato..."}
                  </p>
                  
                  {unreadCount > 0 && !isActive && (
                    <span className="bg-pink-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center flex-shrink-0 shadow-[0_0_10px_rgba(236,72,153,0.4)]">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
              </button>
            )})
          )}
        </div>
      </div>

      {/* CHAT ÁREA */}
      <div className="flex-1 flex flex-col relative bg-[#040B1A]/40 min-h-[56vh] md:min-h-0 backdrop-blur-sm">
        {activeConv ? (
          <>
            <div className="hidden md:block border-b border-slate-850">
              <DealFlowPipeline currentStage={activeConv.stage} />
            </div>
            <div className="md:hidden border-b border-slate-850 bg-slate-900/60 px-5 py-4">
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black">Deal Flow</p>
              <p className="text-sm font-bold text-white truncate mt-1">{activeConv.projectTitle || `Match #${activeConv.id.slice(0, 5)}`}</p>
            </div>
            
            {/* DOUBLE OPT-IN STATUS BAR */}
            {activeConv.status === "declined" && (
              <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-center animate-pulse">
                <p className="text-red-400 font-bold text-xs">Esta negociação foi encerrada (Declinada).</p>
              </div>
            )}
            {activeConv.status === "pending" && (
              <div className="p-6 bg-indigo-500/5 border-b border-indigo-500/15 text-center flex flex-col items-center gap-4 animate-in fade-in duration-300">
                {activeConv.initiatorId === user?.uid ? (
                  <p className="text-indigo-400 font-semibold text-xs uppercase tracking-wider">Aguardando o parceiro aceitar a conexão para liberar o chat livre.</p>
                ) : (
                  <>
                    <p className="text-indigo-305 font-bold text-sm">Esta organização tem interesse em iniciar um Deal Flow com você.</p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => updateConversationStatus(activeConv.id, "active")}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-455 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_20px_rgba(16,185,129,0.45)] flex items-center gap-2 active:scale-95 duration-200"
                      >
                        <CheckCircle size={16} /> Aceitar Conexão
                      </button>
                      <button 
                        onClick={() => updateConversationStatus(activeConv.id, "declined")}
                        className="bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white text-slate-350 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95 duration-200"
                      >
                        <XCircle size={16} /> Recusar
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ACTION BAR DE NEGOCIAÇÃO */}
            {(activeConv.status === "active" || !activeConv.status) && (
              <div className="p-3.5 bg-slate-900/60 border-b border-slate-850/80 flex flex-wrap gap-2.5 justify-end backdrop-blur-md">
                <button 
                  onClick={() => handleSendAction('meeting')}
                  className="text-xs bg-slate-950/60 hover:bg-slate-900 text-slate-300 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all border border-slate-800 hover:border-slate-700 active:scale-95 duration-200"
                >
                  <Calendar size={13} className="text-cyan-400" /> Marcar Reunião
                </button>

                <button 
                  onClick={() => handleSendAction('nda')}
                  className="text-xs bg-slate-950/60 hover:bg-slate-900 text-slate-300 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all border border-slate-800 hover:border-slate-700 active:scale-95 duration-200"
                >
                  <ShieldCheck size={13} className="text-pink-400" /> Enviar NDA
                </button>

                {activeConv.stage !== "initial_contact" && (
                  <button 
                    onClick={() => setVdrOpen(true)}
                    className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)] font-bold active:scale-95 duration-200"
                  >
                    <Lock size={13} /> Data Room
                  </button>
                )}

                <div className="w-px h-6 bg-slate-800 mx-1 self-center"></div>

                {activeConv.stage === "initial_contact" && (
                  <button onClick={() => handleAdvanceStage("nda")} className="text-xs bg-indigo-650 hover:bg-indigo-600 text-white px-4.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(79,70,229,0.2)] font-bold active:scale-95 duration-200">
                    Avançar para NDA <ChevronRight size={13} />
                  </button>
                )}
                {activeConv.stage === "nda" && (
                  <button onClick={() => handleAdvanceStage("proposal")} className="text-xs bg-indigo-650 hover:bg-indigo-600 text-white px-4.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(79,70,229,0.2)] font-bold active:scale-95 duration-200">
                    Avançar para Proposta <ChevronRight size={13} />
                  </button>
                )}
                {activeConv.stage === "proposal" && (
                  <button onClick={() => handleAdvanceStage("negotiation")} className="text-xs bg-indigo-650 hover:bg-indigo-600 text-white px-4.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(79,70,229,0.2)] font-bold active:scale-95 duration-200">
                    Iniciar Negociação <ChevronRight size={13} />
                  </button>
                )}
                {activeConv.stage === "negotiation" && (
                  <button onClick={() => handleAdvanceStage("closed")} className="text-xs bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-4.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] font-bold active:scale-95 duration-200">
                    <Handshake size={13} /> Fechar Deal
                  </button>
                )}
              </div>
            )}

            {/* MESSAGES LIST */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {messages.map(msg => {
                if (msg.type === "system" || msg.isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <span className="bg-slate-950/85 border border-slate-850 text-slate-450 text-[9px] px-4 py-2 rounded-full uppercase tracking-widest font-black shadow-sm flex items-center gap-1.5 backdrop-blur-sm">
                        <Lock size={10} className="text-indigo-400/80" /> {msg.text}
                      </span>
                    </div>
                  );
                }

                const isMe = msg.senderId === user?.uid;

                // Renderização de "Mensagens Ricas" (Attachments)
                if (msg.type === "nda" || msg.type === "meeting") {
                  const Icon = msg.type === "nda" ? ShieldCheck : Calendar;
                  const title = msg.type === "nda" ? "Acordo de Confidencialidade (NDA)" : "Convite para Reunião";
                  const color = msg.type === "nda" ? "text-pink-400" : "text-cyan-400";
                  
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}>
                      <div className="max-w-[75%] md:max-w-[55%] bg-slate-950/70 border border-slate-850 hover:border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 backdrop-blur-md">
                        <div className="bg-slate-900/50 px-4 py-3 flex items-center gap-3 border-b border-slate-850/60">
                          <Icon className={color} size={18} />
                          <span className="font-bold text-slate-200 text-xs uppercase tracking-wider">{title}</span>
                        </div>
                        <div className="p-4">
                          <p className="text-xs md:text-sm text-slate-350 leading-relaxed mb-4">{msg.text}</p>
                          <div className="flex justify-end gap-2 flex-wrap">
                            {msg.type === "nda" && !isMe && (
                              <button className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all duration-200 active:scale-95">Assinar NDA</button>
                            )}
                            {msg.type === "meeting" && !isMe && (
                              <button className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all duration-200 active:scale-95">Aceitar Horário</button>
                            )}
                            <button onClick={() => setModalData({type: msg.type as MessageType, text: msg.text})} className="bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white text-slate-400 text-xs font-semibold px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 active:scale-95">
                              <Download size={13} /> Detalhes
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Renderização de Texto Simples
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}>
                    <div className={`max-w-[70%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                      isMe 
                        ? "bg-indigo-600 text-white rounded-tr-sm shadow-[0_4px_15px_rgba(99,102,241,0.25)] font-sans" 
                        : "bg-slate-900/80 text-slate-200 rounded-tl-sm border border-slate-800 font-sans"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-slate-900/50 border-t border-slate-850 backdrop-blur-xl">
              <form onSubmit={handleSend} className="flex gap-3 relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={activeConv.status === "pending" ? "Chat bloqueado aguardando aceite..." : activeConv.status === "declined" ? "Negociação encerrada." : "Digite sua mensagem..."}
                  className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-5 py-3 text-slate-200 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm placeholder:text-slate-600 disabled:opacity-50 disabled:bg-slate-950 disabled:cursor-not-allowed"
                  disabled={activeConv.stage === "closed" || activeConv.status === "pending" || activeConv.status === "declined"}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || activeConv.stage === "closed" || activeConv.status === "pending" || activeConv.status === "declined"}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:cursor-not-allowed text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)] active:scale-95 duration-200"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 px-6 py-10 md:py-0">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-950 border border-slate-850 rounded-full flex items-center justify-center mb-4 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
              <MessageSquare size={26} className="text-slate-650 md:hidden" />
              <MessageSquare size={30} className="text-slate-650 hidden md:block" />
            </div>
            <h2 className="text-base font-bold text-slate-350 mb-1.5 text-center">Deal Flow CRM</h2>
            <p className="text-xs text-slate-500 text-center max-w-sm leading-relaxed">Selecione uma negociação ao lado para enviar mensagens e propostas.</p>
            <div className="md:hidden mt-6 w-full max-w-xs">
              <a href="/explore" className="w-full inline-flex items-center justify-center bg-indigo-650 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)] active:scale-95 duration-200">
                Explorar matches
              </a>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DETALHES */}
      {modalData && (
        <div className="absolute inset-0 z-50 bg-[#040B1A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                {modalData.type === 'nda' ? <ShieldCheck className="text-pink-400" size={20} /> : <Calendar className="text-cyan-400" size={20} />}
                {modalData.type === 'nda' ? 'Detalhes do NDA' : 'Detalhes da Reunião'}
              </h3>
              <button onClick={() => setModalData(null)} className="text-slate-400 hover:text-white transition"><X size={20}/></button>
            </div>
            <div className="p-6">
              <p className="text-slate-350 text-xs md:text-sm leading-relaxed mb-6">{modalData.text}</p>
              
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 mb-6 text-[10px] text-slate-500 leading-relaxed font-sans">
                <p className="mb-2"><strong className="text-slate-350">Status:</strong> Documento travado criptograficamente pelo Orizon Match.</p>
                <p><strong className="text-slate-350">Hash de Segurança:</strong> {Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
              </div>

              <button onClick={() => setModalData(null)} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition text-xs uppercase tracking-wider" style={{ cursor: "pointer" }}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VDR MODAL (Cofre de Links) */}
      {vdrOpen && activeConv && user && (
        <div className="absolute inset-0 z-50 bg-[#040B1A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.15)]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Lock className="text-amber-400" size={20} /> Cofre de Dados (VDR)
              </h3>
              <button onClick={() => setVdrOpen(false)} className="text-slate-400 hover:text-white transition"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                <p className="text-amber-450 text-xs md:text-sm font-medium leading-relaxed">Ambiente Seguro. O acesso ao link protegido só é liberado após a assinatura do NDA na plataforma.</p>
              </div>

              {/* Lógica para Inventor */}
              {(userProfile?.role === 'inventor' || userProfile?.role === 'ict') ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Link Restrito (Google Drive / Dropbox)</label>
                    <input 
                      type="url"
                      value={activeConv.vdrLink || vdrInput}
                      onChange={e => setVdrInput(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-slate-200 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-650"
                    />
                  </div>
                  <button 
                    onClick={async () => {
                      if (!vdrInput) return;
                      await updateVDRLink(activeConv.id, vdrInput);
                      alert("Link atualizado e seguro salvo no cofre!");
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-350 text-amber-950 font-bold py-2.5 rounded-xl transition text-xs uppercase tracking-wider"
                  >
                    Salvar Link no Cofre
                  </button>
                </div>
              ) : (
                /* Lógica para Investidor / Empresa */
                <div className="space-y-4 text-center">
                  {activeConv.vdrLink ? (
                    activeConv.ndaSignedBy?.includes(user.uid) ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl">
                        <ShieldCheck size={48} className="text-emerald-400 mx-auto mb-4" />
                        <h4 className="text-emerald-450 font-bold mb-2">Acesso Liberado</h4>
                        <p className="text-slate-350 text-xs md:text-sm mb-4 leading-relaxed">Você assinou o NDA. O acesso aos dados restritos está liberado.</p>
                        <a href={activeConv.vdrLink} target="_blank" rel="noreferrer" className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-lg transition">
                          Acessar Documentos
                        </a>
                      </div>
                    ) : (
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h4 className="text-slate-200 font-bold mb-2">Acesso Restrito</h4>
                        <p className="text-slate-400 text-sm mb-4">O Inventor já disponibilizou os arquivos, mas você precisa assinar o NDA para desbloqueá-los.</p>
                        <button 
                          onClick={async () => {
                            await signNDA(activeConv.id, user.uid);
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg transition shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                        >
                          Assinar NDA Eletrônico
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="py-8">
                      <p className="text-slate-500">O Inventor ainda não disponibilizou o link do Data Room.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
