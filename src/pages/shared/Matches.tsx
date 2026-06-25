import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getMatches, updateMatchAction } from "../../services/matchService";
import { createOrGetConversation } from "../../services/chatService";
import { explainMatch } from "../../lib/matching";
import { 
  Loader2, ArrowRight, Search, Filter, 
  Zap, Lock, Heart, X, ShieldCheck, FolderOpen 
} from "lucide-react";
import { EmptyState } from "../../components/EmptyState";
import { useTranslation } from "react-i18next";

export function Matches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project");
  const { t } = useTranslation();
  
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all"); // all, saved
  const [minScore, setMinScore] = useState(60);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const data = await getMatches(projectId as string);
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

  const handleMatchAction = async (matchId: string, action: 'save' | 'ignore' | 'reset') => {
    if (!user) return;
    try {
      // Optimistic UI update
      setMatches(prev => prev.map(m => {
        if (m.id !== matchId) return m;
        
        let savedBy = m.savedBy || [];
        let ignoredBy = m.ignoredBy || [];
        
        if (action === 'save') {
          savedBy = [...new Set([...savedBy, user.uid])];
          ignoredBy = ignoredBy.filter((id: string) => id !== user.uid);
        } else if (action === 'ignore') {
          ignoredBy = [...new Set([...ignoredBy, user.uid])];
          savedBy = savedBy.filter((id: string) => id !== user.uid);
        } else {
          savedBy = savedBy.filter((id: string) => id !== user.uid);
          ignoredBy = ignoredBy.filter((id: string) => id !== user.uid);
        }
        
        return { ...m, savedBy, ignoredBy };
      }));
      
      await updateMatchAction(matchId, user.uid, action);
    } catch (err) {
      console.error("Erro ao atualizar match", err);
    }
  };

  if (!projectId) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl">
        <EmptyState
          icon={FolderOpen}
          title={t("matches.selectProject")}
          description={t("matches.selectProjectDesc")}
          ctaLabel={t("matches.goToMyProjects")}
          ctaLink="/projects"
        />
      </div>
    );
  }

  // Filtragem local
  const filteredMatches = matches.filter(m => {
    const isIgnored = m.ignoredBy?.includes(user?.uid);
    const isSaved = m.savedBy?.includes(user?.uid);
    
    if (activeFilter === "saved" && !isSaved) return false;
    if (activeFilter === "all" && isIgnored) return false;
    if (m.score < minScore) return false;
    
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{t("matches.title")}</h1>
          <p className="text-slate-400 mt-1">{t("matches.subtitle")}</p>
        </div>
        
        {/* Filtros Rapidos */}
        <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 p-1.5 rounded-lg">
          <button 
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeFilter === "all" ? "bg-indigo-500/20 text-indigo-400" : "text-slate-400 hover:text-slate-200"}`}
          >
            {t("matches.inbox")}
          </button>
          <button 
            onClick={() => setActiveFilter("saved")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeFilter === "saved" ? "bg-pink-500/20 text-pink-400" : "text-slate-400 hover:text-slate-200"}`}
          >
            {t("matches.saved")}
          </button>
        </div>
      </div>

      {/* Filtros Avancados */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter size={16} />
          <span className="text-sm font-medium">{t("matches.minScore")}</span>
          <span className="text-indigo-400 font-bold">{minScore}%</span>
        </div>
        <input 
          type="range" 
          min="50" max="95" step="5"
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value))}
          className="w-48 accent-indigo-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl">
          <EmptyState
            icon={Search}
            title={t("matches.noMatches")}
            description={t("matches.noMatchesDesc")}
            ctaLabel={t("matches.exploreOpportunities")}
            ctaLink="/explore"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((match, index) => {
            const isSaved = match.savedBy?.includes(user?.uid);

            return (
            <div key={match.id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-all flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden">
              
              {/* Highlight bar para os salvos */}
              {isSaved && <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500"></div>}

              <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 border-slate-800 relative bg-slate-900">
                <span className="text-xl font-bold text-slate-100">{match.score}%</span>
                {index === 0 && activeFilter === "all" && (
                  <div className="absolute -top-3 bg-amber-500 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                    TOP 1
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-slate-100 truncate">{t("matches.confidentialOrg")} <span className="text-slate-500 text-sm font-normal ml-2">#ID-{match.id.slice(0, 6).toUpperCase()}</span></h3>
                  
                  {match.targetStats && match.targetStats.saves > 0 && (
                    <span className="bg-pink-500/10 text-pink-400 text-xs px-2 py-0.5 rounded border border-pink-500/20 font-medium flex items-center gap-1">
                      <Zap size={12} className="fill-pink-400/20" /> {t("matches.evaluatingInvestors", { count: match.targetStats.saves })}
                    </span>
                  )}
                  {match.targetStats && match.targetStats.ndaRequests > 0 && (
                    <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2 py-0.5 rounded border border-indigo-500/20 font-medium flex items-center gap-1">
                      <Lock size={12} /> {t("matches.ndaRequested", { count: match.targetStats.ndaRequests })}
                    </span>
                  )}

                  {match.isVdrReady && (
                    <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded border border-emerald-500/20 font-medium flex items-center gap-1">
                      <ShieldCheck size={12} /> {t("matches.vdrAudited")}
                    </span>
                  )}

                  {match.score >= 80 ? (
                    <span className="bg-amber-500/10 text-amber-400 text-xs px-2 py-0.5 rounded border border-amber-500/20 font-medium">{t("matches.topFit")}</span>
                  ) : match.score >= 70 ? (
                    <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded border border-emerald-500/20 font-medium">{t("matches.goodFit")}</span>
                  ) : null}
                </div>
                
                <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 max-w-sm">
                  <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-1.5 rounded-full" style={{ width: `${match.score}%` }}></div>
                </div>

                {match.breakdown && (
                  <div className="flex flex-wrap gap-2 text-xs mb-3">
                    <span className="bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded text-slate-400">{t("matches.segment")}: <span className="text-indigo-400 font-bold ml-1">{match.breakdown.segment || 0} {t("matches.pts")}</span></span>
                    <span className="bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded text-slate-400">{t("matches.maturity")}: <span className="text-indigo-400 font-bold ml-1">{match.breakdown.maturity || 0} {t("matches.pts")}</span></span>
                    <span className="bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded text-slate-400">{t("matches.readiness")}: <span className="text-indigo-400 font-bold ml-1">{match.breakdown.readiness || 0} {t("matches.pts")}</span></span>
                    <span className="bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded text-slate-400">{t("matches.needs")}: <span className="text-indigo-400 font-bold ml-1">{match.breakdown.needs || 0} {t("matches.pts")}</span></span>
                  </div>
                )}
                <p className="text-sm text-slate-300">
                  {match.breakdown 
                    ? explainMatch(match.breakdown) 
                    : "Compatibilidade calculada por IA com base em setor, maturidade TRL e demandas."}
                </p>
              </div>

              <div className="flex-shrink-0 flex md:flex-col gap-2 w-full md:w-auto">
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
                  className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                >
                  {t("matches.interested")} <ArrowRight size={16} />
                </button>
 
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleMatchAction(match.id, isSaved ? 'reset' : 'save')}
                    className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 border ${
                      isSaved 
                        ? "bg-pink-500/10 border-pink-500/30 text-pink-400 hover:bg-pink-500/20" 
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <Heart size={16} className={isSaved ? "fill-current" : ""} /> {isSaved ? t("matches.savedLabel") : t("matches.save")}
                  </button>
                  <button 
                    onClick={() => handleMatchAction(match.id, 'ignore')}
                    className="flex-shrink-0 bg-slate-800 border border-slate-700 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-slate-400 px-3 py-2.5 rounded-lg transition-all flex items-center justify-center"
                    title={t("matches.ignore")}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

            </div>
          )})}
        </div>
      )}
    </div>
  );
}
