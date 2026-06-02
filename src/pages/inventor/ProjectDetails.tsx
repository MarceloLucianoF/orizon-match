import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { 
  ArrowLeft, Eye, Star, Zap, 
  Shield, FileText, Gavel, Briefcase, 
  ShieldCheck, Code, Lock, ArrowRight
} from "lucide-react";
import { VDRRoom } from "../../components/VDRRoom";
import { SmartNDAModal } from "../../components/legal/SmartNDAModal";
import { checkExistingNDA } from "../../services/ndaService";
import { useAuth } from "../../hooks/useAuth";
import ReactMarkdown from 'react-markdown';
import { Loader2, Printer } from "lucide-react";

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
  const { user } = useAuth();

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

          // Record view analytics via fetch para evitar problemas de CORS em southamerica-east1
          fetch('https://southamerica-east1-orizon-match.cloudfunctions.net/recordView', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: { projectId: id } })
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
      const response = await fetch('https://southamerica-east1-orizon-match.cloudfunctions.net/generateProjectReport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { projectId: id } })
      });

      if (!response.ok) throw new Error("Erro ao gerar relatório");
      const result = await response.json();
      setAiReport(result.data.report);
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
    <div className="flex justify-center p-20 text-indigo-500">
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
                  <span className="bg-indigo-500/10 text-indigo-400 text-[10px] px-2.5 py-0.5 rounded border border-indigo-500/20 font-black uppercase tracking-wider flex items-center gap-1 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
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
            className="bg-slate-900 border border-slate-800 text-indigo-400 px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 hover:bg-slate-800"
          >
            {generatingReport ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />} 
            {aiReport ? "Atualizar Inteligência" : "Gerar Inteligência"}
          </button>
          <Link to={`/matches?project=${project.id}`} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2">
            <Zap size={18} /> Ver Matches
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="text-indigo-400" size={20} />
              Resumo do Projeto
            </h3>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {project.summary}
            </p>
          </div>

          {/* Garantia Jurídica / IP Section */}
          <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-all duration-1000" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Gavel className="text-indigo-400" size={20} />
                  Garantia Jurídica (IP Check)
                </h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Ativos de Propriedade Intelectual Vinculados</p>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <ShieldCheck size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Auditado via INPI</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              {linkedAssets.length > 0 ? (
                linkedAssets.map(asset => (
                  <div key={asset.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:border-indigo-500/40 transition-all">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      {asset.type === 'patent' ? <Briefcase className="text-amber-400" size={18} /> :
                       asset.type === 'software' ? <Code className="text-emerald-400" size={18} /> :
                       <ShieldCheck className="text-indigo-400" size={18} />}
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
                  className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all group/btn"
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

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="text-emerald-400" size={20} />
              Virtual Data Room (VDR)
            </h3>
            <VDRRoom inpiStatus={project.inpiStatus} />
          </div>

          {/* AI INTELLIGENCE REPORT SECTION */}
          {aiReport && (
            <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl overflow-hidden print-container">
              <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900 p-8 border-b border-indigo-500/20 flex justify-between items-center no-print">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Executive Briefing</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">AI-Powered Intelligence by LLaMA 3.1</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handlePrint}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition flex items-center gap-2 text-xs font-bold"
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
                      <h1 className="text-2xl font-black text-indigo-900">ORIZON MATCH</h1>
                      <p className="text-xs text-slate-500 uppercase tracking-widest">Executive Intelligence Briefing</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400">PROJETO: {project.title.toUpperCase()}</p>
                      <p className="text-[10px] text-slate-400">DATA: {new Date().toLocaleDateString()}</p>
                   </div>
                </div>
              </div>

              <div className="p-8 prose prose-invert max-w-none prose-sm prose-headings:text-white prose-p:text-slate-300 prose-strong:text-indigo-400">
                <ReactMarkdown>{aiReport}</ReactMarkdown>
              </div>

              <div className="print-only print-footer">
                Este relatório foi gerado automaticamente pela Inteligência Artificial da Orizon Match.
                Acesse orizon-match.web.app para mais detalhes.
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
