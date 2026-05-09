import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";
import { Target, Users, Zap, Star, Activity, ArrowRight, ShieldCheck, ChevronRight, Briefcase, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { explainMatch } from "../lib/matching";

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ projects: 0, matches: 0, avgScore: 0 });
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [radarCount, setRadarCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [completionScore, setCompletionScore] = useState(0);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        // Buscar projetos do usuário
        const userProjQ = query(collection(db, "projects"), where("userId", "==", user!.uid));
        const userProjSnap = await getDocs(userProjQ);
        const userProjects = userProjSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
        const userProjectIds = userProjects.map(p => p.id);

        // Calcular Completude do Perfil (Baseado nos projetos)
        if (userProjects.length > 0) {
          const firstProj = userProjects[0];
          let score = 30; // Tem projeto
          if (firstProj.title) score += 20;
          if (firstProj.segment) score += 20;
          if (firstProj.maturity) score += 10;
          if (firstProj.needs && Object.values(firstProj.needs).some(v => v)) score += 20;
          setCompletionScore(Math.min(score, 100));

          // Radar de Oportunidades
          const allSegments = [...new Set(userProjects.map(p => p.segment))].filter(Boolean);
          if (allSegments.length > 0) {
            const orgsQ = query(
              collection(db, "users"),
              where("role", "in", ["company", "investor"]),
              where("segments", "array-contains-any", allSegments)
            );
            const orgsSnap = await getDocs(orgsQ);
            setRadarCount(orgsSnap.size);
          } else {
            setRadarCount(0);
          }
        } else {
          setCompletionScore(10); // Apenas conta criada
          setRadarCount(0);
        }

        // Buscar todos os matches relacionados ao usuário
        if (userProjectIds.length > 0) {
          const matchesQ = query(
            collection(db, "matches"),
            where("ownerProjectId", "in", userProjectIds.slice(0, 10)),
            orderBy("score", "desc")
          );
          const matchSnap = await getDocs(matchesQ);
          
          let totalScore = 0;
          matchSnap.docs.forEach(d => {
            totalScore += d.data().score || 0;
          });

          setStats({
            projects: userProjects.length,
            matches: matchSnap.size,
            avgScore: matchSnap.size ? Math.round(totalScore / matchSnap.size) : 0
          });

          setRecentMatches(matchSnap.docs.slice(0, 3).map(d => ({ id: d.id, ...d.data() })));
        } else {
          setStats({ projects: 0, matches: 0, avgScore: 0 });
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
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Visão Geral</h1>
          <p className="text-slate-400 mt-1">Acompanhe a tração dos seus projetos e negociações ativas.</p>
        </div>
        <Link 
          to="/projects/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] flex items-center gap-2"
        >
          <Target size={18} /> Novo Projeto
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BLOCO 1: Score do Projeto & Stats (Lado Esquerdo) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-sm font-medium text-slate-400 mb-2 relative z-10">Prontidão para o Mercado</p>
              
              {/* Radial Progress Customizado */}
              <div className="relative w-24 h-24 flex items-center justify-center z-10">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-indigo-500 transition-all duration-1000 ease-out"
                    strokeWidth="3"
                    strokeDasharray={`${completionScore}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-100">{completionScore}%</span>
                </div>
              </div>
            </div>

            <StatCard icon={Users} label="Matches Totais" value={stats.matches} color="text-indigo-400" bg="bg-indigo-400/10" />
            <StatCard icon={Zap} label="Score Médio" value={`${stats.avgScore}%`} color="text-amber-400" bg="bg-amber-400/10" />
          </div>

          {/* BLOCO 2: Matches em Destaque */}
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
                <p className="text-slate-400 font-medium">Nenhum match top encontrado ainda.</p>
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
                        <span className="font-medium text-slate-200">Parceiro Estratégico</span>
                        {match.score >= 80 && (
                          <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded border border-amber-500/30 font-bold tracking-wider">TOP FIT</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{explainMatch(match.breakdown)}</p>
                    </div>
                    <Link to={`/matches?project=${match.ownerProjectId}`} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                      Analisar
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito */}
        <div className="space-y-6">
          
          {/* BLOCO 5: Radar de Oportunidades */}
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
                Adicione projetos com segmentos definidos para ligarmos o radar de empresas compatíveis.
              </p>
            )}
          </div>

          {/* BLOCO 4: Próximos Passos */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Próximos Passos</h3>
            <div className="space-y-3">
              {completionScore < 100 && (
                <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex gap-3">
                  <div className="text-indigo-400 mt-0.5"><ShieldCheck size={18} /></div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">Complete seu Perfil</h4>
                    <p className="text-xs text-slate-400 mt-1 mb-2">Projetos completos convertem 3x mais matches.</p>
                    <Link to="/projects" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      Completar Agora <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              )}
              {stats.matches > 0 && (
                <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex gap-3">
                  <div className="text-emerald-400 mt-0.5"><Briefcase size={18} /></div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">Triagem de Matches</h4>
                    <p className="text-xs text-slate-400 mt-1 mb-2">Você tem matches aguardando revisão. Defina os melhores.</p>
                    <Link to="/matches" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                      Ver Matches <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
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
