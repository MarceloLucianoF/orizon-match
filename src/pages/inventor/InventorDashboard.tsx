import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { Link } from "react-router-dom";
import { 
  Star, Activity, ShieldCheck, 
  ChevronRight, Loader2, X,
  Gavel, Eye, Heart, Send, Mail, CheckCircle2
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { explainMatch, getMatchLabel, getMatchTier, getScoreColor } from "../../lib/matching";
import { TRLCalculator } from "../../components/TRLCalculator";
import { VDRRoom } from "../../components/VDRRoom";
import { DueDiligenceChecklist } from "../../components/DueDiligenceChecklist";
import { updateProject } from "../../services/projectService";
import { StatsCard } from "../../components/analytics/StatsCard";
import { ProjectPerformanceChart } from "../../components/analytics/ProjectPerformanceChart";
import { MarketTrendsChart } from "../../components/analytics/MarketTrendsChart";

export function InventorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ projects: 0, matches: 0, views: 0, saves: 0 });
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [radarCount, setRadarCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [completionScore, setCompletionScore] = useState(0);
  const [showTRLModal, setShowTRLModal] = useState(false);
  const [primaryProject, setPrimaryProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'vdr'>('overview');
  
  // Legal invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        const userProjQ = query(collection(db, "projects"), where("userId", "==", user!.uid));
        const userProjSnap = await getDocs(userProjQ);
        const userProjects = userProjSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
        const userProjectIds = userProjects.map(p => p.id);

        let totalSaves = 0;
        let totalViews = 0;

        if (userProjects.length > 0) {
          const firstProj = userProjects[0];
          setPrimaryProject(firstProj);
          let score = 30;
          if (firstProj.title) score += 20;
          if (firstProj.segment) score += 20;
          if (firstProj.maturity || firstProj.trlScore) score += 10;
          if (firstProj.needs && Object.values(firstProj.needs).some(v => v)) score += 20;
          setCompletionScore(Math.min(score, 100));

          const allSegments = [...new Set(userProjects.map(p => p.segment))].filter(Boolean);
          if (allSegments.length > 0) {
            const orgsQ = query(
              collection(db, "users"),
              where("role", "in", ["company", "investor", "provider"]),
              where("segments", "array-contains-any", allSegments)
            );
            const orgsSnap = await getDocs(orgsQ);
            setRadarCount(orgsSnap.size);
          } else {
            setRadarCount(0);
          }

          userProjects.forEach(p => {
             if (p.stats) {
                 totalViews += p.stats.views || 0;
                 totalSaves += p.stats.saves || 0;
             }
          });
        } else {
          setCompletionScore(10);
          setRadarCount(0);
        }

        if (userProjectIds.length > 0) {
          const matchesQ = query(
            collection(db, "matches"),
            where("ownerProjectId", "in", userProjectIds.slice(0, 10)),
            orderBy("score", "desc")
          );
          const matchSnap = await getDocs(matchesQ);

          setStats({
            projects: userProjects.length,
            matches: matchSnap.size,
            views: totalViews,
            saves: totalSaves
          });

          setRecentMatches(matchSnap.docs.slice(0, 3).map(d => ({ id: d.id, ...d.data() })));
        } else {
          setStats({ projects: 0, matches: 0, views: 0, saves: 0 });
        }

      } catch (error) {
        console.error("Erro ao carregar dashboard", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSendInvite = async () => {
    if (!inviteEmail || !user || !primaryProject) return;
    setInviteSending(true);
    try {
      await addDoc(collection(db, "legal_invites"), {
        invitedBy: user.uid,
        email: inviteEmail,
        message: inviteMessage,
        projectId: primaryProject.id,
        projectTitle: primaryProject.title || "Projeto",
        status: "pending",
        createdAt: serverTimestamp()
      });
      setInviteSent(true);
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSent(false);
        setInviteEmail("");
        setInviteMessage("");
      }, 2000);
    } catch (error) {
      console.error("Erro ao enviar convite:", error);
    } finally {
      setInviteSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">Painel do Inventor</h1>
          <p className="text-slate-400 mt-1 text-sm">Gerencie sua jornada de inovação e atraia investidores.</p>
        </div>
        <div className="flex gap-1.5 bg-slate-900/50 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('vdr')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'vdr' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Data Room
          </button>
        </div>
      </div>

      {activeTab === 'vdr' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <VDRRoom inpiStatus={primaryProject?.inpiStatus} />
          </div>
          <div className="space-y-6">
            <DueDiligenceChecklist />
            
            <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20 rounded-2xl md:rounded-3xl p-5 md:p-6">
              <h3 className="text-sm font-bold text-indigo-300 mb-2 flex items-center gap-2">
                <Gavel size={16} /> Curadoria Jurídica
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Projetos com documentação validada por especialistas em PI têm <strong>4x mais chances</strong> de fechar investimento.
              </p>
              <button 
                onClick={() => setShowInviteModal(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2"
              >
                <Send size={14} /> Convidar Escritório Parceiro
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatsCard 
                label="Visualizações" 
                value={stats.views} 
                icon={Eye} 
                trend={12} 
                color="indigo"
              />
              <StatsCard 
                label="Salvos" 
                value={stats.saves} 
                icon={Heart} 
                trend={5} 
                color="emerald"
              />
              <StatsCard 
                label="Matches" 
                value={stats.matches} 
                icon={Star} 
                trend={8} 
                color="amber"
              />
            </div>

            <ProjectPerformanceChart title="Alcance do Projeto" />

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Star className="text-amber-400" size={18} /> Matches em Destaque
                </h2>
                {stats.projects > 0 && (
                  <Link to="/matches" className="text-xs md:text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                    Ver todos <ChevronRight size={14} />
                  </Link>
                )}
              </div>

              {recentMatches.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="text-slate-600" size={22} />
                  </div>
                  <p className="text-slate-400 font-medium text-sm">Nenhum match encontrado ainda.</p>
                  <p className="text-xs text-slate-500 mt-1">Complete seu projeto para o algoritmo trabalhar.</p>
                  <Link to="/projects/new" className="inline-block mt-4 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition">
                    Cadastrar Projeto
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMatches.map(match => {
                    const tier = getMatchTier(match.score);
                    const scoreColor = getScoreColor(match.score);
                    const label = getMatchLabel(match);
                    
                    return (
                      <div key={match.id} className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 md:p-4 flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 hover:border-indigo-500/50 transition-all">
                        <div className={`w-12 h-12 rounded-full border-2 border-slate-700 bg-slate-900 flex items-center justify-center flex-shrink-0 ${scoreColor}`}>
                          <span className="font-bold text-sm">{match.score}%</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-slate-200 text-sm truncate">{label}</span>
                            {tier.label && (
                              <span className={`${tier.bgColor} ${tier.color} text-[10px] px-2 py-0.5 rounded border ${tier.borderColor} font-bold tracking-wider`}>
                                {tier.label}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1">{explainMatch(match.breakdown)}</p>
                        </div>
                        <Link 
                          to={`/matches?project=${match.ownerProjectId}`} 
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 text-center"
                        >
                          Detalhes
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <MarketTrendsChart title="Tendências de Mercado" />

            <div className="bg-gradient-to-br from-indigo-900/40 to-cyan-900/20 border border-indigo-500/30 rounded-2xl p-5 md:p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl" />
              <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Activity size={16} /> Radar Orizon
              </h3>
              {radarCount === null ? (
                <p className="text-slate-400 text-sm">Escaneando o mercado...</p>
              ) : radarCount > 0 ? (
                <>
                  <p className="text-3xl font-black text-white my-2">{radarCount}</p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    empresas e investidores buscando inovações em **{primaryProject?.segment}** no ecossistema FIESC agora.
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed">
                  Adicione projetos com segmentos definidos para ativar o radar de oportunidades.
                </p>
              )}
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 md:p-6">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Prontidão para o Mercado</h3>
              <div className="flex flex-col items-center mb-5">
                <div className="relative w-28 h-28 md:w-32 md:h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-indigo-500 transition-all duration-1000 ease-out" strokeWidth="3" strokeDasharray={`${completionScore}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl md:text-3xl font-bold text-slate-100">{completionScore}%</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-center">
                  {completionScore < 50 ? "Preencha mais dados do projeto para aumentar visibilidade" :
                   completionScore < 80 ? "Projeto com boa base. Adicione TRL/IRL para subir no ranking" :
                   "Projeto com alta prontidão para investidores"}
                </p>
              </div>

              {primaryProject && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">TRL Atual</span>
                      <span className="text-lg md:text-xl font-black text-indigo-400">{primaryProject.maturity || 1}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">IRL Score</span>
                      <span className="text-lg md:text-xl font-black text-emerald-400">{primaryProject.irlScore || 0}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowTRLModal(true)}
                    className="w-full py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={16} /> Certificar Maturidade
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TRL MODAL */}
      {showTRLModal && primaryProject && (
        <div className="fixed inset-0 z-50 bg-[#020617]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="min-w-0">
                <h2 className="text-lg md:text-xl font-bold text-white truncate">Certificação de Maturidade (TRL/IRL)</h2>
                <p className="text-xs md:text-sm text-slate-400 truncate">Projeto: {primaryProject.title}</p>
              </div>
              <button 
                onClick={() => setShowTRLModal(false)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition flex-shrink-0"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
              <TRLCalculator 
                initialValues={primaryProject.trlChecklist || {}}
                onUpdate={async (data) => {
                  setPrimaryProject({
                    ...primaryProject,
                    maturity: data.trl,
                    irlScore: data.irl,
                    trlChecklist: data.checklist
                  });
                }}
              />
            </div>

            <div className="p-4 md:p-6 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowTRLModal(false)}
                className="px-4 md:px-6 py-2 rounded-xl text-slate-400 hover:text-white transition font-medium text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={async () => {
                  setLoading(true);
                  try {
                    await updateProject(primaryProject.id, {
                      maturity: primaryProject.maturity,
                      irlScore: primaryProject.irlScore,
                      trlChecklist: primaryProject.trlChecklist
                    });
                    setShowTRLModal(false);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="px-6 md:px-8 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all text-sm"
              >
                Salvar Certificação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEGAL INVITE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-[#020617]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base">
                <Gavel className="text-indigo-400" size={20} /> Convidar Escritório Jurídico
              </h3>
              <button 
                onClick={() => { setShowInviteModal(false); setInviteSent(false); }}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {inviteSent ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="mx-auto text-emerald-400 mb-3" size={48} />
                <p className="text-slate-200 font-bold text-base">Convite enviado com sucesso</p>
                <p className="text-xs text-slate-400 mt-1">O escritório receberá uma notificação para validar seu projeto.</p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 block">Email do Escritório</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    <input 
                      type="email"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      placeholder="contato@escritorio.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 block">Mensagem (opcional)</label>
                  <textarea 
                    value={inviteMessage}
                    onChange={e => setInviteMessage(e.target.value)}
                    placeholder="Adicione um contexto sobre seu projeto..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition resize-none text-sm"
                  />
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl">
                  <p className="text-[11px] text-indigo-300 leading-relaxed">
                    O escritório convidado receberá acesso de curadoria ao seu Data Room virtual, podendo validar a documentação jurídica do seu projeto.
                  </p>
                </div>

                <button 
                  onClick={handleSendInvite}
                  disabled={!inviteEmail || inviteSending}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition text-sm shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                >
                  {inviteSending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                  {inviteSending ? "Enviando..." : "Enviar Convite"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
