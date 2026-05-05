import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getMatches } from "../services/matchService";
import { createOrGetConversation } from "../services/chatService";
import { explainMatch } from "../lib/matching";
import { Loader2, ArrowRight, Star } from "lucide-react";

export function Matches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project");
  
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const data = await getMatches(projectId as string);
        // Ordenar por score DESC
        const sorted = (data as any[]).sort((a, b) => b.score - a.score);
        setMatches(sorted);
      } catch (err) {
        console.error("Error loading matches", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  if (!projectId) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center">
        <h2 className="text-xl font-semibold text-slate-200 mb-2">Selecione um projeto</h2>
        <p className="text-slate-400 mb-6">Você precisa selecionar um projeto para ver seus matches.</p>
        <Link to="/projects" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium">
          Ir para Meus Projetos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Ranking de Compatibilidade</h1>
          <p className="text-slate-400 mt-1">Os melhores parceiros para o seu projeto, baseados no nosso algoritmo.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center">
          <Star className="mx-auto text-slate-600 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-slate-300 mb-2">Nenhum match encontrado ainda</h2>
          <p className="text-slate-500">Nosso algoritmo não encontrou projetos com score acima de 70% para o seu perfil.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match, index) => (
            <div key={match.id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all flex flex-col md:flex-row md:items-center gap-6">
              
              <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 border-slate-800 relative">
                <span className="text-xl font-bold text-slate-100">{match.score}%</span>
                {index === 0 && (
                  <div className="absolute -top-3 bg-amber-500 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    TOP 1
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-slate-100">Projeto Oculto (ID: {match.targetProjectId.slice(-6)})</h3>
                  <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2 py-1 rounded border border-indigo-500/20">Alta Sinergia</span>
                </div>
                
                <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
                  <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2 rounded-full" style={{ width: `${match.score}%` }}></div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-2">
                  <span>Segmento: <strong className="text-slate-300">{match.breakdown.segment} pts</strong></span>
                  <span>Maturidade: <strong className="text-slate-300">{match.breakdown.maturity} pts</strong></span>
                  <span>Necessidades: <strong className="text-slate-300">{match.breakdown.needs} pts</strong></span>
                  <span>Localização: <strong className="text-slate-300">{match.breakdown.location} pts</strong></span>
                </div>
                <p className="text-sm font-medium text-slate-300">{explainMatch(match.breakdown)}</p>
              </div>

              <div className="flex-shrink-0">
                <button 
                  onClick={async () => {
                    if (!user || !projectId) return;
                    try {
                      const convId = await createOrGetConversation(
                        match.id,
                        projectId,
                        match.targetProjectId,
                        user.uid,
                        "Projeto Oculto"
                      );
                      navigate(`/chat?id=${convId}`);
                    } catch (err) {
                      console.error("Erro ao iniciar conversa", err);
                    }
                  }}
                  className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  Tenho interesse <ArrowRight size={18} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
