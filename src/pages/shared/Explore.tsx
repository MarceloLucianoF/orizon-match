import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getExploreProjects, type ExploreFilters } from "../../services/exploreService";
import { getUserProjects } from "../../services/projectService";
import { createOrGetConversation } from "../../services/chatService";
import { explainMatch, getMatchTier, getScoreColor } from "../../lib/matching";
import {
  Loader2, Search, Filter, Compass, ArrowRight, ShieldCheck,
  MapPin, SlidersHorizontal, X
} from "lucide-react";

const FIESC_CHAMBERS = [
  "Agroindústria", "Alimentos e Bebidas", "Bens de Capital",
  "Construção Civil", "Energia", "Meio Ambiente e Sustentabilidade",
  "Tecnologia e Inovação", "Transporte e Logística"
];

const REGIONS = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];

export function Explore() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<ExploreFilters>({
    segment: "",
    minTrl: undefined,
    minScore: 50,
    region: "",
    search: ""
  });

  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    if (!user) return;
    getUserProjects(user.uid).then(setUserProjects).catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!user || !userProfile) return;
    loadResults();
  }, [user, userProfile, userProjects, reloadTrigger]);

  const loadResults = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const data = await getExploreProjects(
        { ...userProfile, uid: user?.uid },
        userProjects,
        filters
      );
      setResults(data);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setReloadTrigger(t => t + 1);
  };

  const handleConnect = async (project: any) => {
    if (!user || userProjects.length === 0) return;
    setConnecting(project.id);
    try {
      const myProject = userProjects[0];
      const convId = await createOrGetConversation(
        `${myProject.id}_${project.id}`,
        myProject.id,
        project.userId,
        user.uid,
        project.title || "Projeto"
      );
      navigate(`/chat?id=${convId}`);
    } catch (error) {
      console.error("Erro ao iniciar conexão:", error);
    } finally {
      setConnecting(null);
    }
  };

  const clearFilters = () => {
    setFilters({ segment: "", minTrl: undefined, minScore: 50, region: "", search: "" });
    setReloadTrigger(t => t + 1);
  };

  const hasActiveFilters = filters.segment || filters.minTrl || filters.region || (filters.minScore && filters.minScore > 50);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Compass className="text-indigo-400" size={24} /> Explorar Oportunidades
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Descubra projetos e organizações compatíveis com seu perfil.
          </p>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-medium transition-all border border-slate-700 text-sm md:hidden"
        >
          <SlidersHorizontal size={16} /> Filtros
        </button>
      </div>

      {/* Search + Filters */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-4">
        {/* Search bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              value={filters.search || ""}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Buscar por título, segmento ou palavra-chave..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          <button 
            onClick={handleSearch}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all text-sm flex items-center gap-2"
          >
            <Search size={16} /> Buscar
          </button>
        </div>

        {/* Filters row */}
        <div className={`flex flex-wrap gap-3 items-center ${showFilters ? 'block' : 'hidden md:flex'}`}>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Filter size={14} /> Filtros:
          </div>
          
          <select
            value={filters.segment || ""}
            onChange={e => setFilters({ ...filters, segment: e.target.value })}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="">Todos os Segmentos</option>
            {FIESC_CHAMBERS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={filters.minTrl || ""}
            onChange={e => setFilters({ ...filters, minTrl: e.target.value ? Number(e.target.value) : undefined })}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="">Todos os TRLs</option>
            {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>TRL {n}+</option>)}
          </select>

          <select
            value={filters.region || ""}
            onChange={e => setFilters({ ...filters, region: e.target.value })}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="">Todas as Regiões</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Score min:</span>
            <span className="font-bold text-indigo-400">{filters.minScore || 50}%</span>
            <input 
              type="range" 
              min="0" max="90" step="10"
              value={filters.minScore || 50}
              onChange={e => setFilters({ ...filters, minScore: Number(e.target.value) })}
              className="w-24 accent-indigo-500"
            />
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition">
              <X size={12} /> Limpar
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      ) : results.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
          <Compass className="mx-auto text-slate-600 mb-4" size={48} />
          <h2 className="text-lg font-semibold text-slate-300 mb-2">Nenhuma oportunidade encontrada</h2>
          <p className="text-slate-500 text-sm mb-4">Ajuste os filtros ou aguarde novos cadastros no ecossistema.</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2 rounded-lg text-sm transition">
              Limpar Filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">{results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}</p>
          {results.map((project, idx) => {
            const tier = getMatchTier(project.score);
            const scoreColor = getScoreColor(project.score);
            
            return (
              <div key={project.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-5 hover:border-indigo-500/30 transition-all flex flex-col md:flex-row md:items-center gap-4 md:gap-6 relative overflow-hidden">
                {/* Score circle */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-slate-800 relative bg-slate-900">
                  <span className={`text-lg md:text-xl font-bold ${scoreColor}`}>{project.score}%</span>
                  {idx === 0 && (
                    <div className="absolute -top-3 bg-amber-500 text-amber-950 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                      TOP 1
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="text-base font-bold text-slate-100 truncate">
                      {project.title || "Projeto Confidencial"}
                    </h3>
                    
                    {tier.label && (
                      <span className={`${tier.bgColor} ${tier.color} text-[10px] px-2 py-0.5 rounded border ${tier.borderColor} font-bold`}>
                        {tier.label}
                      </span>
                    )}

                    {project.isVdrReady && (
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-500/20 font-medium flex items-center gap-1">
                        <ShieldCheck size={10} /> VDR Auditado
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-[11px] mb-2">
                    {project.segment && (
                      <span className="bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded text-slate-400">
                        {project.segment}
                      </span>
                    )}
                    {project.maturity && (
                      <span className="bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded text-slate-400">
                        TRL {project.maturity}
                      </span>
                    )}
                    {project.location?.region && (
                      <span className="bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded text-slate-400 flex items-center gap-1">
                        <MapPin size={10} /> {project.location.region}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">{explainMatch(project.breakdown)}</p>
                </div>

                {/* Action */}
                <div className="flex-shrink-0">
                  <button 
                    onClick={() => handleConnect(project)}
                    disabled={connecting === project.id || userProjects.length === 0}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.2)] w-full md:w-auto justify-center"
                  >
                    {connecting === project.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <>Iniciar Conexão <ArrowRight size={16} /></>
                    )}
                  </button>
                  {userProjects.length === 0 && (
                    <p className="text-[10px] text-amber-400 mt-1 text-center">Cadastre um projeto primeiro</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
