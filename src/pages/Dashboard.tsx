import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";
import { Target, Users, Zap, Star } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { explainMatch } from "../lib/matching";

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ projects: 0, matches: 0, avgScore: 0 });
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        const projSnap = await getDocs(collection(db, "projects"));
        const matchSnap = await getDocs(collection(db, "matches"));

        let totalScore = 0;
        matchSnap.docs.forEach(d => {
          totalScore += d.data().score || 0;
        });

        setStats({
          projects: projSnap.size,
          matches: matchSnap.size,
          avgScore: matchSnap.size ? Math.round(totalScore / matchSnap.size) : 0
        });

        // Buscar projetos do usuário para pegar os matches dele
        const userProjQ = query(collection(db, "projects"), where("userId", "==", user!.uid));
        const userProjSnap = await getDocs(userProjQ);
        const userProjectIds = userProjSnap.docs.map(d => d.id);

        if (userProjectIds.length > 0) {
          // Buscar matches recentes para esses projetos (simplificado, pegando os maiores scores)
          const matchesQ = query(
            collection(db, "matches"),
            where("ownerProjectId", "in", userProjectIds.slice(0, 10)),
            orderBy("score", "desc"),
            limit(3)
          );
          const recMatchesSnap = await getDocs(matchesQ);
          setRecentMatches(recMatchesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (error) {
        console.error("Erro ao carregar dashboard", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <Link 
          to="/projects/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
        >
          Novo Projeto
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Target} label="Projetos Ativos" value={loading ? "..." : stats.projects} color="text-cyan-400" bg="bg-cyan-400/10" />
        <StatCard icon={Users} label="Matches Totais" value={loading ? "..." : stats.matches} color="text-indigo-400" bg="bg-indigo-400/10" />
        <StatCard icon={Zap} label="Score Médio (Geral)" value={loading ? "..." : `${stats.avgScore}%`} color="text-amber-400" bg="bg-amber-400/10" />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Top Matches (Seus Projetos)</h2>
        
        {loading ? (
           <p className="text-slate-400">Carregando...</p>
        ) : recentMatches.length === 0 ? (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 text-center">
            <Star className="mx-auto text-slate-600 mb-2" size={32} />
            <p className="text-slate-500">Nenhum match top encontrado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recentMatches.map(match => (
              <div key={match.id} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4 hover:border-indigo-500/50 transition-all">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 rounded-full border-4 border-slate-800 flex items-center justify-center flex-shrink-0 relative">
                    <span className="font-bold text-slate-100">{match.score}%</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-200">Proj: {match.ownerProjectId.slice(-6)} 🤝 Proj: {match.targetProjectId.slice(-6)}</span>
                      {match.score >= 80 ? (
                        <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded border border-amber-500/30 uppercase font-bold tracking-wider">High Match</span>
                      ) : match.score >= 70 ? (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 uppercase font-bold tracking-wider">Good Match</span>
                      ) : null}
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 mb-2">
                      <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-1.5 rounded-full" style={{ width: `${match.score}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{explainMatch(match.breakdown)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex items-center gap-4 hover:shadow-[0_0_20px_rgba(79,70,229,0.1)] transition-all">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${bg} ${color}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
      </div>
    </div>
  );
}
