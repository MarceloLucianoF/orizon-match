import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment } from "firebase/firestore";
import { db } from "../../firebase/config";
import { 
  ArrowLeft, Eye, Star, Zap, 
  Shield, FileText, Gavel, Briefcase, 
  ShieldCheck, Code, Lock, ArrowRight,
  TrendingUp, Map, Target, CheckCircle, AlertTriangle, AlertOctagon, Printer, Loader2
} from "lucide-react";
import { VDRRoom } from "../../components/VDRRoom";
import { SmartNDAModal } from "../../components/legal/SmartNDAModal";
import { checkExistingNDA } from "../../services/ndaService";
import { useAuth } from "../../hooks/useAuth";
import ReactMarkdown from 'react-markdown';
import { generateProjectAiBriefing } from "../../services/reportService";

// Helper recursively extracting plain text from Markdown React components to identify blockquote tags.
const extractText = (node: any): string => {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node.props && node.props.children) return extractText(node.props.children);
  return "";
};

const CustomH2 = ({ children }: any) => {
  const text = React.Children.toArray(children).join('').toLowerCase();
  let icon = <FileText className="text-teal-400" size={18} />;
  let id = "summary";
  
  if (text.includes("swot")) {
    icon = <TrendingUp className="text-teal-400" size={18} />;
    id = "swot";
  } else if (text.includes("roadmap")) {
    icon = <Map className="text-teal-400" size={18} />;
    id = "roadmap";
  } else if (text.includes("conclus") || text.includes("recomend")) {
    icon = <Target className="text-teal-400" size={18} />;
    id = "conclusion";
  }
  
  return (
    <div id={id} className="pt-8 pb-4 border-b border-slate-800/80 mb-6 scroll-mt-28">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-teal-500/10 rounded-lg text-teal-400 border border-teal-500/20">
          {icon}
        </div>
        <h2 className="text-lg font-bold tracking-tight text-white m-0 !border-b-0 !pb-0 !mt-0 !bg-none ![webkit-text-fill-color:initial]">
          {children}
        </h2>
      </div>
    </div>
  );
};

const CustomH3 = ({ children }: any) => {
  const text = React.Children.toArray(children).join('').toLowerCase();
  let icon = null;
  
  if (text.includes("força")) {
    icon = <CheckCircle className="text-emerald-400 mr-2" size={16} />;
  } else if (text.includes("fraqueza")) {
    icon = <AlertTriangle className="text-amber-500 mr-2" size={16} />;
  } else if (text.includes("oportunidade")) {
    icon = <TrendingUp className="text-teal-400 mr-2" size={16} />;
  } else if (text.includes("ameaça")) {
    icon = <AlertOctagon className="text-rose-500 mr-2" size={16} />;
  }
  
  return (
    <h3 className="text-sm font-bold text-slate-200 mt-6 mb-3 flex items-center">
      {icon}
      {children}
    </h3>
  );
};

