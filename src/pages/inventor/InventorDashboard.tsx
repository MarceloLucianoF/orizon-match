import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";
import { Link } from "react-router-dom";
import { 
  Star, Activity, ShieldCheck, 
  ChevronRight, Loader2, X,
  Gavel, Eye, Heart
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { explainMatch } from "../../lib/matching";
import { TRLCalculator } from "../../components/TRLCalculator";
import { VDRRoom } from "../../components/VDRRoom";
import { DueDiligenceChecklist } from "../../components/DueDiligenceChecklist";
import { updateProject } from "../../services/projectService";

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Painel do Inventor</h1>
          <p className="text-slate-400 mt-1">Gerencie sua jornada de inovação e atraia investidores.</p>
        </div>
        <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('vdr')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'vdr' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Virtual Data Room
          </button>
        </div>
      </div>

      {activeTab === 'vdr' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2">
            <VDRRoom />
          </div>
          <div className="space-y-6">
            <DueDiligenceChecklist />
            
            <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-indigo-300 mb-2 flex items-center gap-2">
                <Gavel size={16} /> Curadoria Jurídica
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Projetos com documentação validada por especialistas têm <strong>4x mais chances</strong> de fechar investimento.
              </p>
              <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                Convidar Escritório Parceiro
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard icon={Eye} label="Visualizações" value={stats.views} color="text-indigo-400" bg="bg-indigo-400/10" />
              <StatCard icon={Heart} label="Salvos por Investidores" value={stats.saves} color="text-pink-400" bg="bg-pink-400/10" />
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 relative z-10 text-center">Tempo Médio de Resposta</p>
                <div className="relative flex flex-col items-center justify-center z-10 mt-2">
                   <span className="text-3xl font-bold text-emerald-400">2.4h</span>
                   <span className="text-xs text-slate-500 mt-1">Excelente!</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Star className="text-amber-400" size={20} /> Matches em Destaque
                </h2>
                {stats.projects > 0 && (
                  <Link to="/matches" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                    Ver todos <ChevronRight size={16} />
                  </Link>
                )}
              </div>

              {recentMatches.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="text-slate-600" size={24} />
                  </div>
                  <p className="text-slate-400 font-medium">Nenhum match encontrado ainda.</p>
                  <p className="text-sm text-slate-500 mt-1">Complete seu projeto para o algoritmo trabalhar.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentMatches.map(match => (
                    <div key={match.id} className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 hover:border-indigo-500/50 transition-all">
                      <div className="w-12 h-12 rounded-full border-2 border-slate-700 bg-slate-900 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-slate-200 text-sm">{match.score}%</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-200">Investidor Potencial</span>
                          {match.score >= 80 && (
                            <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded border border-amber-500/30 font-bold tracking-wider">TOP FIT</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{explainMatch(match.breakdown)}</p>
                      </div>
                      <Link to={`/matches?project=${match.ownerProjectId}`} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                        Detalhes
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900/40 to-cyan-900/20 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl"></div>
              <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Activity size={16} /> Radar Orizon
              </h3>
              {radarCount === null ? (
                <p className="text-slate-400 text-sm">Escaneando o mercado...</p>
              ) : radarCount > 0 ? (
                <>
                  <p className="text-3xl font-black text-white my-2">{radarCount}</p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    empresas e investidores buscando inovações nos seus segmentos de atuação agora.
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-300 leading-relaxed">
                  Adicione projetos com segmentos definidos para ligarmos o radar.
                </p>
              )}
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Prontidão para o Mercado</h3>
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-indigo-500 transition-all duration-1000 ease-out" strokeWidth="3" strokeDasharray={`${completionScore}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-100">{completionScore}%</span>
                  </div>
                </div>
              </div>

              {primaryProject && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">TRL Atual</span>
                      <span className="text-xl font-black text-indigo-400">{primaryProject.maturity || 1}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">IRL Score</span>
                      <span className="text-xl font-black text-emerald-400">{primaryProject.irlScore || 0}</span>
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div>
                <h2 className="text-xl font-bold text-white">Certificação de Maturidade (TRL/IRL)</h2>
                <p className="text-sm text-slate-400">Projeto: {primaryProject.title}</p>
              </div>
              <button 
                onClick={() => setShowTRLModal(false)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
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

            <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-4">
              <button 
                onClick={() => setShowTRLModal(false)}
                className="px-6 py-2 rounded-xl text-slate-400 hover:text-white transition font-medium"
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
                className="px-8 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all"
              >
                Salvar Certificação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex items-center gap-4 hover:border-slate-700 transition-all">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${bg} ${color}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
      </div>
    </div>
  );
}
