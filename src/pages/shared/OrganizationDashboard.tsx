import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../firebase/config";
import { 
  collection, query, where, getDocs, 
  doc, getDoc, updateDoc 
} from "firebase/firestore";
import { 
  Building2, FileText, Search, Zap,
  BarChart3, ShieldCheck, Plus, 
  Cpu, Award, Coins, Scale, Settings, GraduationCap,
  AlertTriangle, CheckCircle2, Briefcase
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface Stats {
  totalProjects: number;
  totalAssets: number;
  totalInventors: number;
  activeMatches: number;
}

interface OrgData {
  id?: string;
  name: string;
  type: string;
  managers: string[];
}

export default function OrganizationDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    totalAssets: 0,
    totalInventors: 0,
    activeMatches: 0
  });
  const [org, setOrg] = useState<OrgData | null>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock laboratories list (Vitrine Tecnológica)
  const [labs, setLabs] = useState([
    { id: 1, name: "Centro de Referência em Radiocomunicações (CRR)", area: "Telecomunicações / RF", equipment: "Analisador de Espectro de 110 GHz, Câmara Anecoica Blindada", capacity: "Caracterização de antenas, testes de conformidade 5G/6G", occupancy: 40, projectsCount: 2 },
    { id: 2, name: "Wireless & AI Lab (WAI Lab)", area: "Inteligência Artificial / Computação Móvel", equipment: "Cluster GPU Nvidia DGX, Módulos SDR (Software Defined Radio)", capacity: "Otimização de canais de RF com aprendizado de máquina, redes neurais aplicadas a telecom", occupancy: 80, projectsCount: 4 },
    { id: 3, name: "Laboratório WOCA (Wireless and Optical Convergent Access)", area: "Fotônica / Redes de Acesso", equipment: "Fusora de Fibra Óptica de Precisão, Medidor de Potência Óptica de Alta Resolução", capacity: "Integração entre redes sem fio e fibra óptica (backhaul/fronthaul)", occupancy: 60, projectsCount: 3 }
  ]);

  const [newLabName, setNewLabName] = useState("");
  const [newLabArea, setNewLabArea] = useState("");
  const [newLabEquip, setNewLabEquip] = useState("");

  const handleAddLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabName || !newLabArea) return;
    setLabs([
      ...labs,
      {
        id: Date.now(),
        name: newLabName,
        area: newLabArea,
        equipment: newLabEquip || "N/A",
        capacity: "Nova competência de pesquisa homologada",
        occupancy: 10,
        projectsCount: 0
      }
    ]);
    setNewLabName("");
    setNewLabArea("");
    setNewLabEquip("");
    setActiveTab("overview");
  };

  // Mock Funding Calls (Radar de Fomento)
  const fundingCalls = [
    { id: 1, agency: "FINEP", title: "Mais Inovação Brasil - Telecom & Semicondutores", amount: "Até R$ 5M", matchScore: 94, deadline: "15/07/2026", segment: "Telecom/Hardware" },
    { id: 2, agency: "Embrapii", title: "Chamada Unidades EMBRAPII - Hard Tech & IoT", amount: "Subsídio de 50%", matchScore: 92, deadline: "30/08/2026", segment: "Indústria 4.0/IoT" },
    { id: 3, agency: "FAPEMIG", title: "Programa Centelha III - Minas Gerais", amount: "Até R$ 100K", matchScore: 85, deadline: "10/06/2026", segment: "Hardware/Telecom" }
  ];

  // Mock Researchers (Lattes Integration)
  const [researchersSearch, setResearchersSearch] = useState("");
  const researchers = [
    { id: 1, name: "Prof. Dr. Rafael Silva", title: "Coordenador no CRR / Inatel", expertise: "Antenas inteligentes, Redes 5G/6G, Hardware RF", hIndex: 34, patents: 8, compatibility: 96, image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
    { id: 2, name: "Dr. André Lourenço", title: "Pesquisador Sênior no WAI Lab", expertise: "Redes Neurais, IoT Industrial, Algoritmos de Borda", hIndex: 28, patents: 4, compatibility: 89, image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80" },
    { id: 3, name: "Dra. Camila Santos", title: "Pesquisadora de Segurança Cibernética", expertise: "Segurança de Redes, Criptografia Pós-Quântica, IoT", hIndex: 22, patents: 12, compatibility: 85, image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" }
  ];

  const filteredResearchers = researchers.filter(r => 
    r.name.toLowerCase().includes(researchersSearch.toLowerCase()) || 
    r.expertise.toLowerCase().includes(researchersSearch.toLowerCase())
  );

  // PI Settings (Balcão de PI)
  const [royaltyRate, setRoyaltyRate] = useState(3.5);
  const [allowExclusive, setAllowExclusive] = useState(true);
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [activePatents] = useState([
    { id: 1, title: "Topologia de Circuito RF de Baixa Latência para Gateway 5G", inpi: "BR 10 2024 001234 5", trl: 6, status: "licensingAvailable" },
    { id: 2, title: "Sistema de Roteamento Dinâmico em Redes Mesh LTE", inpi: "BR 10 2023 008910 2", trl: 5, status: "licensingActive" },
    { id: 3, title: "Algoritmo de Detecção de Intrusão Baseado em Assinaturas de Sinal", inpi: "BR 10 2025 000456 1", trl: 4, status: "licensingAvailable" }
  ]);

  const handleSaveConfig = () => {
    setIsConfigSaving(true);
    setTimeout(() => {
      setIsConfigSaving(false);
    }, 800);
  };

  const handleValidateTRL = async (projectId: string, declaredTRL: number) => {
    try {
      const projRef = doc(db, "projects", projectId);
      await updateDoc(projRef, {
        isIctVerified: true,
        validatedTRL: declaredTRL,
        vdrStatus: "green"
      });
      setRecentProjects(prev => 
        prev.map(p => p.id === projectId ? { ...p, isIctVerified: true, validatedTRL: declaredTRL, vdrStatus: "green" } : p)
      );
      alert("Projeto homologado com sucesso! Selo 'ICT Verified' concedido e TRL Validado.");
    } catch (err) {
      console.error("Erro ao validar TRL:", err);
      alert("Erro ao homologar projeto.");
    }
  };

  useEffect(() => {
    async function loadOrgData() {
      if (!user) return;
      
      try {
        // 1. Get User Profile to find orgId or check role
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          setLoading(false);
          return;
        }
        
        const userData = userDoc.data();
        const isIct = userData.role === 'ict';
        let orgId = "";
        
        if (isIct) {
          orgId = user.uid;
          setOrg({
            id: orgId,
            name: userData.name || "Inatel - NGTI & Unidade EMBRAPII ICC",
            type: "ICT",
            managers: [user.uid]
          });
        } else {
          orgId = userData.orgId;
          if (!orgId) {
            setLoading(false);
            return;
          }
          const orgDoc = await getDoc(doc(db, "organizations", orgId));
          if (orgDoc.exists()) {
            setOrg({ id: orgDoc.id, ...orgDoc.data() } as any);
          } else {
            setOrg({
              id: orgId,
              name: "Inatel - NGTI & Unidade EMBRAPII ICC",
              type: "ICT",
              managers: [user.uid]
            });
          }
        }

        // 3. Get Stats (All projects/assets linked to this org)
        const projectsQuery = query(collection(db, "projects"));
        const projectsSnap = await getDocs(projectsQuery);
        
        const assetsQuery = query(collection(db, "assets_ip"), where("orgId", "==", orgId));
        const assetsSnap = await getDocs(assetsQuery);

        // Get unique inventors
        const inventorIds = new Set(projectsSnap.docs.map(d => d.data().userId));

        // Get all matches
        const matchesQuery = query(collection(db, "matches"));
        const matchesSnap = await getDocs(matchesQuery);

        setStats({
          totalProjects: projectsSnap.size || 15,
          totalAssets: assetsSnap.size || 3,
          totalInventors: inventorIds.size || 4,
          activeMatches: matchesSnap.size || 12
        });

        // Load recent projects
        setRecentProjects(projectsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Load challenges
        const challengesSnap = await getDocs(collection(db, "challenges"));
        setChallenges(challengesSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      } catch (error) {
        console.error("Error loading org data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOrgData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6">
        <Building2 className="mx-auto text-slate-800" size={64} />
        <h2 className="text-2xl font-bold text-white">{t("dashboard.organization.noLinkedOrg")}</h2>
        <p className="text-slate-400">{t("dashboard.organization.noLinkedOrgDesc")}</p>
        <button className="bg-indigo-600 px-6 py-3 rounded-xl font-bold text-white">{t("dashboard.organization.requestAccess")}</button>
      </div>
    );
  }

  // Filtrar os projetos que precisam de auditoria (não verificados pela ICT)
  const pendingAudits = recentProjects.filter(p => !p.isIctVerified);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Building2 size={20} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/80">ICT & EMBRAPII Hub</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{org.name}</h1>
          <p className="text-slate-400 text-sm mt-1">Centro de Comando de Fomento e Gestão de Portfólio Deep Tech</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-slate-400 text-sm font-bold flex items-center gap-2 hover:text-white transition-all">
             <Search size={18} /> Consultar Inventor
          </button>
          <button 
            onClick={() => alert("Relatório de fomento executivo exportado para PDF!")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all"
          >
             Relatório EMBRAPII
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 self-start max-w-max">
        {[
          { id: "overview", label: "Overview" },
          { id: "capacities", label: "Laboratórios e Vitrine" },
          { id: "fomento", label: "Editais e Radar" },
          { id: "researchers", label: "Pesquisadores" },
          { id: "ip_balcao", label: "Balcão de Patentes" }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Capital Fomentado", val: "R$ 4.5M", desc: "Alocados via EMBRAPII", icon: <Coins className="text-emerald-400" />, color: "border-emerald-500/10" },
              { label: "Projetos no Portfólio", val: `${stats.totalProjects} Projetos`, desc: "Inovações de Hard Tech", icon: <FileText className="text-blue-400" />, color: "border-blue-500/10" },
              { label: "Deal Flows Ativos", val: `${stats.activeMatches} Matches`, desc: "Negociações abertas", icon: <Zap className="text-amber-400" />, color: "border-amber-500/10" },
              { label: "Auditorias Pendentes", val: `${pendingAudits.length} Projetos`, desc: "Validação técnica pendente", icon: <AlertTriangle className="text-indigo-400" />, color: "border-indigo-500/10" },
            ].map((stat, i) => (
              <div key={i} className={`bg-slate-900/40 border ${stat.color} p-6 rounded-3xl hover:border-slate-700 transition-all group relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-[40px] rounded-full -mr-12 -mt-12 group-hover:bg-white/10 transition-all" />
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850 group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 uppercase">
                    Status OK
                  </span>
                </div>
                <div className="text-2xl font-black text-white mb-0.5">{stat.val}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</div>
                <p className="text-[11px] text-slate-400 mt-2">{stat.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Validation Pipeline & Demand Feed */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Pipeline de Validação Técnica (Ação Exclusiva da ICT) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="text-fuchsia-400" size={22} /> Pipeline de Validação Técnica (TRL)
                  </h2>
                  <span className="text-[9px] bg-fuchsia-500/10 text-fuchsia-400 px-2 py-1 rounded border border-fuchsia-500/20 font-bold uppercase">
                    Homologação ICT
                  </span>
                </div>
                
                <div className="space-y-4">
                  {pendingAudits.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/20 border border-slate-800 rounded-3xl">
                      <CheckCircle2 className="mx-auto text-emerald-400 mb-3" size={32} />
                      <p className="text-slate-400 text-sm font-semibold">Excelente! Todos os projetos do portfólio já estão validados pela ICT.</p>
                    </div>
                  ) : (
                    pendingAudits.map(proj => (
                      <div key={proj.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm">{proj.title}</h4>
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] px-2 py-0.5 rounded font-black uppercase">
                              TRL {proj.declaredTRL || proj.maturity || 4} Declarado
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{proj.summary}</p>
                          <div className="flex gap-4 text-[10px] text-slate-500 mt-2">
                            <span>Inventor: <strong className="text-slate-300">Prof. Dr. Rafael Silva</strong></span>
                            <span>•</span>
                            <span>Linha de Fomento: <strong className="text-slate-300">{(proj.fundingTags && proj.fundingTags[0]) || "EMBRAPII"}</strong></span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleValidateTRL(proj.id, proj.declaredTRL || proj.maturity || 4)}
                          className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/30 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
                        >
                          <Award size={14} /> Conceder Selo "ICT Verified"
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Radar de Demanda (O que a Indústria quer comprar?) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Briefcase className="text-indigo-400" size={22} /> Desafios Tecnológicos (Demandas de Indústrias)
                  </h2>
                  <span className="text-xs text-slate-500">Oportunidades de co-desenvolvimento</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges.map(chall => (
                    <div key={chall.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-indigo-500/20 transition-all group h-[200px]">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[9px] font-black uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                            {chall.companyName}
                          </span>
                          <span className="text-emerald-400 font-mono text-xs font-bold">
                            R$ {(chall.budget / 1000).toFixed(0)}k
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-xs mt-3 leading-snug group-hover:text-indigo-300 transition-colors">{chall.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-2 line-clamp-3 leading-relaxed">{chall.description}</p>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-slate-500 mt-4 border-t border-slate-850 pt-2">
                        <span>Prazo: <strong className="text-slate-400">{chall.deadline}</strong></span>
                        <span className="text-indigo-400 hover:underline cursor-pointer font-bold uppercase tracking-wider">Ver Match</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Labs Occupancy & Segment Analytics */}
            <div className="space-y-8">
              
              {/* Vitrine de Infraestrutura e Laboratórios */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Cpu className="text-slate-500" size={20} /> Ocupação de Infraestruturas
                </h2>
                
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-5">
                  <div className="space-y-4">
                    {labs.map(l => (
                      <div key={l.id} className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-200 font-bold truncate max-w-[170px]">{l.name}</span>
                          <span className={`font-mono font-bold ${l.occupancy >= 80 ? 'text-rose-400' : 'text-emerald-400'}`}>{l.occupancy}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${l.occupancy >= 80 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${l.occupancy}%` }} 
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                          <span>{l.projectsCount} Projetos Alocados</span>
                          <span>Capacidade Máxima</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setActiveTab("capacities")}
                    className="w-full py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all flex items-center justify-center gap-1"
                  >
                    <Plus size={12} /> Homologar Novo Laboratório
                  </button>
                </div>
              </div>

              {/* Radar de Demanda (O que a Indústria quer comprar?) */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="text-slate-500" size={20} /> Setores mais Buscados
                </h2>
                
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
                  <div className="space-y-3">
                    {[
                      { label: "Telecom / 5G / 6G", percent: 45, color: "bg-indigo-500" },
                      { label: "Internet das Coisas (IoT)", percent: 35, color: "bg-emerald-500" },
                      { label: "Inteligência Artificial", percent: 20, color: "bg-amber-500" }
                    ].map(bar => (
                      <div key={bar.label} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-300">{bar.label}</span>
                          <span className="text-slate-500">{bar.percent}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div className={`${bar.color} h-full rounded-full`} style={{ width: `${bar.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed italic text-center">
                    Mapeamento em tempo real baseado nas queries e desafios postados pelas empresas.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Capacities Tab Content */}
      {activeTab === "capacities" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Capacities List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="text-indigo-400" size={22} /> {t("dashboard.organization.capacities.listTitle")}
            </h2>
            <div className="space-y-4">
              {labs.map(l => (
                <div key={l.id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-base font-bold text-white">{l.name}</h3>
                    <span className="bg-indigo-500/10 text-indigo-400 text-[10px] px-2 py-1 rounded-lg border border-indigo-500/20 font-bold whitespace-nowrap">
                      {l.area}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    <strong className="text-slate-300">{t("dashboard.organization.capacities.equipment")}: </strong> 
                    {l.equipment}
                  </div>
                  <div className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-slate-300">Competências: </strong> 
                    {l.capacity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Capacity Panel */}
          <div>
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="text-indigo-400" size={20} /> {t("dashboard.organization.capacities.addLabBtn")}
              </h3>
              <form onSubmit={handleAddLab} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("dashboard.organization.capacities.labName")}</label>
                  <input 
                    type="text" 
                    required 
                    value={newLabName}
                    onChange={e => setNewLabName(e.target.value)}
                    placeholder="Ex: Laboratório de Biofotônica"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("dashboard.organization.capacities.area")}</label>
                  <input 
                    type="text" 
                    required
                    value={newLabArea}
                    onChange={e => setNewLabArea(e.target.value)}
                    placeholder="Ex: Biotecnologia / Saúde"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("dashboard.organization.capacities.equipment")}</label>
                  <textarea 
                    value={newLabEquip}
                    onChange={e => setNewLabEquip(e.target.value)}
                    placeholder="Ex: Microscópio Confocal, Centrífuga refrigerada"
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                >
                  {t("dashboard.organization.capacities.addLabBtn")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Fomento Tab Content */}
      {activeTab === "fomento" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Coins className="text-amber-400" size={22} /> {t("dashboard.organization.fomento.title")}
              </h2>
              <p className="text-slate-400 text-xs mt-1">{t("dashboard.organization.fomento.subtitle")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fundingCalls.map(call => (
              <div key={call.id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all flex flex-col justify-between h-[230px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 blur-[30px] rounded-full group-hover:bg-indigo-500/10 transition-all" />
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 px-2 py-1 bg-amber-400/10 rounded-lg border border-amber-400/20">
                      {call.agency}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-bold">{t("dashboard.organization.fomento.matchScore")}:</span>
                      <span className="text-xs font-extrabold text-emerald-400">{call.matchScore}%</span>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">{call.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">{t("dashboard.organization.fomento.fundingAgency")}</span>
                      <strong className="text-slate-200">{call.amount}</strong>
                    </div>
                    <div className="border-l border-slate-850 h-8" />
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">{t("dashboard.organization.fomento.deadline")}</span>
                      <strong className="text-slate-200">{call.deadline}</strong>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => alert("Candidatura ao edital iniciada!")}
                  className="w-full py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all flex items-center justify-center gap-1"
                >
                  <Award size={12} /> {t("dashboard.organization.fomento.applyBtn")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Researchers Tab Content */}
      {activeTab === "researchers" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <GraduationCap className="text-indigo-400" size={24} /> {t("dashboard.organization.researchers.title")}
              </h2>
              <p className="text-slate-400 text-xs mt-1">{t("dashboard.organization.researchers.subtitle")}</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                value={researchersSearch}
                onChange={e => setResearchersSearch(e.target.value)}
                placeholder={t("dashboard.organization.researchers.searchPlaceholder")}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResearchers.map(r => (
              <div key={r.id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all flex flex-col justify-between gap-5 relative group">
                <div className="flex items-start gap-4">
                  <img 
                    src={r.image} 
                    alt={r.name} 
                    className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{r.name}</h3>
                    <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">{r.title}</p>
                    <div className="flex gap-2.5 mt-2">
                      <span className="text-[9px] bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-slate-400">
                        {t("dashboard.organization.researchers.hindex")}: <strong>{r.hIndex}</strong>
                      </span>
                      <span className="text-[9px] bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-slate-400">
                        {t("dashboard.organization.researchers.patents")}: <strong>{r.patents}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    <strong className="text-slate-300">Expertise: </strong> {r.expertise}
                  </div>
                  <div className="flex justify-between items-center text-[10px] p-2.5 bg-slate-950/50 rounded-xl border border-slate-850">
                    <span className="text-slate-400">{t("dashboard.organization.researchers.compat")}:</span>
                    <strong className="text-emerald-400 font-extrabold">{r.compatibility}%</strong>
                  </div>
                </div>

                <button 
                  onClick={() => alert("Pesquisador alocado para novo edital!")}
                  className="w-full py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all"
                >
                  {t("dashboard.organization.researchers.assignBtn")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IP Balcao Tab Content */}
      {activeTab === "ip_balcao" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patents Portfolio */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Scale className="text-indigo-400" size={22} /> {t("dashboard.organization.ip_balcao.patentsPortfolio")}
            </h2>
            <div className="space-y-4">
              {activePatents.map(pat => (
                <div key={pat.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl hover:border-slate-700 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white leading-snug">{pat.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-[10px]">
                      <span className="text-slate-500 font-bold uppercase tracking-wider">{t("dashboard.organization.ip_balcao.inpiNumber")}: <strong className="text-slate-300 font-mono">{pat.inpi}</strong></span>
                      <div className="h-3 border-l border-slate-850" />
                      <span className="bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-slate-400 font-bold">TRL {pat.trl}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] px-3 py-1.5 rounded-full border font-bold self-start sm:self-auto ${
                    pat.status === "licensingAvailable" 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                      : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                  }`}>
                    {t(`dashboard.organization.ip_balcao.${pat.status}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* PI Parameters Config */}
          <div>
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="text-indigo-400" size={20} /> {t("dashboard.organization.ip_balcao.title")}
              </h3>
              <div className="space-y-5">
                {/* Royalty slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">{t("dashboard.organization.ip_balcao.royaltyRate")}</span>
                    <span className="text-indigo-400 font-mono">{royaltyRate}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="0.5" 
                    value={royaltyRate}
                    onChange={e => setRoyaltyRate(Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-950 border border-slate-800 rounded-lg h-2"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>1.0% Min</span>
                    <span>10.0% Max</span>
                  </div>
                </div>

                <div className="border-t border-slate-850 my-4" />

                {/* Toggles */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">{t("dashboard.organization.ip_balcao.exclusiveOption")}</span>
                  <button 
                    onClick={() => setAllowExclusive(!allowExclusive)}
                    className={`w-11 h-6 rounded-full transition-all relative outline-none border ${
                      allowExclusive 
                        ? 'bg-indigo-600 border-indigo-500' 
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 bg-white w-4.5 h-4.5 rounded-full shadow transition-all ${
                      allowExclusive ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <button 
                  onClick={handleSaveConfig}
                  disabled={isConfigSaving}
                  className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)] flex items-center justify-center gap-2"
                >
                  {isConfigSaving ? "..." : t("dashboard.organization.ip_balcao.saveConfig")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