const CustomBlockquote = ({ children }: any) => {
  const text = extractText(children);
  const isOpportunity = /oportunidade|opportunity/i.test(text);
  const isRisk = /risco|risk/i.test(text);

  let containerClass = "border-l-4 border-teal-500 bg-teal-950/20 text-slate-300";
  let title = "Key Insight";
  let icon = <ShieldCheck className="text-teal-400" size={16} />;

  if (isOpportunity) {
    containerClass = "border-l-4 border-amber-500 bg-amber-950/20 text-slate-300";
    title = "Oportunidade";
    icon = <Zap className="text-amber-400" size={16} />;
  } else if (isRisk) {
    containerClass = "border-l-4 border-rose-500 bg-rose-950/20 text-slate-300";
    title = "Risco Crítico";
    icon = <AlertOctagon className="text-rose-400" size={16} />;
  }

  return (
    <div className={`my-6 p-5 rounded-r-2xl ${containerClass} backdrop-blur-sm`}>
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider mb-2 select-none">
        {icon}
        <span>{title}</span>
      </div>
      <div className="text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
};

interface ProjectData {
  id: string;
  title: string;
  summary: string;
  segment: string;
  maturity: number;
  linkedAssets?: string[];
  type?: string;
  innovationType?: string;
  isProtected?: boolean;
  patentNumber?: string;
  stats?: {
    views?: number;
    saves?: number;
  };
  [key: string]: any;
}

const getKpis = (project: ProjectData, linkedAssets: any[]) => {
  const summaryLength = project.summary?.length || 0;
  const hasProtected = project.isProtected || false;
  const hasAssets = linkedAssets.length > 0;
  const hasMaturity = !!project.maturity;
  
  // 1. AI Confidence and qualitative labels
  let confidence = 85;
  if (summaryLength > 200) confidence += 5;
  else if (summaryLength > 50) confidence += 2;
  if (hasProtected || hasAssets) confidence += 4;
  if (hasMaturity) confidence += 4;
  confidence = Math.min(98, confidence);
  
  let confidenceLabel = "Média Confiança";
  let confidenceColor = "text-amber-400";
  if (confidence >= 95) {
    confidenceLabel = "Muito Alta (Very High)";
    confidenceColor = "text-teal-400";
  } else if (confidence >= 90) {
    confidenceLabel = "Alta (High Confidence)";
    confidenceColor = "text-teal-400";
  }

  // 2. TRL Maturity
  const trlVal = project.validatedMaturity || project.maturity || 1;
  const isTrlValidated = !!project.validatedMaturity;

  // 3. IP Strength
  let ipStrength = "Pendente";
  let ipDetail = "Sem proteção ativa";
  if (project.isProtected || hasAssets) {
    ipStrength = "Forte";
    ipDetail = project.patentNumber ? `Patente: ${project.patentNumber}` : "Ativos vinculados";
  }

  // 4. Enterprise Readiness & AI Executive Score
  let readiness = "Média (Medium)";
  let readinessColor = "text-teal-400";
  if (trlVal >= 7 && (project.isProtected || hasAssets)) {
    readiness = "Altíssima (Very High)";
    readinessColor = "text-emerald-400";
  } else if (trlVal >= 4 && (project.isProtected || hasAssets)) {
    readiness = "Alta (High)";
    readinessColor = "text-emerald-400";
  } else if (trlVal >= 4) {
    readiness = "Média (Medium)";
  } else {
    readiness = "Baixa (Low)";
    readinessColor = "text-amber-400";
  }

  let execScore = 80;
  if (trlVal >= 7) execScore += 8;
  else if (trlVal >= 4) execScore += 5;
  if (project.isProtected || hasAssets) execScore += 6;
  if (summaryLength > 150) execScore += 4;
  execScore = Math.min(98, execScore);

  return [
    { title: "AI Executive Score", value: `${execScore}/100`, detail: `Readiness: ${readiness}`, icon: <Target size={14} className="text-teal-400" />, valColor: readinessColor },
    { title: "Confidence", value: `${confidence}%`, detail: confidenceLabel, icon: <Zap size={14} className="text-amber-400" />, valColor: confidenceColor },
    { title: "Maturidade TRL", value: `TRL ${trlVal}`, detail: isTrlValidated ? "Validada (INPI)" : "Declarada", icon: <ShieldCheck size={14} className="text-emerald-400" /> },
    { title: "Força de IP", value: ipStrength, detail: ipDetail, icon: <Briefcase size={14} className="text-amber-400" /> }
  ];
};

function parseBriefing(report: string) {
  const sections: { [key: string]: string } = {
    summary: "",
    swot: "",
    roadmap: "",
    conclusion: ""
  };
  
  if (!report) return sections;
  
  const lines = report.split("\n");
  let currentSection: string | null = null;
  
  const accumulators: { [key: string]: string[] } = {
    summary: [],
    swot: [],
    roadmap: [],
    conclusion: []
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check if line is a primary header (starts with # or ## but NOT ###)
    // or looks like a bold header (Setext style or simple markdown bold title)
    const isNextLineSetextUnderline = i < lines.length - 1 && 
      (lines[i+1].trim().startsWith("===") || lines[i+1].trim().startsWith("---"));
      
    const isHeading = (trimmed.startsWith("# ") || trimmed.startsWith("## ")) || 
                      (trimmed.startsWith("**") && trimmed.endsWith("**") && trimmed.length < 60) ||
                      isNextLineSetextUnderline;

    if (isHeading && !trimmed.startsWith("###")) {
      const headingText = trimmed.replace(/[#*:=]/g, "").trim().toLowerCase();
      
      if (
        headingText.includes("sumário") || 
        headingText.includes("sumario") || 
        headingText.includes("executive") || 
        headingText.includes("executivo") || 
        headingText.includes("overview")
      ) {
        currentSection = "summary";
      } else if (
        headingText.includes("swot") || 
        headingText.includes("análise") || 
        headingText.includes("analise")
      ) {
        currentSection = "swot";
      } else if (
        headingText.includes("roadmap") || 
        headingText.includes("parceria") || 
        headingText.includes("cronograma") || 
        headingText.includes("fases")
      ) {
        currentSection = "roadmap";
      } else if (
        headingText.includes("conclusão") || 
        headingText.includes("conclusao") || 
        headingText.includes("recomendações") || 
        headingText.includes("recomendacoes") || 
        headingText.includes("recomendação") || 
        headingText.includes("recomendacao") || 
        headingText.includes("diretrizes") || 
        headingText.includes("ações") ||
        headingText.includes("acoes")
      ) {
        currentSection = "conclusion";
      }
    }
    
    // Skip Setext underline line so it doesn't render raw in the output
    if (trimmed.startsWith("===") || trimmed.startsWith("---")) {
      continue;
    }
    
    if (currentSection) {
      accumulators[currentSection].push(line);
    } else {
      // Default to summary for any preamble text
      accumulators.summary.push(line);
    }
  }
  
  sections.summary = accumulators.summary.join("\n").trim();
  sections.swot = accumulators.swot.join("\n").trim();
  sections.roadmap = accumulators.roadmap.join("\n").trim();
  sections.conclusion = accumulators.conclusion.join("\n").trim();

  // Strict fallback in case everything is empty
  if (!sections.summary && !sections.swot && !sections.roadmap && !sections.conclusion) {
    sections.summary = report;
  }
  
  return sections;
}

export function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [linkedAssets, setLinkedAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [hasSignedNDA, setHasSignedNDA] = useState(false);
  const [activeSection, setActiveSection] = useState("summary");
  const [parsedBriefing, setParsedBriefing] = useState<{ [key: string]: string }>({
    summary: "",
    swot: "",
    roadmap: "",
    conclusion: ""
  });
  const { user } = useAuth();

  useEffect(() => {
    if (aiReport) {
      setParsedBriefing(parseBriefing(aiReport));
    }
  }, [aiReport]);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const snap = await getDoc(doc(db, "projects", id));
        if (snap.exists()) {
          const projectData = { id: snap.id, ...snap.data() } as ProjectData;
          setProject(projectData);
          
          // Fetch Linked Assets
          if (projectData.linkedAssets && projectData.linkedAssets.length > 0) {
            const q = query(collection(db, "assets_ip"), where("__name__", "in", projectData.linkedAssets));
            const assetsSnap = await getDocs(q);
            setLinkedAssets(assetsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          }

          if (projectData.lastAiReport) {
            setAiReport(projectData.lastAiReport.content);
          }

          // Record view analytics directly in Firestore (bypassing cloud function due to Spark plan)
          updateDoc(doc(db, "projects", id), {
            "stats.views": increment(1)
          }).catch(err => console.error("Analytics error:", err));

          // Check for existing NDA
          if (user) {
            checkExistingNDA(user.uid, id).then(setHasSignedNDA);
          }
        } else {
          navigate("/projects");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate, user]);

  const handleGenerateReport = async () => {
    if (!id) return;
    setGeneratingReport(true);
    try {
      const reportText = await generateProjectAiBriefing(id);
      setAiReport(reportText);
    } catch (err) {
      console.error(err);
      alert("Falha ao gerar inteligência. Tente novamente em instantes.");
    } finally {
      setGeneratingReport(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex justify-center p-20 text-teal-500">
      <Zap className="animate-spin" size={48} />
    </div>
  );

  if (!project) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/projects" className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{project.title}</h1>
            <div className="flex items-center gap-2 flex-wrap text-slate-400 text-sm mt-1">
              <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{project.segment}</span>
              <span>•</span>
              {project.validatedMaturity ? (
                <>
                  <span className="text-emerald-400 font-bold">TRL {project.validatedMaturity} (Validado)</span>
                  <span>/</span>
                  <span className="text-slate-500">TRL {project.maturity || 1} (Declarado)</span>
                </>
              ) : (
                <span>TRL {project.maturity || 1} (Declarado)</span>
              )}
              {(project.isIctVerified || project.validatedMaturity) && (
                <>
                  <span>•</span>
                  <span className="bg-teal-500/10 text-teal-400 text-[10px] px-2.5 py-0.5 rounded border border-teal-500/20 font-black uppercase tracking-wider flex items-center gap-1 shadow-[0_0_15px_rgba(0,181,156,0.1)]">
                    <ShieldCheck size={12} /> Risco Mitigado (ICT Verified)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3 no-print">
          <button 
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="bg-slate-900 border border-slate-800 text-teal-400 px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 hover:bg-slate-800"
          >
            {generatingReport ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />} 
            {aiReport ? "Atualizar Inteligência" : "Gerar Inteligência"}
          </button>
          <Link to={`/matches?project=${project.id}`} className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2">
            <Zap size={18} /> Ver Matches
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {project.technologyDNA ? (
            // Custom Digital Twin Details
            <div className="space-y-8 text-left">
              {/* Overall Score Banner */}
              {project.readinessScores && (
                <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 to-teal-950/20 border border-teal-500/10 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-[50px]" />
                  <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
                    <div className="absolute inset-0 bg-teal-500/10 rounded-full blur animate-pulse" />
                    <div className="absolute w-18 h-18 border-2 border-teal-500/20 rounded-full" />
                    <span className="text-2xl font-black text-white">{project.readinessScores.overall}%</span>
                  </div>
                  <div className="text-center md:text-left space-y-1">
                    <h4 className="text-white font-bold text-base">Transfer Readiness Score</h4>
                    <p className="text-xs text-slate-400">
                      Pontuação geral ponderada para a indústria de <strong className="text-teal-300">{project.technologyDNA.industry?.join(", ") || project.segment}</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* Executive Summary */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 space-y-4 shadow-sm backdrop-blur-sm">
                <h3 className="text-sm uppercase text-slate-500 tracking-wider font-bold flex items-center gap-2">
                  <FileText className="text-teal-400" size={16} /> Sumário Executivo (IA)
                </h3>
                <p className="text-sm text-slate-350 leading-relaxed text-justify whitespace-pre-wrap">
                  {project.summary}
                </p>
              </div>

              {/* Scores Grid */}
              {project.readinessScores && (
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 space-y-4 shadow-sm backdrop-blur-sm">
                  <h3 className="text-sm uppercase text-slate-500 tracking-wider font-bold">Mapeamento de Readiness (Maturidade)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Maturidade Técnica (TRL)", score: project.readinessScores.technology, desc: `Nível de prontidão técnica (TRL ${project.technologyDNA.trl || 1})` },
                      { label: "Maturidade Comercial (IRL)", score: project.readinessScores.commercial, desc: "Status de validação comercial" },
                      { label: "Status de Proteção Legal", score: project.readinessScores.legal, desc: "Proteção de Propriedade Intelectual" },
                      { label: "Maturidade de Mercado", score: project.readinessScores.market, desc: "Atratividade e tração de mercado" },
                      { label: "Prontidão de Transferência (TTR)", score: project.readinessScores.transfer, desc: "NIT e inventores aptos a transferir" },
                      { label: "Moats Regulatórios", score: project.readinessScores.regulatory, desc: "Enquadramento regulatório" }
                    ].map((item) => (
                      <div key={item.label} className="p-4 rounded-2xl bg-slate-950/30 border border-slate-900/60 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-300 font-bold">{item.label}</span>
                          <span className="text-teal-400 font-extrabold">{item.score}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${item.score}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-500">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technology DNA (Keywords, Competencies, Risks) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs uppercase text-slate-500 tracking-wider font-bold">Technology DNA</h4>
                  <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-5 backdrop-blur-sm text-left">
                    {project.technologyDNA.keywords && (
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Palavras-chave</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {project.technologyDNA.keywords.map((kw: string) => (
                            <span key={kw} className="px-2.5 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-300 font-semibold">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {project.technologyDNA.competencies && (
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Competências Críticas</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {project.technologyDNA.competencies.map((cp: string) => (
                            <span key={cp} className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-semibold">{cp}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {project.technologyDNA.risks && (
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Riscos Monitorados</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {project.technologyDNA.risks.map((rk: string) => (
                            <span key={rk} className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-semibold">{rk}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technology Protection & Team */}
                <div className="space-y-6">
                  {project.technologyProtection && (
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase text-slate-500 tracking-wider font-bold">Proteção Tecnológica</h4>
                      <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-xs space-y-3 backdrop-blur-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Situação da PI</span>
                          <span className="text-white font-bold bg-teal-600/30 px-2 py-0.5 rounded border border-teal-500/30 uppercase tracking-wide">{project.technologyProtection.status === 'granted' ? 'Concedida' : project.technologyProtection.status}</span>
                        </div>
                        {project.technologyProtection.registrations?.map((reg: any, idx: number) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-slate-500 font-medium">Registro ({reg.agency})</span>
                            <span className="text-slate-350 font-mono">{reg.number}</span>
                          </div>
                        ))}
                        <div className="h-px bg-slate-800/50 my-1" />
                        <div className="space-y-1">
                          <span className="text-slate-500 font-medium block">Titularidade</span>
                          <p className="text-[11px] text-slate-300 font-bold leading-relaxed">
                            {project.technologyProtection.owners?.join(" / ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {project.team && (
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase text-slate-500 tracking-wider font-bold">Equipe & Disponibilidade</h4>
                      <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-xs space-y-3 backdrop-blur-sm">
                        <div>
                          <p className="text-white font-bold">{project.team.principalInvestigator}</p>
                          <p className="text-[10px] text-slate-500">{project.team.laboratoryName}</p>
                        </div>
                        <div className="flex gap-2.5 pt-1">
                          {project.team.lattesUrl && <a href={project.team.lattesUrl} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300 underline font-semibold">Lattes</a>}
                          {project.team.lattesUrl && project.team.orcid && <span className="text-slate-800">|</span>}
                          {project.team.orcid && <a href={project.team.orcid} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300 underline font-semibold">ORCID</a>}
                          {project.team.orcid && project.team.linkedinUrl && <span className="text-slate-800">|</span>}
                          {project.team.linkedinUrl && <a href={project.team.linkedinUrl} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300 underline font-semibold">LinkedIn</a>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* VDR Virtual Data Room */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 shadow-sm backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Shield className="text-emerald-400" size={20} />
                  Virtual Data Room (VDR)
                </h3>
                
                {project.vdrAssets && project.vdrAssets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                    {project.vdrAssets.map((asset: any) => (
                      <div key={asset.id} className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 flex items-center gap-4 hover:border-slate-800 transition">
                        <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{asset.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Partição: {asset.category}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold shrink-0">{asset.sizeBytes ? (asset.sizeBytes / (1024 * 1024)).toFixed(2) + " MB" : ""}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <VDRRoom projectId={project.id} projectTitle={project.title} inpiStatus={project.inpiStatus} />
                )}
              </div>
            </div>
          ) : (
            // Original basic layout
            <>
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 space-y-6 shadow-sm backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="text-teal-400" size={20} />
                  Resumo do Projeto
                </h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {project.summary}
                </p>
              </div>

              {/* Garantia Jurídica / IP Section */}
              <div className="bg-gradient-to-br from-teal-950/20 to-slate-900/40 border border-teal-500/20 hover:border-teal-500/30 rounded-3xl p-8 space-y-6 relative overflow-hidden group shadow-lg transition-all duration-300 backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-all duration-1000" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Gavel className="text-teal-400" size={20} />
                      Garantia Jurídica (IP Check)
                    </h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Ativos de Propriedade Intelectual Vinculados</p>
                  </div>
                  
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20">
                    <ShieldCheck size={14} className="text-teal-400" />
                    <span className="text-[10px] font-black text-teal-300 uppercase tracking-widest">Auditado via INPI</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                  {linkedAssets.length > 0 ? (
                    linkedAssets.map(asset => (
                      <div key={asset.id} className="bg-slate-950/50 border border-slate-850 rounded-2xl p-5 flex items-center gap-4 hover:border-teal-500/25 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-300 backdrop-blur-sm">
                        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-850">
                          {asset.type === 'patent' ? <Briefcase className="text-amber-400" size={18} /> :
                           asset.type === 'software' ? <Code className="text-emerald-400" size={18} /> :
                           <ShieldCheck className="text-teal-400" size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-200 truncate">{asset.title}</h4>
                          <p className="text-[9px] text-slate-500 font-mono mt-1">{asset.inpiNumber || 'Nº Pendente'}</p>
                        </div>
                        <span className="text-[8px] font-black uppercase bg-slate-900 px-2 py-1 rounded text-slate-500 border border-slate-800">
                          {asset.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-6 text-center bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl">
                       <p className="text-xs text-slate-600 italic">Nenhum ativo formal vinculado ainda.</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                   <div className="flex items-center gap-2 text-[10px] text-slate-500">
                     <Lock size={12} className="text-slate-600" /> Documentos sensíveis protegidos por criptografia
                   </div>
                   
                   {hasSignedNDA ? (
                     <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                       <ShieldCheck size={14} /> NDA Assinado • VDR Liberado
                     </div>
                   ) : (
                     <button 
                      onClick={() => setShowNDAModal(true)}
                      className="w-full md:w-auto bg-teal-600 hover:bg-teal-500 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,181,156,0.3)] transition-all group/btn"
                     >
                       Assinar NDA e Acessar VDR
                       <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-all" />
                     </button>
                   )}
                </div>
              </div>

              <SmartNDAModal 
                isOpen={showNDAModal}
                onClose={() => setShowNDAModal(false)}
                onSigned={() => {
                  setHasSignedNDA(true);
                  setShowNDAModal(false);
                }}
                project={project}
                linkedAssets={linkedAssets}
              />

              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 shadow-sm backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Shield className="text-emerald-400" size={20} />
                  Virtual Data Room (VDR)
                </h3>
                <VDRRoom projectId={project.id} projectTitle={project.title} inpiStatus={project.inpiStatus} />
              </div>
            </>
          )}

          {/* AI INTELLIGENCE REPORT SECTION */}
          {aiReport && (
            <div className="bg-[#0C061A]/70 border border-teal-500/15 rounded-[32px] shadow-[0_24px_80px_rgba(0,181,156,0.08)] backdrop-blur-md overflow-hidden print-container">
              <div className="bg-gradient-to-r from-teal-950/40 via-transparent to-transparent p-8 border-b border-slate-800/60 flex justify-between items-center no-print">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400 border border-teal-500/20">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Executive Briefing</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">AI-Powered Intelligence by Gemini</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handlePrint}
                    className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl transition flex items-center gap-2 text-xs font-bold border border-slate-700/50"
                  >
                    <Printer size={16} /> 
                    <span className="hidden sm:inline">Imprimir / PDF</span>
                  </button>
                </div>
              </div>

              {/* Print Only Header */}
              <div className="print-only print-header">
                <div className="flex justify-between items-start">
                   <div>
                      <h1 className="text-2xl font-black text-teal-400">INOVAHELIX</h1>
                      <p className="text-xs text-slate-500 uppercase tracking-widest">Executive Intelligence Briefing</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400">PROJETO: {project.title.toUpperCase()}</p>
                      <p className="text-[10px] text-slate-400">DATA: {new Date().toLocaleDateString()}</p>
                   </div>
                </div>
              </div>

              {/* KPIs Row */}
              <div className="p-6 md:p-8 border-b border-slate-800/60 grid grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-950/40 no-print">
                {getKpis(project, linkedAssets).map((kpi, idx) => (
                  <div key={idx} className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-teal-500/25 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-8px_rgba(0,181,156,0.06)] transition-all duration-300 backdrop-blur-sm shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{kpi.title}</span>
                      <div className="p-1.5 bg-slate-950/80 border border-slate-800/50 rounded-lg shadow-inner">
                        {kpi.icon}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className={`text-xl font-extrabold text-white tracking-tight ${kpi.valColor || ''}`}>{kpi.value}</div>
                      <div className="text-[10px] text-slate-400 font-medium font-mono">{kpi.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Content Split: Sidebar + Text */}
              <div className="grid grid-cols-1 lg:grid-cols-4 no-print">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 border-r border-slate-800/60 p-4 lg:p-5 lg:px-4 bg-slate-950/20 lg:sticky lg:top-24 h-fit max-h-[80vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Seções do Briefing</h4>
                  <nav className="space-y-1">
                    {[
                      { id: "summary", label: "Overview", icon: <FileText size={14} /> },
                      { id: "swot", label: "SWOT Analysis", icon: <TrendingUp size={14} /> },
                      { id: "roadmap", label: "Roadmap", icon: <Map size={14} /> },
                      { id: "conclusion", label: "Recommendations", icon: <Target size={14} /> }
                    ].map((item) => {
                      const hasContent = !!parsedBriefing[item.id];
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-left min-w-0 ${
                            activeSection === item.id 
                              ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.05)]" 
                              : hasContent 
                                ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent"
                                : "text-slate-600 border border-transparent cursor-default opacity-50"
                          }`}
                        >
                          <span className="shrink-0">{item.icon}</span>
                          <span className="truncate whitespace-nowrap">{item.label}</span>
                          {!hasContent && <span className="ml-auto shrink-0 text-[8px] text-slate-700 uppercase tracking-widest">—</span>}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Right content column */}
                <div className="lg:col-span-3 p-8 md:p-10 lg:p-12 prose prose-invert max-w-none">
                  {parsedBriefing[activeSection] ? (
                    <ReactMarkdown
                      components={{
                        h2: CustomH2,
                        h3: CustomH3,
                        blockquote: CustomBlockquote
                      }}
                    >
                      {parsedBriefing[activeSection]}
                    </ReactMarkdown>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                        <FileText className="text-slate-600" size={24} />
                      </div>
                      <p className="text-sm font-bold text-slate-500 mb-1">Seção não disponível</p>
                      <p className="text-xs text-slate-600 max-w-xs">
                        Esta seção não foi identificada no relatório gerado pela IA. 
                        Tente regenerar o briefing ou consulte o <button onClick={() => setActiveSection("summary")} className="text-teal-400 hover:underline font-bold">Overview</button>.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Print layout fallback (renders text without grid/sidebar in print) */}
              <div className="print-only p-10 prose prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h2: CustomH2,
                    h3: CustomH3,
                    blockquote: CustomBlockquote
                  }}
                >
                  {aiReport}
                </ReactMarkdown>
              </div>

              <div className="print-only print-footer">
                Este relatório foi gerado automaticamente pela Inteligência Artificial da InovaHelix.
                Acesse inovahelix.web.app para mais detalhes.
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Métricas de Alcance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Eye size={14} />
                  <span className="text-[10px] font-bold uppercase">Views</span>
                </div>
                <div className="text-xl font-bold text-white">{project.stats?.views || 0}</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Star size={14} />
                  <span className="text-[10px] font-bold uppercase">Saves</span>
                </div>
                <div className="text-xl font-bold text-white">{project.stats?.saves || 0}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Detalhes Técnicos</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Tipo:</span>
                <span className="text-slate-200 font-medium uppercase">{project.type}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Inovação:</span>
                <span className="text-slate-200 font-medium capitalize">{project.innovationType}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Proteção:</span>
                <span className={`font-bold ${project.isProtected ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {project.isProtected ? 'Patenteado' : 'Não Protegido'}
                </span>
              </div>
              {project.patentNumber && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Nº Patente:</span>
                  <span className="text-slate-400 font-mono text-xs">{project.patentNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
