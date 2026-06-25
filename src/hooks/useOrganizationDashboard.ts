import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { db } from "../firebase/config";
import { 
  collection, query, where, getDocs, 
  doc, getDoc, updateDoc 
} from "firebase/firestore";
import { logAudit, logActivity, dispatchDomainEvent } from "../services/governanceService";

export interface Stats {
  totalProjects: number;
  totalAssets: number;
  totalInventors: number;
  activeMatches: number;
}

export interface OrgData {
  id?: string;
  name: string;
  type: string;
  managers: string[];
}

export interface Lab {
  id: number;
  name: string;
  area: string;
  equipment: string;
  capacity: string;
  occupancy: number;
  projectsCount: number;
}

export function useOrganizationDashboard() {
  const { user } = useAuth();
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
  const [labs, setLabs] = useState<Lab[]>([
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
    setLabs(prev => [
      ...prev,
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
  const [fundingCalls, setFundingCalls] = useState<any[]>([
    { id: 1, agency: "FINEP", title: "Mais Inovação Brasil - Telecom & Semicondutores", amount: "Até R$ 5M", matchScore: 94, deadline: "15/07/2026", segment: "Telecom/Hardware" },
    { id: 2, agency: "Embrapii", title: "Chamada Unidades EMBRAPII - Hard Tech & IoT", amount: "Subsídio de 50%", matchScore: 92, deadline: "30/08/2026", segment: "Indústria 4.0/IoT" },
    { id: 3, agency: "FAPEMIG", title: "Programa Centelha III - Minas Gerais", amount: "Até R$ 100K", matchScore: 85, deadline: "10/06/2026", segment: "Hardware/Telecom" }
  ]);

  // Mock Researchers (Lattes Integration)
  const [researchersSearch, setResearchersSearch] = useState("");
  const [researchers, setResearchers] = useState<any[]>([
    { id: 1, name: "Prof. Dr. Rafael Silva", title: "Coordenador no CRR / Inatel", expertise: "Antenas inteligentes, Redes 5G/6G, Hardware RF", hIndex: 34, patents: 8, compatibility: 96, image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
    { id: 2, name: "Dr. André Lourenço", title: "Pesquisador Sênior no WAI Lab", expertise: "Redes Neurais, IoT Industrial, Algoritmos de Borda", hIndex: 28, patents: 4, compatibility: 89, image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80" },
    { id: 3, name: "Dra. Camila Santos", title: "Pesquisadora de Segurança Cibernética", expertise: "Segurança de Redes, Criptografia Pós-Quântica, IoT", hIndex: 22, patents: 12, compatibility: 85, image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" }
  ]);

  const filteredResearchers = researchers.filter(r => 
    r.name.toLowerCase().includes(researchersSearch.toLowerCase()) || 
    r.expertise.toLowerCase().includes(researchersSearch.toLowerCase())
  );

  // PI Settings (Balcão de PI)
  const [royaltyRate, setRoyaltyRate] = useState(3.5);
  const [allowExclusive, setAllowExclusive] = useState(true);
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [activePatents, setActivePatents] = useState<any[]>([]);

  const handleSaveConfig = () => {
    setIsConfigSaving(true);
    setTimeout(() => {
      setIsConfigSaving(false);
    }, 800);
  };

  const handleValidateTRL = async (projectId: string, declaredTRL: number) => {
    try {
      const projRef = doc(db, "projects", projectId);
      
      // 1. Buscar estado atual para auditoria de mudanca (Event Sourcing)
      const projSnap = await getDoc(projRef);
      let previousTRL = 1;
      let projectTitle = "Projeto";
      if (projSnap.exists()) {
        const data = projSnap.data();
        previousTRL = data.validatedTRL || data.declaredTRL || data.maturity || 1;
        projectTitle = data.title || "Projeto";
      }

      // 2. Realizar atualizacao
      await updateDoc(projRef, {
        isIctVerified: true,
        validatedTRL: declaredTRL,
        vdrStatus: "green"
      });

      // 3. Registrar na Governança
      const actor = {
        uid: user?.uid || "",
        name: org?.name || user?.displayName || user?.email || "ICT Manager",
        email: user?.email || "",
        role: "ict"
      };

      await logAudit(
        actor,
        "project.trl.update",
        projectId,
        projectTitle,
        { trl: previousTRL },
        { trl: declaredTRL }
      );

      await logActivity(
        "project.trl.validated",
        actor.name,
        projectId,
        projectTitle,
        { previousTRL, newTRL: declaredTRL }
      );

      await dispatchDomainEvent("project.trl.validated", {
        projectId,
        projectTitle,
        previousTRL,
        newTRL: declaredTRL,
        ictId: user?.uid || ""
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
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          setLoading(false);
          return;
        }
        
        const userData = userDoc.data();
        const isIct = userData.role === 'ict';
        let orgId = userData.orgId || user.uid;
        
        let loadedOrg: any = null;
        if (isIct) {
          const orgDoc = await getDoc(doc(db, "organizations", orgId));
          if (orgDoc.exists()) {
            loadedOrg = { id: orgDoc.id, ...orgDoc.data() };
            setOrg(loadedOrg);
          } else {
            loadedOrg = {
              id: orgId,
              name: userData.name || "Inatel - NGTI & Unidade EMBRAPII ICC",
              type: "ICT",
              managers: [user.uid]
            };
            setOrg(loadedOrg);
          }
        } else {
          if (!orgId) {
            setLoading(false);
            return;
          }
          const orgDoc = await getDoc(doc(db, "organizations", orgId));
          if (orgDoc.exists()) {
            loadedOrg = { id: orgDoc.id, ...orgDoc.data() };
            setOrg(loadedOrg);
          } else {
            loadedOrg = {
              id: orgId,
              name: "Inatel - NGTI & Unidade EMBRAPII ICC",
              type: "ICT",
              managers: [user.uid]
            };
            setOrg(loadedOrg);
          }
        }
        
        if (orgId && orgId.toLowerCase().includes("fai")) {
          setLabs([
            { id: 1, name: "Núcleo de Prática em Gestão (NPG)", area: "Gestão / Empreendedorismo", equipment: "Sistemas ERP (Totvs/SAP), Plataformas de BI (PowerBI/Tableau), Sala de Reunião Executiva", capacity: "Consultoria administrativa, assessoria em gestão empresarial, modelagem de negócios", occupancy: 50, projectsCount: 1 },
            { id: 2, name: "Fábrica de Software & Sistemas de Informação", area: "Software / TI", equipment: "Ambientes Cloud (AWS/Azure), Servidores Git, Workstations de Desenvolvimento", capacity: "Desenvolvimento de software customizado, apps web e mobile, testes de usabilidade e arquitetura de sistemas", occupancy: 75, projectsCount: 2 },
            { id: 3, name: "Núcleo de Empreendedorismo e Inovação (NEI)", area: "Inovação / Startups", equipment: "Espaço Coworking, Sala de Pitching, Conexão Direta com Empresas do Vale da Eletrônica", capacity: "Incubação de projetos acadêmicos (FAITEC), mentorias para startups, captação de recursos", occupancy: 60, projectsCount: 1 }
          ]);
        } else {
          setLabs([
            { id: 1, name: "Centro de Referência em Radiocomunicações (CRR)", area: "Telecomunicações / RF", equipment: "Analisador de Espectro de 110 GHz, Câmara Anecoica Blindada", capacity: "Caracterização de antenas, testes de conformidade 5G/6G", occupancy: 40, projectsCount: 2 },
            { id: 2, name: "Wireless & AI Lab (WAI Lab)", area: "Inteligência Artificial / Computação Móvel", equipment: "Cluster GPU Nvidia DGX, Módulos SDR (Software Defined Radio)", capacity: "Otimização de canais de RF com aprendizado de máquina, redes neurais aplicadas a telecom", occupancy: 80, projectsCount: 4 },
            { id: 3, name: "Laboratório WOCA (Wireless and Optical Convergent Access)", area: "Fotônica / Redes de Acesso", equipment: "Fusora de Fibra Óptica de Precisão, Medidor de Potência Óptica de Alta Resolução", capacity: "Integração entre redes sem fio e fibra óptica (backhaul/fronthaul)", occupancy: 60, projectsCount: 3 }
          ]);
        }

        // Load Researchers dynamically or fallback
        if (loadedOrg?.researchers && Array.isArray(loadedOrg.researchers) && loadedOrg.researchers.length > 0) {
          setResearchers(loadedOrg.researchers);
        } else {
          if (orgId && orgId.toLowerCase().includes("fai")) {
            setResearchers([
              { id: 'res_fai_01', name: 'Prof. Dr. Fábio Gavião', title: 'Doutor - Sistemas de Informação', department: 'Sistemas de Informação', expertise: 'Computação de Alta Performance (HPC) e Cloud Computing (AWS)', lattesUrl: 'http://lattes.cnpq.br/simulado_fai_01', hIndex: 18, patents: 3, email: 'fabio.gaviao@fai-mg.br', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', compatibility: 96 },
              { id: 'res_fai_02', name: 'Profa. Dra. Sandra Carvalho', title: 'Doutora - Engenharia de Produção', department: 'Engenharia de Produção', expertise: 'Manufatura Enxuta (Green Belt), Integração Industrial e Logística', lattesUrl: 'http://lattes.cnpq.br/simulado_fai_02', hIndex: 15, patents: 5, email: 'sandra.carvalho@fai-mg.br', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80', compatibility: 89 },
              { id: 'res_fai_03', name: 'Prof. Me. Carlos Alberto Mont\' Alvão', title: 'Mestre - Gestão da Qualidade', department: 'Gestão da Qualidade', expertise: 'ISO 9001, Pesquisa Operacional e Gestão de Riscos Industriais', lattesUrl: 'http://lattes.cnpq.br/simulado_fai_03', hIndex: 12, patents: 2, email: 'carlos.alvao@fai-mg.br', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', compatibility: 82 },
              { id: 'res_fai_04', name: 'Profa. Me. Margarete Siqueira', title: 'Mestra - Núcleo de Empreendedorismo', department: 'Núcleo de Empreendedorismo (NEI/INTEF)', expertise: 'EdTech, Adaptive Learning e Modelagem de Novos Negócios', lattesUrl: 'http://lattes.cnpq.br/simulado_fai_04', hIndex: 10, patents: 1, email: 'margarete.siqueira@fai-mg.br', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', compatibility: 85 }
            ]);
          } else {
            setResearchers([
              { id: 1, name: "Prof. Dr. Rafael Silva", title: "Coordenador no CRR / Inatel", expertise: "Antenas inteligentes, Redes 5G/6G, Hardware RF", hIndex: 34, patents: 8, compatibility: 96, image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
              { id: 2, name: "Dr. André Lourenço", title: "Pesquisador Sênior no WAI Lab", expertise: "Redes Neurais, IoT Industrial, Algoritmos de Borda", hIndex: 28, patents: 4, compatibility: 89, image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80" },
              { id: 3, name: "Dra. Camila Santos", title: "Pesquisadora de Segurança Cibernética", expertise: "Segurança de Redes, Criptografia Pós-Quântica, IoT", hIndex: 22, patents: 12, compatibility: 85, image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" }
            ]);
          }
        }

        // Load Funding Calls dynamically or fallback
        if (loadedOrg?.fundingCalls && Array.isArray(loadedOrg.fundingCalls) && loadedOrg.fundingCalls.length > 0) {
          setFundingCalls(loadedOrg.fundingCalls);
        } else {
          if (orgId && orgId.toLowerCase().includes("fai")) {
            setFundingCalls([
              { id: 'edital_fai_01', agency: 'FAPEMIG', title: 'Programa Centelha MG (FAPEMIG)', amount: 'R$ 130.000', deadline: '2026-08-30', type: 'Subvenção Econômica', focus: 'Apoio a startups em fase inicial incubadas (INTEF)', status: 'open', matchScore: 88 },
              { id: 'edital_fai_02', agency: 'FINEP', title: 'Chamada FINEP - Soluções em EdTech & GovTech', amount: 'R$ 500.000', deadline: '2026-10-15', type: 'Fomento à Pesquisa', focus: 'Plataformas SaaS para Educação e Cidades Inteligentes', status: 'open', matchScore: 92 },
              { id: 'edital_fai_03', agency: 'AWS Partner Network', title: 'AWS Academy Cloud Research Grant', amount: 'US$ 10.000', deadline: 'Fluxo Contínuo', type: 'Créditos Cloud / Grant', focus: 'Projetos nativos em nuvem e arquiteturas de Machine Learning', status: 'open', matchScore: 95 }
            ]);
          } else {
            setFundingCalls([
              { id: 1, agency: "FINEP", title: "Mais Inovação Brasil - Telecom & Semicondutores", amount: "Até R$ 5M", matchScore: 94, deadline: "15/07/2026", segment: "Telecom/Hardware" },
              { id: 2, agency: "Embrapii", title: "Chamada Unidades EMBRAPII - Hard Tech & IoT", amount: "Subsídio de 50%", matchScore: 92, deadline: "30/08/2026", segment: "Indústria 4.0/IoT" },
              { id: 3, agency: "FAPEMIG", title: "Programa Centelha III - Minas Gerais", amount: "Até R$ 100K", matchScore: 85, deadline: "10/06/2026", segment: "Hardware/Telecom" }
            ]);
          }
        }

        // Get Stats
        const projectsQuery = query(collection(db, "projects"), where("orgId", "==", orgId));
        const projectsSnap = await getDocs(projectsQuery);
        
        const assetsQuery = query(collection(db, "assets_ip"), where("orgId", "==", orgId));
        const assetsSnap = await getDocs(assetsQuery);
        const loadedAssets = assetsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (loadedAssets.length > 0) {
          setActivePatents(loadedAssets);
        } else {
          setActivePatents([
            { id: "as_1", title: "Topologia de Circuito RF de Baixa Latência para Gateway 5G", inpi: "BR 10 2024 001234 5", trl: 6, status: "licensingAvailable" },
            { id: "as_2", title: "Sistema de Roteamento Dinâmico em Redes Mesh LTE", inpi: "BR 10 2023 008910 2", trl: 5, status: "licensingActive" },
            { id: "as_3", title: "Algoritmo de Detecção de Intrusão Baseado em Assinaturas de Sinal", inpi: "BR 10 2025 000456 1", trl: 4, status: "licensingAvailable" }
          ]);
        }

        // Get unique inventors
        const inventorIds = new Set(projectsSnap.docs.map(d => d.data().userId));

        // Get matches for this organization
        const matchesQuery = query(collection(db, "matches"), where("orgId", "==", orgId));
        const matchesSnap = await getDocs(matchesQuery);

        setStats({
          totalProjects: projectsSnap.size || 15,
          totalAssets: assetsSnap.size || 3,
          totalInventors: inventorIds.size || 4,
          activeMatches: matchesSnap.size || 12
        });

        // Load recent projects
        const matchesList = matchesSnap.docs.map(doc => doc.data());
        const projectsWithMatches = projectsSnap.docs.map(d => {
          const data = d.data();
          const pId = d.id;
          const count = matchesList.filter((m: any) => m.ownerProjectId === pId).length;
          return { id: pId, ...data, matchesCount: count };
        });
        setRecentProjects(projectsWithMatches);

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

  const pendingAudits = recentProjects.filter(p => !p.isIctVerified);

  return {
    loading,
    stats,
    org,
    recentProjects,
    challenges,
    activeTab,
    setActiveTab,
    labs,
    newLabName,
    setNewLabName,
    newLabArea,
    setNewLabArea,
    newLabEquip,
    setNewLabEquip,
    handleAddLab,
    fundingCalls,
    researchersSearch,
    setResearchersSearch,
    researchers,
    filteredResearchers,
    royaltyRate,
    setRoyaltyRate,
    allowExclusive,
    setAllowExclusive,
    isConfigSaving,
    activePatents,
    handleSaveConfig,
    handleValidateTRL,
    pendingAudits
  };
}
