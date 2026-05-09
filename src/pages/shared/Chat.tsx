import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import type { DealStage, Conversation, Message, MessageType } from "../../services/chatService";
import { sendMessage, sendActionMessage, updateDealStage, markAsRead, updateConversationStatus, signNDA, updateVDRLink } from "../../services/chatService";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";
import { DealFlowPipeline } from "../../components/DealFlowPipeline";
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
    <div className="flex h-[calc(100vh-8rem)] bg-slate-950/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* SIDEBAR CONVERSAS */}
      <div className="w-1/3 border-r border-slate-800 bg-slate-900/50 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <MessageSquare size={20} /> Negociações
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-slate-500 text-sm text-center">Nenhuma conversa iniciada.</p>
          ) : (
            conversations.map(conv => {
              const unreadCount = user ? (conv.unreadCount?.[user.uid] || 0) : 0;
              const isActive = activeConvId === conv.id;

              return (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full text-left p-4 border-b border-slate-800/50 transition-colors relative ${
                  isActive ? "bg-indigo-500/10 border-l-4 border-l-indigo-500" : "hover:bg-slate-800/30 border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-semibold truncate ${unreadCount > 0 ? "text-white" : "text-slate-300"}`}>
                    {conv.projectTitle || `Match #${conv.id.slice(0,5)}`}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded ml-2 flex-shrink-0">
                    {conv.stage}
                  </span>
                </div>
                
                <div className="flex justify-between items-center gap-2">
                  <p className={`text-xs truncate ${unreadCount > 0 ? "text-slate-300 font-medium" : "text-slate-500"}`}>
                    {conv.lastMessage || "Iniciou contato..."}
                  </p>
                  
                  {unreadCount > 0 && !isActive && (
                    <span className="bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center flex-shrink-0">
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
      <div className="flex-1 flex flex-col relative bg-[#040B1A]">
        {activeConv ? (
          <>
            <DealFlowPipeline currentStage={activeConv.stage} />
            
            {/* DOUBLE OPT-IN STATUS BAR */}
            {activeConv.status === "declined" && (
              <div className="p-3 bg-red-500/10 border-b border-red-500/20 text-center">
                <p className="text-red-400 font-bold text-sm">Esta negociação foi encerrada (Declinada).</p>
              </div>
            )}
            {activeConv.status === "pending" && (
              <div className="p-4 bg-indigo-500/10 border-b border-indigo-500/20 text-center flex flex-col items-center gap-3">
                {activeConv.initiatorId === user?.uid ? (
                  <p className="text-indigo-400 font-medium text-sm">Aguardando o parceiro aceitar a conexão para liberar o chat livre.</p>
                ) : (
                  <>
                    <p className="text-indigo-400 font-bold text-sm">Esta organização tem interesse em iniciar um Deal Flow com você.</p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => updateConversationStatus(activeConv.id, "active")}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2"
                      >
                        <CheckCircle size={18} /> Aceitar Conexão
                      </button>
                      <button 
                        onClick={() => updateConversationStatus(activeConv.id, "declined")}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-2 rounded-lg font-bold text-sm transition-all border border-slate-700 flex items-center gap-2"
                      >
                        <XCircle size={18} /> Recusar
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ACTION BAR DE NEGOCIAÇÃO */}
            {(activeConv.status === "active" || !activeConv.status) && (
              <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex flex-wrap gap-2 justify-end backdrop-blur-md">
                <button 
                  onClick={() => handleSendAction('meeting')}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition border border-slate-700 hover:border-slate-600"
                >
                <Calendar size={14} className="text-cyan-400" /> Marcar Reunião
              </button>

              <button 
                onClick={() => handleSendAction('nda')}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition border border-slate-700 hover:border-slate-600"
              >
                <ShieldCheck size={14} className="text-pink-400" /> Enviar NDA
              </button>

              {activeConv.stage !== "initial_contact" && (
                <button 
                  onClick={() => setVdrOpen(true)}
                  className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-[0_0_10px_rgba(245,158,11,0.2)] font-bold"
                >
                  <Lock size={14} /> Data Room
                </button>
              )}

              <div className="w-px h-6 bg-slate-700 mx-1 self-center"></div>

              {activeConv.stage === "initial_contact" && (
                <button onClick={() => handleAdvanceStage("nda")} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-[0_0_10px_rgba(79,70,229,0.2)] font-medium">
                  Avançar para NDA <ChevronRight size={14} />
                </button>
              )}
              {activeConv.stage === "nda" && (
                <button onClick={() => handleAdvanceStage("proposal")} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-[0_0_10px_rgba(79,70,229,0.2)] font-medium">
                  Avançar para Proposta <ChevronRight size={14} />
                </button>
              )}
              {activeConv.stage === "proposal" && (
                <button onClick={() => handleAdvanceStage("negotiation")} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-[0_0_10px_rgba(79,70,229,0.2)] font-medium">
                  Iniciar Negociação <ChevronRight size={14} />
                </button>
              )}
              {activeConv.stage === "negotiation" && (
                <button onClick={() => handleAdvanceStage("closed")} className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(16,185,129,0.3)] font-medium">
                  <Handshake size={14} /> Fechar Deal
                </button>
              )}
            </div>
            )}

            {/* MESSAGES LIST */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map(msg => {
                if (msg.type === "system" || msg.isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-6">
                      <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] px-4 py-1.5 rounded-full uppercase tracking-wider font-bold shadow-[0_0_10px_rgba(79,70,229,0.1)]">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                const isMe = msg.senderId === user?.uid;

                // Renderização de "Mensagens Ricas"
                if (msg.type === "nda" || msg.type === "meeting") {
                  const Icon = msg.type === "nda" ? ShieldCheck : Calendar;
                  const title = msg.type === "nda" ? "Acordo de Confidencialidade (NDA)" : "Convite para Reunião";
                  const color = msg.type === "nda" ? "text-pink-400" : "text-cyan-400";
                  
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[75%] md:max-w-[60%] bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
                        <div className="bg-slate-800/80 px-4 py-3 flex items-center gap-3 border-b border-slate-700/50">
                          <Icon className={color} size={20} />
                          <span className="font-semibold text-slate-200 text-sm">{title}</span>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-slate-400 mb-4">{msg.text}</p>
                          <div className="flex justify-end gap-2">
                            {msg.type === "nda" && !isMe && (
                              <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-lg transition-colors font-medium">Assinar NDA</button>
                            )}
                            {msg.type === "meeting" && !isMe && (
                              <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-lg transition-colors font-medium">Aceitar Horário</button>
                            )}
                            <button onClick={() => setModalData({type: msg.type as MessageType, text: msg.text})} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700">
                              <Download size={14} /> Detalhes
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Renderização de Texto Simples
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-5 py-3 text-sm ${
                      isMe 
                        ? "bg-indigo-600 text-white rounded-tr-sm shadow-[0_0_15px_rgba(79,70,229,0.2)]" 
                        : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-slate-900/80 border-t border-slate-800 backdrop-blur-xl">
              <form onSubmit={handleSend} className="flex gap-3 relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={activeConv.status === "pending" ? "Chat bloqueado aguardando aceite..." : activeConv.status === "declined" ? "Negociação encerrada." : "Digite sua mensagem..."}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-5 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner disabled:opacity-50 disabled:bg-slate-900 disabled:cursor-not-allowed"
                  disabled={activeConv.stage === "closed" || activeConv.status === "pending" || activeConv.status === "declined"}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || activeConv.stage === "closed" || activeConv.status === "pending" || activeConv.status === "declined"}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <MessageSquare size={32} className="text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-300 mb-2">Deal Flow CRM</h2>
            <p className="text-sm">Selecione uma negociação ao lado para enviar mensagens e propostas.</p>
          </div>
        )}
      </div>

      {/* MODAL DETALHES */}
      {modalData && (
        <div className="absolute inset-0 z-50 bg-[#040B1A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                {modalData.type === 'nda' ? <ShieldCheck className="text-pink-400" size={20} /> : <Calendar className="text-cyan-400" size={20} />}
                {modalData.type === 'nda' ? 'Detalhes do NDA' : 'Detalhes da Reunião'}
              </h3>
              <button onClick={() => setModalData(null)} className="text-slate-400 hover:text-white transition"><X size={20}/></button>
            </div>
            <div className="p-6">
              <p className="text-slate-300 text-sm mb-6">{modalData.text}</p>
              
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 mb-6 text-xs text-slate-400">
                <p className="mb-2"><strong className="text-slate-300">Status:</strong> Documento travado criptograficamente pelo Orizon Match.</p>
                <p><strong className="text-slate-300">Hash de Segurança:</strong> {Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
              </div>

              <button onClick={() => setModalData(null)} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-lg transition">
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
                <p className="text-amber-400 text-sm font-medium">Ambiente Seguro. O acesso ao link protegido só é liberado após a assinatura do NDA na plataforma.</p>
              </div>

              {/* Lógica para Inventor */}
              {(userProfile?.role === 'inventor' || userProfile?.role === 'ict') ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Link Restrito (Google Drive / Dropbox)</label>
                    <input 
                      type="url"
                      value={activeConv.vdrLink || vdrInput}
                      onChange={e => setVdrInput(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <button 
                    onClick={async () => {
                      if (!vdrInput) return;
                      await updateVDRLink(activeConv.id, vdrInput);
                      alert("Link atualizado e seguro salvo no cofre!");
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold py-2 rounded-lg transition"
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
                        <h4 className="text-emerald-400 font-bold mb-2">Acesso Liberado</h4>
                        <p className="text-slate-300 text-sm mb-4">Você assinou o NDA. O acesso aos dados restritos está liberado.</p>
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
