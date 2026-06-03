import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getExploreProjects, type ExploreFilters } from "../../services/exploreService";
import { getUserProjects } from "../../services/projectService";
import { createOrGetConversation } from "../../services/chatService";
import { explainMatch, getMatchTier, getScoreColor } from "../../lib/matching";
import {
  Loader2, Search, Filter, Compass, ArrowRight, ShieldCheck,
  SlidersHorizontal, X, CheckCircle
} from "lucide-react";
import { EmptyState } from "../../components/EmptyState";
import { useTranslation } from "react-i18next";
import { generateProjectAiBriefing } from "../../services/reportService";
import { logAudit, logActivity } from "../../services/governanceService";
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";

const FIESC_CHAMBERS = [
  "Agroindústria", "Alimentos e Bebidas", "Bens de Capital",
  "Construção Civil", "Energia", "Meio Ambiente e Sustentabilidade",
  "Tecnologia e Inovação", "Transporte e Logística"
];

const REGIONS = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];

export function Explore() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isCorporate = userProfile?.role === 'industry' || userProfile?.role === 'investor' || userProfile?.role === 'admin';
  const [dealIdsInPipeline, setDealIdsInPipeline] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user || !isCorporate) return;

    const q = query(collection(db, "deals"), where("companyId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ids = new Set<string>();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.projectId) {
          ids.add(data.projectId);
        }
      });
      setDealIdsInPipeline(ids);
    }, (error) => {
      console.error("Erro ao escutar deals:", error);
    });

    return () => unsubscribe();
  }, [user, isCorporate]);

  const handleAddToDealFlow = async (project: any) => {
    if (!user || !userProfile) return;
    try {
      const dealId = `${user.uid}_${project.id}`;
      const dealRef = doc(db, "deals", dealId);
      
      const newDeal = {
        id: dealId,
        projectId: project.id,
        projectName: project.title || "Projeto Confidencial",
        companyId: user.uid,
        stage: "descoberta",
        score: project.score || 70,
        lastUpdate: "Adicionado agora",
        updatedAt: serverTimestamp(),
        probability: 10,
        ownerUserId: project.userId || "",
        ownerName: userProfile.name || "Marcelo Filho",
        estimatedValue: 500000,
        expectedCloseDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nextAction: "Agendar reunião de triagem"
      };

      await setDoc(dealRef, newDeal);

      const actor = {
        uid: user.uid,
        name: userProfile.name || user.displayName || user.email || "Usuário",
        email: user.email || "",
        role: userProfile.role || "industry"
      };

      await logAudit(
        actor,
        "deal.created",
        project.id,
        project.title || "Projeto",
        null,
        newDeal
      );

      await logActivity(
        "deal.created",
        actor.name,
        project.id,
        project.title || "Projeto",
        { stage: "descoberta" }
      );

    } catch (err) {
      console.error("Erro ao adicionar projeto ao funil:", err);
      alert("Erro ao adicionar projeto ao funil.");
    }
  };
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<ExploreFilters>({
    segment: "",
    minTrl: undefined,
    minScore: 50,
    region: "",
    search: "",
    fomento: "",
    investmentStage: undefined,
    ticketRange: undefined,
    onlyIctVerified: undefined
  });

  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // States and Handlers for AI Scouting Briefing (Virtual Analyst)
  const [briefingProject, setBriefingProject] = useState<any | null>(null);
  const [generatingBriefing, setGeneratingBriefing] = useState(false);
  const [aiBriefingText, setAiBriefingText] = useState("");

  const handleOpenBriefing = async (project: any) => {
    setBriefingProject(project);
    
    // Log do inicio de leitura no Audit Trail
    const actor = {
      uid: user?.uid || "",
      name: userProfile?.name || user?.displayName || user?.email || "Usuário",
      email: user?.email || "",
      role: userProfile?.role || "industry"
    };

    await logAudit(
      actor,
      "ai.scout.view",
      project.id,
      project.title || "Projeto",
      null,
      { action: "open_briefing" }
    );

    if (project.lastAiReport?.content) {
      setAiBriefingText(project.lastAiReport.content);
    } else {
      setAiBriefingText("");
    }
  };

  const handleTriggerBriefing = async () => {
    if (!briefingProject) return;
    setGeneratingBriefing(true);
    try {
      const content = await generateProjectAiBriefing(briefingProject.id);
      
      // Update local state and results list so it displays instantly
      setAiBriefingText(content);
      setResults(prev => prev.map(p => p.id === briefingProject.id ? {
        ...p,
        lastAiReport: {
          content,
          generatedAt: new Date(),
          version: "1.0"
        }
      } : p));

      // Log do trigger no Audit Trail
      const actor = {
        uid: user?.uid || "",
        name: userProfile?.name || user?.displayName || user?.email || "Usuário",
        email: user?.email || "",
        role: userProfile?.role || "industry"
      };

      await logAudit(
        actor,
        "ai.scout.generate",
        briefingProject.id,
        briefingProject.title || "Projeto",
        null,
        { version: "1.0", poweredBy: "NVIDIA NIM (Llama 3.1)" }
      );

    } catch (err) {
      console.error("Erro ao gerar briefing:", err);
      alert("Falha ao gerar inteligência. Tente novamente em instantes.");
    } finally {
      setGeneratingBriefing(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    getUserProjects(user.uid).then(setUserProjects).catch(console.error);
  }, [user]);

  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!user || !userProfile) return;
    setLastDoc(null);
    setHasMore(true);
    loadResults(false, null);
  }, [user, userProfile, userProjects, reloadTrigger]);

  const loadResults = async (isLoadMore = false, customCursor?: any) => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const cursorToUse = isLoadMore ? (customCursor !== undefined ? customCursor : lastDoc) : null;
      const response = await getExploreProjects(
        { ...userProfile, uid: user?.uid },
        userProjects,
        filters,
        6, // Page Size
        cursorToUse
      );
      
      if (isLoadMore) {
        setResults(prev => [...prev, ...response.projects]);
      } else {
        setResults(response.projects);
      }
      
      setLastDoc(response.lastDoc);
      setHasMore(response.projects.length > 0 && response.lastDoc !== null);
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
    setFilters({ 
      segment: "", 
      minTrl: undefined, 
      minScore: 50, 
      region: "", 
      search: "", 
      fomento: "",
      investmentStage: undefined,
      ticketRange: undefined,
      onlyIctVerified: undefined
    });
    setReloadTrigger(t => t + 1);
  };

  const hasActiveFilters = 
    filters.segment || 
    filters.minTrl || 
    filters.region || 
    filters.fomento || 
    filters.investmentStage || 
    filters.ticketRange || 
    filters.onlyIctVerified || 
    (filters.minScore && filters.minScore > 50);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Compass className="text-indigo-400" size={24} /> {t("explore.title")}
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {t("explore.subtitle")}
          </p>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-medium transition-all border border-slate-700 text-sm md:hidden"
        >
          <SlidersHorizontal size={16} /> {t("explore.filters")}
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
              placeholder={t("explore.searchPlaceholder")}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          <button 
            onClick={handleSearch}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all text-sm flex items-center gap-2"
          >
            <Search size={16} /> {t("explore.search")}
          </button>
        </div>

        {/* Filters row */}
        <div className={`flex flex-wrap gap-3 items-center ${showFilters ? 'block' : 'hidden md:flex'}`}>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Filter size={14} /> {t("explore.filters")}:
          </div>
          
          <select
            value={filters.segment || ""}
            onChange={e => setFilters({ ...filters, segment: e.target.value })}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="">{t("explore.allSegments")}</option>
            {FIESC_CHAMBERS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={filters.minTrl || ""}
            onChange={e => setFilters({ ...filters, minTrl: e.target.value ? Number(e.target.value) : undefined })}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="">{t("explore.allTrls")}</option>
            {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>TRL {n}+</option>)}
          </select>

          <select
            value={filters.region || ""}
            onChange={e => setFilters({ ...filters, region: e.target.value })}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="">{t("explore.allRegions")}</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select
            value={filters.fomento || ""}
            onChange={e => setFilters({ ...filters, fomento: e.target.value })}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="">{t("explore.allFomentos")}</option>
            {["FINEP", "Embrapii", "CNPq", "FAPESC", "SENAI"].map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          <select
            value={filters.investmentStage || ""}
            onChange={e => setFilters({ ...filters, investmentStage: e.target.value })}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="">Estágio de Desenvolvimento</option>
            <option value="concept">Idea / Concept (TRL 1-3)</option>
            <option value="prototype">Prototype / Lab (TRL 4-6)</option>
            <option value="market">Market Ready (TRL 7-9)</option>
          </select>

          <select
            value={filters.ticketRange || ""}
            onChange={e => setFilters({ ...filters, ticketRange: e.target.value })}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="">Ticket de Financiamento</option>
            <option value="50k">&lt; R$ 250k (Pre-Seed/Seed)</option>
            <option value="250k">R$ 250k - R$ 1M (Growth)</option>
            <option value="1m">&gt; R$ 1M (Corporate VC)</option>
          </select>

          <label htmlFor="ictFilter" className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 cursor-pointer hover:border-indigo-500 transition duration-200">
            <input 
              type="checkbox" 
              id="ictFilter" 
              checked={!!filters.onlyIctVerified}
              onChange={e => setFilters({ ...filters, onlyIctVerified: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded border-slate-700 bg-slate-950 focus:ring-indigo-500 focus:ring-offset-0" 
            />
            <span className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400"/> Somente ICT Verified
            </span>
          </label>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{t("explore.minScore")}:</span>
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
              <X size={12} /> {t("explore.clear")}
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
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl">
          <EmptyState
            icon={Compass}
            title={t("explore.noOpportunities")}
            description={hasActiveFilters ? t("explore.adjustFilters") : t("explore.awaitRegisters")}
            ctaLabel={hasActiveFilters ? t("explore.clearFilters") : undefined}
            onCtaClick={hasActiveFilters ? clearFilters : undefined}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">{t("explore.resultsFound", { count: results.length })}</p>
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
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100 truncate">
                      {project.title || t("explore.confidentialProject")}
                    </h3>
                    
                    {tier.label && (
                      <span className={`${tier.bgColor} ${tier.color} text-[10px] px-2 py-0.5 rounded border ${tier.borderColor} font-bold`}>
                        {tier.label}
                      </span>
                    )}

                    {project.isVdrReady && (
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-500/20 font-medium flex items-center gap-1">
                        <ShieldCheck size={10} /> {t("explore.vdrAudited")}
                      </span>
                    )}

                    {(project.isIctVerified || project.validatedMaturity) && (
                      <span className="bg-indigo-500/10 text-indigo-400 text-[10px] px-2 py-0.5 rounded border border-indigo-500/20 font-bold flex items-center gap-1">
                        <ShieldCheck size={10} className="text-indigo-400" /> {t("explore.ictVerified")}
                      </span>
                    )}
                  </div>
                  
                  {/* The Hook/Summary */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {project.summary || "Sem descrição detalhada disponível."}
                  </p>

                  {/* Highlights (Invstor-style badges) */}
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded flex items-center gap-1">
                      💰 Busca: {project.ticketRange === '50k' ? '< R$ 250k' : project.ticketRange === '250k' ? 'R$ 250k - R$ 1M' : project.ticketRange === '1m' ? '> R$ 1M' : 'Sob Consulta'}
                    </span>
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded flex items-center gap-1">
                      ⚙️ TRL {project.declaredTRL || project.maturity || 1}
                    </span>
                    {project.isIctVerified && (
                      <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-1 rounded flex items-center gap-1">
                        🛡️ ICT: {project.ictName || "Inatel"}
                      </span>
                    )}
                    {project.location?.region && (
                      <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-1 rounded flex items-center gap-1">
                        📍 {project.location.region}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500">{explainMatch(project.breakdown)}</p>

                  {/* GATILHO DE ESCASSEZ (PAYWALL / NDA) */}
                  <div className="border-t border-slate-800/80 pt-3 mt-1">
                    {userProfile?.subscriptionStatus !== 'premium' ? (
                      <div className="relative group cursor-pointer" onClick={() => navigate('/pricing')}>
                        {/* Camada borrada */}
                        <div className="blur-[4px] opacity-40 select-none text-[11px] text-slate-500 space-y-1">
                          <p>Pesquisador Principal: Dr. Alberto Ferreira</p>
                          <p>Patente/Registro: Concedida (BR 10 2024 001234 5)</p>
                        </div>
                        {/* Cadeado sobreposto */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-indigo-650 hover:bg-indigo-650 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-all border border-indigo-500/30">
                            🔒 Assine o Plano Corporate para ver a Patente
                          </span>
                        </div>
                      </div>
                    ) : (
                      // Visão liberada para quem pagou
                      <div className="text-[11px] space-y-1 text-slate-400">
                        <p><strong className="text-slate-300">Pesquisador Principal:</strong> {project.researcher || "Prof. Rafael Silva"}</p>
                        <p>
                          <strong className="text-slate-300">Patente/Registro:</strong>{" "}
                          <span className="text-indigo-400 font-bold hover:underline cursor-pointer">
                            {project.patentStatus || "Concedida (BR 10 2024)"}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="flex-shrink-0 flex flex-col gap-2">
                  <button 
                    onClick={() => handleConnect(project)}
                    disabled={connecting === project.id || userProjects.length === 0}
                    className="bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-900 disabled:text-slate-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.2)] w-full md:w-auto justify-center"
                  >
                    {connecting === project.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <>{t("explore.startConnection")} <ArrowRight size={16} /></>
                    )}
                  </button>

                  {isCorporate && (
                    dealIdsInPipeline.has(project.id) ? (
                      <div className="flex items-center justify-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-4 py-2 rounded-xl text-xs font-bold w-full md:w-auto">
                        <CheckCircle size={14} />
                        <span>No Pipeline</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToDealFlow(project)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 w-full md:w-auto"
                      >
                        <span>➕ Pipeline</span>
                      </button>
                    )
                  )}

                  {(userProfile?.subscriptionStatus === 'premium' || 
                    userProfile?.subscriptionStatus === 'enterprise' || 
                    userProfile?.role === 'admin' ||
                    userProfile?.role === 'ict' ||
                    userProfile?.role === 'investor' ||
                    userProfile?.role === 'industry') && (
                    <button
                      onClick={() => handleOpenBriefing(project)}
                      className="bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(217,70,239,0.15)] w-full md:w-auto"
                    >
                      <span>✨ Analista IA</span>
                    </button>
                  )}

                  {userProjects.length === 0 && (
                    <p className="text-[10px] text-amber-400 mt-1 text-center">{t("explore.registerProjectFirst")}</p>
                  )}
                </div>
              </div>
            );
          })}
          
          {hasMore && (
            <div className="flex justify-center pt-6">
              <button 
                onClick={() => loadResults(true)}
                disabled={loading}
                className="bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 font-bold px-6 py-3 rounded-xl transition text-sm flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : "Carregar Mais Projetos"}
              </button>
            </div>
          )}
        </div>
      )}
      {/* AI Scouting Radar Virtual Analyst Briefing (Slide-Over / Modal) */}
      {briefingProject && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500/10 to-indigo-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                  <Compass size={22} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    AI Scouting Briefing
                    <span className="text-[9px] px-2 py-0.5 rounded bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 font-bold uppercase tracking-wider">
                      Virtual Analyst
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500">Relatório Estratégico de Inovação Profunda</p>
                </div>
              </div>
              <button 
                onClick={() => setBriefingProject(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/20">
              
              {/* Project Abstract */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projeto Alvo</h5>
                <h3 className="text-lg font-bold text-slate-100">{briefingProject.title}</h3>
                <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-bold">
                  <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                    Maturidade: TRL {briefingProject.declaredTRL || briefingProject.maturity || 1}
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                    Fomento: {briefingProject.fomento || "N/A"}
                  </span>
                  <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                    Região: {briefingProject.location?.region || "Sul"}
                  </span>
                </div>
              </div>

              {/* Briefing body */}
              {generatingBriefing ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="animate-spin text-fuchsia-500" size={40} />
                  <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-slate-300 animate-pulse">Llama 3.1 Executando Prospecção...</p>
                    <p className="text-xs text-slate-500">Mapeando TRL, market-fit, incentivos fiscais e SWOT com NVIDIA NIM.</p>
                  </div>
                </div>
              ) : aiBriefingText ? (
                <div className="prose prose-invert prose-xs max-w-none text-slate-300 leading-relaxed font-sans space-y-4">
                  {aiBriefingText.split("\n").map((line, idx) => {
                    if (line.trim().startsWith("### ")) {
                      return <h4 key={idx} className="text-sm font-bold text-slate-200 mt-6 mb-2">{line.replace("### ", "")}</h4>;
                    }
                    if (line.trim().startsWith("## ")) {
                      return <h3 key={idx} className="text-base font-bold text-indigo-400 mt-8 mb-3 border-b border-slate-800 pb-2">{line.replace("## ", "")}</h3>;
                    }
                    if (line.trim().startsWith("# ")) {
                      return <h2 key={idx} className="text-lg font-bold text-white mt-10 mb-4">{line.replace("# ", "")}</h2>;
                    }
                    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
                      return <li key={idx} className="ml-4 list-disc text-xs text-slate-400">{line.trim().substring(2)}</li>;
                    }
                    return <p key={idx} className="text-xs text-slate-400 leading-normal">{line}</p>;
                  })}
                </div>
              ) : (
                // Unprocessed / CTA to generate
                <div className="border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-6 py-16 bg-slate-900/20">
                  <div className="w-16 h-16 rounded-full bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center mx-auto">
                    <Compass size={28} className="animate-pulse" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h4 className="text-slate-200 font-bold">Relatório do Analista Virtual Não Gerado</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Ainda não compilamos o briefing executivo inteligente para este ativo deep tech. Clique no botão abaixo para rodar o radar cognitivo.
                    </p>
                  </div>
                  <button
                    onClick={handleTriggerBriefing}
                    className="bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all"
                  >
                    Solicitar Briefing do Analista Virtual (NVIDIA NIM)
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center text-[10px] text-slate-500 font-mono shrink-0">
              <span>Powered by NVIDIA NIM & Llama 3.1</span>
              <span>Classificação: Confidencial Enterprise</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
