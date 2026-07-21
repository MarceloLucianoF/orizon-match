import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import app, { getFunctionUrl } from "../../firebase/config";
import { useAuth } from "../../hooks/useAuth";
import { createProject } from "../../services/projectService";
import { 
  Loader2, ArrowRight, ArrowLeft, CheckCircle2, 
  ShieldCheck, HelpCircle, Info, Video, MapPin, Zap, Rocket, Search, MessageSquare,
  UploadCloud, FileText
} from "lucide-react";
import { TRLCalculator } from "../../components/TRLCalculator";
import { AssetSelector } from "../../components/legal/AssetSelector";
import { searchPatentsInpi } from "../../services/inpiService";
import type { INPIPatent } from "../../services/inpiService";
import { maskCpfCnpj, maskPhone } from "../../lib/validators";
import { DropZone } from "../../components/project/DropZone";
import { ProcessingLoader } from "../../components/project/ProcessingLoader";

const FIESC_CHAMBERS = [
  "Agroindústria",
  "Alimentos e Bebidas",
  "Assuntos Tributários e Fiscais",
  "Bens de Capital",
  "Construção Civil",
  "Economia",
  "Energia",
  "Meio Ambiente e Sustentabilidade",
  "Pesca e Maricultura",
  "Relações Trabalhistas",
  "Saneamento",
  "Segurança e Saúde no Trabalho",
  "Tecnologia e Inovação",
  "Transporte e Logística"
];

const REGIONS = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];

type Step = 
  | 'ROLE' 
  | 'SEGMENT' 
  | 'PROTECTION' 
  | 'RESEARCH' 
  | 'INNOVATION_TYPE' 
  | 'LOCATION'
  | 'MATURITY'
  | 'SUMMARY_METHOD' 
  | 'SUMMARY_CONTENT' 
  | 'SUMMARY_UPLOAD' 
  | 'SUMMARY_PROCESSING' 
  | 'CADASTRO' 
  | 'REVIEW'
  | 'LINK_ASSETS'
  | 'ICT_RESEARCH'
  | 'ICT_INFRA'
  | 'ICT_FOMENTO'
  | 'ICT_PI'
  | 'PROVIDER_SERVICES'
  | 'PROVIDER_CAPACITY'
  | 'PROVIDER_THESIS'
  | 'PROVIDER_MODEL';

const getStepCoaching = (step: Step) => {
  switch (step) {
    case 'SEGMENT':
      return {
        title: "Segmento de Atuação",
        subtitle: "Categorização Estratégica",
        desc: "Classificar seu projeto em uma das Câmaras Setoriais da FIESC garante que a IA faça a conexão direta com os comitês industriais e tomadores de decisão corretos.",
        tips: [
          "Escolha o setor mais próximo da aplicação final",
          "Permite a filtragem por teses industriais específicas",
          "Garante alinhamento regulatório setorial"
        ]
      };
    case 'PROTECTION':
    case 'LINK_ASSETS':
      return {
        title: "Propriedade Intelectual",
        subtitle: "Garantia Jurídica & Confiança",
        desc: "Executivos buscam segurança. Vincular patentes válidas ou em depósito estabelece a base jurídica necessária para que grandes indústrias acessem os detalhes do seu projeto.",
        tips: [
          "Conecta com buscas automáticas do INPI",
          "Ativos aparecem no IP Check da plataforma",
          "Indústrias filtram por tecnologias já patenteadas"
        ]
      };
    case 'RESEARCH':
      return {
        title: "Necessidades de P&D",
        subtitle: "Infraestrutura & Fomento",
        desc: "Muitas indústrias buscam cooperar com universidades e startups para projetos de pesquisa aplicada. Declarar suas necessidades de pesquisa direciona parcerias de codesenvolvimento.",
        tips: [
          "Conecta com linhas de fomento estadual/nacional",
          "Indica abertura para parceria em laboratórios",
          "Ajuda na captação de recursos governamentais"
        ]
      };
    case 'INNOVATION_TYPE':
      return {
        title: "Tipo de Inovação",
        subtitle: "Proposta de Valor ao Mercado",
        desc: "Diferenciar entre melhoria incremental e inovação radical ajuda indústrias a entenderem o apetite ao risco e o tempo de retorno (Time-to-Market) do projeto.",
        tips: [
          "Melhorias focam em otimização e processos rápidos",
          "Inovação radical atrai investimentos estruturais",
          "Direciona a tese corporativa correspondente"
        ]
      };
    case 'LOCATION':
      return {
        title: "Polo Regional",
        subtitle: "Apoio de Logística & Ecossistema",
        desc: "A proximidade física facilita auditorias, reuniões de conselho e integração logística. Mapeamos os polos regionais industriais do ecossistema.",
        tips: [
          "Facilita conexões com polos industriais próximos",
          "Alinhamento com editais de fomento regionais",
          "Melhora a pontuação de afinidade geográfica"
        ]
      };
    case 'MATURITY':
      return {
        title: "Maturidade Tecnológica",
        subtitle: "Classificação TRL/IRL",
        desc: "O Technology Readiness Level (TRL) é o padrão internacional para medir a maturidade de tecnologias. Quanto maior, mais próxima a tecnologia está da produção industrial em escala.",
        tips: [
          "TRL 1-3: Conceito e validação em laboratório",
          "TRL 4-6: Protótipo e validação em ambiente relevante",
          "TRL 7-9: Validação industrial e comercialização"
        ]
      };
    case 'SUMMARY_METHOD':
    case 'SUMMARY_CONTENT':
      return {
        title: "Lapidação de Pitch",
        subtitle: "Comunicação Executiva & IA",
        desc: "Nossa IA integrada traduz descrições acadêmicas e técnicas em propostas de valor corporativas robustas, adequadas para a tomada de decisão executiva.",
        tips: [
          "Descreva claramente a dor do mercado (Problema)",
          "Apresente os diferenciais sem jargões complexos",
          "Evite revelar segredos comerciais confidenciais"
        ]
      };
    case 'REVIEW':
      return {
        title: "Validação Estratégica",
        subtitle: "Revisão e Geração de Matches",
        desc: "Revise a consistência dos dados do seu ativo de inovação. Após finalizar, nossa IA iniciará o processamento semântico instantâneo com a tese das corporações.",
        tips: [
          "Todos os dados serão processados sob criptografia",
          "Seu projeto será listado como CONFIDENCIAL",
          "Identidade protegida até a assinatura do NDA"
        ]
      };
    default:
      return {
        title: "Estruturação Tecnológica",
        subtitle: "InovaHelix Engine",
        desc: "Estamos estruturando a ficha técnica do seu projeto para mitigar riscos regulatórios, técnicos e de mercado, aumentando drasticamente a percepção de valor.",
        tips: [
          "Dados confidenciais sob NDA digital",
          "Processamento semântico por IA",
          "Interface alinhada à Lei de Inovação"
        ]
      };
  }
};

export function CreateProjectInventor() {
  const { user, userProfile, impersonatingAdminId } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('SEGMENT');
  const [loading, setLoading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiStatus, setAiStatus] = useState("");
  const [inpiLoading, setInpiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inpiResults, setInpiResults] = useState<INPIPatent[]>([]);

  // Hydration from sessionStorage (Lead Capture)
  useEffect(() => {
    const cachedLead = sessionStorage.getItem('@inovahelix:lead_data');
    if (cachedLead) {
      try {
        const leadData = JSON.parse(cachedLead);
        setFormData(prev => ({ 
          ...prev, 
          ...leadData,
          registration: {
            ...prev.registration,
            ...(leadData.registration || {})
          }
        }));
        if (leadData.role) {
          if (leadData.role === 'idea') setStep('PROTECTION');
          else if (leadData.role === 'provider') setStep('PROVIDER_SERVICES');
          else if (leadData.role === 'ict') setStep('ICT_RESEARCH');
          else setStep('SEGMENT');
        }
        sessionStorage.removeItem('@inovahelix:lead_data');
      } catch (e) {
        console.error("Erro ao recuperar dados do lead", e);
      }
    }
  }, []);

  // Pre-fill userProfile data
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        registration: {
          ...prev.registration,
          idNumber: userProfile.idNumber || prev.registration.idNumber,
          name: userProfile.name || prev.registration.name,
          phone: userProfile.phone || prev.registration.phone
        }
      }));
    }
  }, [userProfile]);

  const [formData, setFormData] = useState({
    title: "",
    role: "inventor", // idea, ict, provider
    segment: "",
    isProtected: "", // sim, nao
    patentNumber: "",
    isGranted: "", // sim, nao
    needsResearch: "", // sim, nao
    innovationType: "", // melhoria, inovacao
    summaryMethod: "", // questions, text
    summary: "",
    summaryQuestions: {
      problem: "",
      solution: "",
      difference: ""
    },
    location: {
      region: "Sudeste"
    },
    trl: 1,
    irl: 0,
    trlChecklist: {},
    // ICT fields
    researchLines: [] as string[],
    infrastructure: [] as string[],
    fomentoAccess: [] as string[],
    piPolicy: "", // co-titularidade, licenciamento, outro
    // Provider fields
    services: [] as string[],
    productionCapacity: "",
    innovationThesis: "",
    partnershipModel: [] as string[],
    linkedAssets: [] as string[],
    // Cadastro data
    registration: {
      name: "",
      idNumber: "", // CNPJ/CPF
      phone: "",
      email: user?.email || "",
      password: "",
      confirmPassword: ""
    }
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [extractedTwinData, setExtractedTwinData] = useState<any | null>(null);
  const [hasLoaderFinished, setHasLoaderFinished] = useState(false);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyzeFile = async (fileToProcess: File) => {
    setIsProcessingFile(true);
    setError(null);
    setExtractedTwinData(null);
    setHasLoaderFinished(false);
    try {
      const base64 = await fileToBase64(fileToProcess);
      
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'orizon-match';
      const functionUrl = isLocal
        ? `http://127.0.0.1:5001/${projectId}/southamerica-east1/analyzeTechnologyAsset`
        : getFunctionUrl('analyzeTechnologyAsset');

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            fileBase64: base64,
            fileName: fileToProcess.name,
            mimeType: fileToProcess.type,
            segment: formData.segment
          }
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || "Erro na análise do arquivo pelo Gemini.");
      }

      const resJson = await response.json();
      const extracted = resJson.data || resJson;
      setExtractedTwinData(extracted);
    } catch (err: any) {
      console.error("Erro no processamento do ativo tecnológico:", err);
      setError(err.message || "Erro ao analisar o arquivo. Tente novamente.");
      setStep('SUMMARY_UPLOAD');
      setIsProcessingFile(false);
    }
  };

  useEffect(() => {
    if (step === 'SUMMARY_PROCESSING' && selectedFile && !isProcessingFile && !extractedTwinData) {
      handleAnalyzeFile(selectedFile);
    }
  }, [step, selectedFile]);

  useEffect(() => {
    if (hasLoaderFinished && extractedTwinData) {
      setFormData(prev => ({
        ...prev,
        title: extractedTwinData.title || "Tecnologia Extraída por IA",
        summary: extractedTwinData.summary || "",
        trl: extractedTwinData.technologyDNA?.trl || prev.trl,
        irl: extractedTwinData.readinessScores?.commercial ? Math.round(extractedTwinData.readinessScores.commercial / 10) : prev.irl,
        ...{
          role: 'idea',
          technologyDNA: extractedTwinData.technologyDNA,
          readinessScores: extractedTwinData.readinessScores,
          technologyProtection: extractedTwinData.technologyProtection,
          team: extractedTwinData.team,
          commercializationStrategy: extractedTwinData.commercializationStrategy,
          confidentiality: extractedTwinData.confidentiality,
          vdrAssets: (extractedTwinData.vdrAssets || []).map((asset: any) => ({
            ...asset,
            url: "#",
            uploadedAt: Date.now()
          }))
        }
      }));
      nextStep('REVIEW');
      // Reset states
      setExtractedTwinData(null);
      setHasLoaderFinished(false);
      setSelectedFile(null);
      setIsProcessingFile(false);
    }
  }, [hasLoaderFinished, extractedTwinData]);

  const handleLoaderComplete = () => {
    setHasLoaderFinished(true);
  };

  const nextStep = (next: Step) => setStep(next);
  const prevStep = (prev: Step) => setStep(prev);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateRegistration = (field: string, value: string) => {
    let finalValue = value;
    if (field === 'phone') finalValue = maskPhone(value);
    if (field === 'idNumber') finalValue = maskCpfCnpj(value);

    setFormData(prev => ({
      ...prev,
      registration: { ...prev.registration, [field]: finalValue }
    }));
  };

  const updateSummaryQuestions = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      summaryQuestions: { ...prev.summaryQuestions, [field]: value }
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    const finalSummary = formData.summaryMethod === 'questions' 
      ? `Problema: ${formData.summaryQuestions.problem}\nSolução: ${formData.summaryQuestions.solution}\nDiferencial: ${formData.summaryQuestions.difference}`
      : formData.summary;

    try {
      const projectId = await createProject({
        userId: user.uid,
        updatedByAdmin: !!impersonatingAdminId,
        adminId: impersonatingAdminId || null,
        title: formData.title || "Projeto sem título",
        type: "inventor",
        segment: formData.segment,
        needs: {
          investment: true,
          research: formData.needsResearch === 'sim',
          industry: true,
        },
        location: {
          region: formData.location.region,
        },
        // Additional metadata
        innovationType: formData.innovationType,
        isProtected: formData.isProtected === 'sim',
        patentNumber: formData.patentNumber,
        summary: finalSummary,
        trlChecklist: formData.trlChecklist,
        irlScore: formData.irl,
        maturity: formData.trl || 1,
        // ICT fields
        ...(formData.role === 'ict' && {
          researchLines: formData.researchLines,
          infrastructure: formData.infrastructure,
          fomentoAccess: formData.fomentoAccess,
          piPolicy: formData.piPolicy,
        }),
        // Provider fields
        ...(formData.role === 'provider' && {
          services: formData.services,
          productionCapacity: formData.productionCapacity,
          innovationThesis: formData.innovationThesis,
          partnershipModel: formData.partnershipModel,
        }),
        linkedAssets: formData.linkedAssets,
        technologyDNA: (formData as any).technologyDNA || null,
        readinessScores: (formData as any).readinessScores || null,
        technologyProtection: (formData as any).technologyProtection || null,
        team: (formData as any).team || null,
        vdrAssets: (formData as any).vdrAssets || null,
      } as any);

      navigate(`/matches?project=${projectId}`);
    } catch (error) {
      console.error("Erro ao salvar projeto", error);
      setError("Ocorreu um erro ao salvar o projeto. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => {
    const summarySteps: Step[] = formData.summaryMethod === 'document'
      ? ['SUMMARY_UPLOAD', 'SUMMARY_PROCESSING']
      : ['SUMMARY_CONTENT'];
    let steps: Step[] = ['SEGMENT', 'PROTECTION', 'LINK_ASSETS', 'RESEARCH', 'INNOVATION_TYPE', 'LOCATION', 'MATURITY', 'SUMMARY_METHOD', ...summarySteps, 'REVIEW'];
    
    const currentIndex = steps.indexOf(step);
    return (
      <div className="flex gap-1 mb-8">
        {steps.map((s, i) => (
          <div 
            key={s} 
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= currentIndex ? 'bg-teal-500 shadow-[0_0_10px_rgba(0,181,156,0.5)]' : 'bg-slate-800'
            }`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 md:px-6">
      <div className="mb-8 text-left border-b border-slate-800/60 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Estruturar Nova Tecnologia</h1>
          <p className="text-slate-400 text-sm mt-1">Siga o roteiro executivo para qualificar e patentear seu ativo de inovação.</p>
        </div>
        <div className="w-full md:w-80">
          {renderProgressBar()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN: WIZARD FORM */}
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[100px] pointer-events-none group-hover:bg-teal-500/10 transition-all duration-1000" />
        
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-in fade-in zoom-in-95">
            <Info size={18} />
            <div className="flex-1">{error}</div>
            <button onClick={() => setError(null)} className="text-red-400/50 hover:text-red-400">
              <ArrowRight size={18} className="rotate-45" />
            </button>
          </div>
        )}
        {/* STEP: SEGMENT */}
        {step === 'SEGMENT' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Segmento do Projeto</h2>
              <p className="text-slate-400">Selecione a Câmara ou Comitê da FIESC mais adequada.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FIESC_CHAMBERS.map(chamber => (
                <button
                  key={chamber}
                  onClick={() => updateField('segment', chamber)}
                  className={`p-4 rounded-xl text-left text-sm font-medium transition-all border ${
                    formData.segment === chamber 
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300' 
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {chamber}
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <div></div>
              <button 
                onClick={() => nextStep('PROTECTION')} 
                disabled={!formData.segment}
                className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition disabled:opacity-50"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: PROTECTION */}
        {step === 'PROTECTION' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Proteção Intelectual</h2>
              <p className="text-slate-400">Sua ideia já está protegida por patente?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateField('isProtected', 'sim')}
                className={`flex flex-col items-center gap-4 p-8 rounded-2xl border transition-all ${
                  formData.isProtected === 'sim' ? 'bg-teal-500/10 border-teal-500 text-teal-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ShieldCheck size={40} />
                <span className="font-bold">Sim, está</span>
              </button>
              <button
                onClick={() => updateField('isProtected', 'nao')}
                className={`flex flex-col items-center gap-4 p-8 rounded-2xl border transition-all ${
                  formData.isProtected === 'nao' ? 'bg-teal-500/10 border-teal-500 text-teal-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <HelpCircle size={40} />
                <span className="font-bold">Não, ainda não</span>
              </button>
            </div>

            {formData.isProtected === 'sim' && (
              <div className="space-y-6 p-6 rounded-2xl bg-slate-950/50 border border-slate-800 animate-in zoom-in-95">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Seu CPF ou CNPJ (para busca)</label>
                    <input
                      type="text"
                      value={formData.registration.idNumber}
                      onChange={(e) => updateRegistration('idNumber', e.target.value)}
                      disabled={!!userProfile?.idNumber}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      placeholder="00.000.000/0001-00"
                    />
                  </div>
                  <button 
                    onClick={async () => {
                      if (!formData.registration.idNumber) {
                        setError("Preencha seu CPF/CNPJ para realizar a busca no INPI.");
                        return;
                      }
                      setInpiLoading(true);
                      setError(null);
                      try {
                        const results = await searchPatentsInpi(formData.registration.idNumber);
                        setInpiResults(results);
                        if (results.length > 0) {
                          updateField('patentNumber', results[0].processo);
                          updateField('title', results[0].titulo);
                        } else {
                          setError("Nenhuma patente encontrada para este documento.");
                        }
                      } catch (e) {
                        setError("Erro ao consultar INPI. Tente inserir manualmente.");
                      } finally {
                        setInpiLoading(false);
                      }
                    }}
                    disabled={inpiLoading}
                    className="h-[52px] px-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition flex items-center gap-2 border border-slate-700"
                  >
                    {inpiLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    <span className="hidden md:inline">Buscar no INPI</span>
                  </button>
                </div>

                <div className="h-px bg-slate-800 my-2" />

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Número do Processo (Patente)</label>
                  <input
                    type="text"
                    value={formData.patentNumber}
                    onChange={(e) => updateField('patentNumber', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 outline-none transition-all"
                    placeholder="BR 10 202X XXXXXX-X"
                  />
                </div>

                {inpiResults.length > 0 && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 animate-in fade-in">
                    <strong>Patente encontrada:</strong> {inpiResults[0].titulo}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Já possui o certificado de concessão?</label>
                  <div className="flex gap-4">
                    <button onClick={() => updateField('isGranted', 'sim')} className={`flex-1 py-2 rounded-lg border transition ${formData.isGranted === 'sim' ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-700 text-slate-400'}`}>Sim</button>
                    <button onClick={() => updateField('isGranted', 'nao')} className={`flex-1 py-2 rounded-lg border transition ${formData.isGranted === 'nao' ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-700 text-slate-400'}`}>Não</button>
                  </div>
                </div>
              </div>
            )}

            {formData.isProtected === 'nao' && (
              <div className="p-6 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-4 animate-in zoom-in-95">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                    <Info size={24} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-white">Importância da Proteção</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Proteger sua ideia é o primeiro passo para uma inovação segura. Temos uma equipe para te auxiliar em todo o processo dentro do portal.
                    </p>
                  </div>
                </div>
                <button className="w-full py-3 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 font-bold flex items-center justify-center gap-2 transition border border-teal-500/20">
                  <Video size={18} /> Assistir Vídeo Explicativo
                </button>
              </div>
            )}

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={() => prevStep('SEGMENT')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={() => {
                  if (formData.isProtected === 'sim') nextStep('LINK_ASSETS');
                  else nextStep('RESEARCH');
                }} 
                disabled={!formData.isProtected}
                className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition disabled:opacity-50"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: LINK_ASSETS */}
        {step === 'LINK_ASSETS' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Vincular Ativos de PI</h2>
              <p className="text-slate-400">Selecione os ativos que você já registrou para este projeto.</p>
            </div>

            <AssetSelector 
              selectedIds={formData.linkedAssets}
              onToggle={(id) => {
                const current = formData.linkedAssets;
                const updated = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
                updateField('linkedAssets', updated);
              }}
            />

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={() => prevStep('PROTECTION')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <div className="flex gap-4">
                <button 
                  onClick={() => nextStep('RESEARCH')} 
                  className="px-6 py-3 rounded-xl text-slate-400 hover:text-white font-medium transition"
                >Pular Vínculo</button>
                <button 
                  onClick={() => nextStep('RESEARCH')} 
                  className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition"
                >Próximo</button>
              </div>
            </div>
          </div>
        )}

        {/* STEP: RESEARCH */}
        {step === 'RESEARCH' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Pesquisa e Desenvolvimento</h2>
              <p className="text-slate-400">Você precisa de apoio técnico (ICT, Startups) para transformar sua ideia em realidade?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateField('needsResearch', 'sim')}
                className={`p-8 rounded-2xl border transition-all font-bold ${
                  formData.needsResearch === 'sim' ? 'bg-teal-500/10 border-teal-500 text-teal-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >Sim</button>
              <button
                onClick={() => updateField('needsResearch', 'nao')}
                className={`p-8 rounded-2xl border transition-all font-bold ${
                  formData.needsResearch === 'nao' ? 'bg-teal-500/10 border-teal-500 text-teal-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >Não</button>
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={() => prevStep('PROTECTION')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={() => nextStep('INNOVATION_TYPE')} 
                disabled={!formData.needsResearch}
                className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition disabled:opacity-50"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: INNOVATION_TYPE */}
        {step === 'INNOVATION_TYPE' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Tipo de Inovação</h2>
              <p className="text-slate-400">Sua ideia é uma melhoria ou algo radicalmente novo?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateField('innovationType', 'melhoria')}
                className={`p-8 rounded-2xl border transition-all text-center space-y-2 ${
                  formData.innovationType === 'melhoria' ? 'bg-teal-500/10 border-teal-500 text-teal-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-lg">Melhoria Incremental</div>
                <div className="text-xs text-slate-500">Otimização de produto existente</div>
              </button>
              <button
                onClick={() => updateField('innovationType', 'inovacao')}
                className={`p-8 rounded-2xl border transition-all text-center space-y-2 ${
                  formData.innovationType === 'inovacao' ? 'bg-teal-500/10 border-teal-500 text-teal-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-lg">Inovação Radical</div>
                <div className="text-xs text-slate-500">Nova tecnologia ou mercado</div>
              </button>
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={() => prevStep('RESEARCH')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={() => nextStep('LOCATION')} 
                disabled={!formData.innovationType}
                className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition disabled:opacity-50"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: LOCATION */}
        {step === 'LOCATION' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Localização</h2>
              <p className="text-slate-400">Qual a região principal de atuação deste projeto?</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {REGIONS.map(region => (
                <button
                  key={region}
                  onClick={() => updateField('location', { region })}
                  className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                    formData.location.region === region ? 'bg-teal-500/10 border-teal-500 text-teal-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <MapPin size={20} />
                  <span className="font-bold">{region}</span>
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button 
                onClick={() => {
                  if (formData.role === 'ict') prevStep('ICT_INFRA');
                  else if (formData.role === 'provider') prevStep('PROVIDER_CAPACITY');
                  else prevStep('INNOVATION_TYPE');
                }} 
                className="flex items-center gap-2 text-slate-400 hover:text-white transition"
              >
                <ArrowLeft size={18} /> Voltar
              </button>
              <button 
                onClick={() => {
                  nextStep('MATURITY');
                }} 
                className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: MATURITY */}
        {step === 'MATURITY' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-white">Maturidade do Projeto</h2>
              <p className="text-slate-400">Preencha o checklist para certificar o TRL/IRL (Opcional).</p>
            </div>

            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800">
              <TRLCalculator 
                initialValues={formData.trlChecklist}
                onUpdate={(data) => {
                  setFormData(prev => ({
                    ...prev,
                    trl: data.trl,
                    irl: data.irl,
                    trlChecklist: data.checklist
                  }));
                }}
              />
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
              <button onClick={() => prevStep('LOCATION')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <div className="flex gap-4">
                <button 
                  onClick={() => nextStep('SUMMARY_METHOD')} 
                  className="px-6 py-3 rounded-xl text-slate-400 hover:text-white font-medium transition"
                >Pular por enquanto</button>
                <button 
                  onClick={() => nextStep('SUMMARY_METHOD')} 
                  className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition"
                >Confirmar e Prosseguir</button>
              </div>
            </div>
          </div>
        )}

        {/* STEP: SUMMARY_METHOD */}
        {step === 'SUMMARY_METHOD' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-white">Como deseja descrever sua ideia?</h2>
              <p className="text-slate-400">Escolha a forma que mais te agrada para apresentar o projeto.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => { updateField('summaryMethod', 'questions'); nextStep('SUMMARY_CONTENT'); }}
                className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-teal-500 transition-all space-y-4 group/card"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover/card:scale-110 transition-transform mx-auto md:mx-0">
                  <HelpCircle size={28} />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="font-bold text-white">Perguntas Guiadas</h3>
                  <p className="text-xs text-slate-500 mt-2">Nós te ajudamos a construir o resumo através de perguntas.</p>
                </div>
              </button>

              <button
                onClick={() => { updateField('summaryMethod', 'text'); nextStep('SUMMARY_CONTENT'); }}
                className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-teal-500 transition-all space-y-4 group/card"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover/card:scale-110 transition-transform mx-auto md:mx-0">
                  <MessageSquare size={28} />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="font-bold text-white">Texto Livre</h3>
                  <p className="text-xs text-slate-500 mt-2">Você escreve o resumo da sua ideia em um campo de texto único.</p>
                </div>
              </button>

              <button
                onClick={() => { updateField('summaryMethod', 'document'); nextStep('SUMMARY_UPLOAD'); }}
                className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-teal-500 transition-all space-y-4 group/card"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover/card:scale-110 transition-transform mx-auto md:mx-0">
                  <UploadCloud size={28} />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="font-bold text-white">Upload de Patente (IA)</h3>
                  <p className="text-xs text-slate-500 mt-2">Envie um arquivo PDF/DOCX e deixe nossa IA ler e extrair tudo.</p>
                </div>
              </button>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <button onClick={() => prevStep('INNOVATION_TYPE')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
            </div>
          </div>
        )}

        {/* STEP: SUMMARY_UPLOAD */}
        {step === 'SUMMARY_UPLOAD' && (
          <DropZone 
            onFileAccepted={(file) => {
              setSelectedFile(file);
              nextStep('SUMMARY_PROCESSING');
            }}
            onBack={() => prevStep('SUMMARY_METHOD')}
          />
        )}

        {/* STEP: SUMMARY_PROCESSING */}
        {step === 'SUMMARY_PROCESSING' && (
          <ProcessingLoader 
            onComplete={handleLoaderComplete}
          />
        )}

        {/* STEP: SUMMARY_CONTENT */}
        {step === 'SUMMARY_CONTENT' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-bold text-white">Resumo do Projeto</h2>

            {formData.summaryMethod === 'questions' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Qual problema sua ideia resolve?</label>
                  <textarea
                    value={formData.summaryQuestions.problem}
                    onChange={(e) => updateSummaryQuestions('problem', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 outline-none h-24 transition-all"
                    placeholder="Descreva a dor do mercado..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Qual a sua solução?</label>
                  <textarea
                    value={formData.summaryQuestions.solution}
                    onChange={(e) => updateSummaryQuestions('solution', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 outline-none h-24 transition-all"
                    placeholder="Como sua ideia funciona..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Qual o grande diferencial?</label>
                  <textarea
                    value={formData.summaryQuestions.difference}
                    onChange={(e) => updateSummaryQuestions('difference', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 outline-none h-24 transition-all"
                    placeholder="Por que você é melhor que a concorrência..."
                  />
                </div>
                
                <div className="pt-4 border-t border-slate-800/50">
                  <button 
                    onClick={async () => {
                      if (!formData.summaryQuestions.problem || !formData.summaryQuestions.solution || !formData.summaryQuestions.difference) {
                        setError("Preencha as três perguntas para que a IA possa lapidar seu pitch.");
                        return;
                      }
                      
                      setIsAiProcessing(true);
                      setAiStatus("Analisando sua inovação...");
                      setError(null);
                      
                      try {
                        setTimeout(() => setAiStatus("Estruturando proposta de valor..."), 1500);
                        setTimeout(() => setAiStatus("Lapidando tom de voz executivo..."), 3000);

                        let summary = "";
                        try {
                          console.log("Tentando lapidar pitch via Vertex AI em Firebase (sem chaves / Spark plan)...");
                          try {
                            // @ts-ignore
                            const { getAI, getGenerativeModel } = await import("firebase/ai");
                            const ai = getAI(app);
                            const model = getGenerativeModel(ai, { model: "gemini-2.0-flash" });
                            const prompt = `Problema: ${formData.summaryQuestions.problem}\nSolução: ${formData.summaryQuestions.solution}\nDiferencial: ${formData.summaryQuestions.difference}`;
                            const response = await model.generateContent({
                              contents: [{ role: "user", parts: [{ text: prompt }] }],
                              systemInstruction: "Você é um especialista em inovação B2B. Sua tarefa é transformar as respostas do inventor em um 'Executive Summary' de alto impacto, profissional e objetivo, adequado para investidores e empresas parceiras. Não use jargões desnecessários. Crie um texto único, coeso e persuasivo (máximo de 3 parágrafos). Não inclua saudações, vá direto ao texto.",
                              generationConfig: {
                                temperature: 0.5,
                                maxOutputTokens: 1024
                              }
                            });
                            summary = response.response.text() || "";
                          } catch (vertexError) {
                            console.warn("Vertex AI em Firebase falhou ou não está habilitado. Tentando via chave de API direta...", vertexError);
                            
                            // Chamada direta do cliente para a API do Gemini
                            const geminiApiKey = (import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY || "").trim();
                            const modelName = "gemini-2.0-flash";
                            const directResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json"
                              },
                              body: JSON.stringify({
                                contents: [{
                                  role: "user",
                                  parts: [{ text: `Problema: ${formData.summaryQuestions.problem}\nSolução: ${formData.summaryQuestions.solution}\nDiferencial: ${formData.summaryQuestions.difference}` }]
                                }],
                                systemInstruction: "Você é um especialista em inovação B2B. Sua tarefa é transformar as respostas do inventor em um 'Executive Summary' de alto impacto, profissional e objetivo, adequado para investidores e empresas parceiras. Não use jargões desnecessários. Crie um texto único, coeso e persuasivo (máximo de 3 parágrafos). Não inclua saudações, vá direto ao texto.",
                                generationConfig: {
                                  temperature: 0.5,
                                  maxOutputTokens: 1024
                                }
                              })
                            });

                            if (!directResponse.ok) {
                              if (directResponse.status === 403) {
                                throw new Error("Erro de autenticação da API (403): Ative a 'Generative Language API' no console do Google Cloud para a sua chave do Firebase, ou configure VITE_GEMINI_API_KEY no arquivo .env.local com uma chave gratuita do Google AI Studio.");
                              }
                              throw new Error("Falha na chamada direta à API do Gemini.");
                            }

                            const directResult = await directResponse.json();
                            summary = directResult.candidates?.[0]?.content?.parts?.[0]?.text || "";
                          }
                        } catch (clientAiError) {
                          console.warn("Chamadas cliente falharam. Tentando Cloud Function como último recurso...", clientAiError);
                          
                          // Fallback final: manual fetch para a Cloud Function
                          const response = await fetch(getFunctionUrl('enhancePitch'), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              data: {
                                ...formData.summaryQuestions,
                                userId: user?.uid
                              }
                            })
                          });

                          if (!response.ok) {
                            throw new Error("Falha na Cloud Function de backup.");
                          }

                          const result = await response.json();
                          summary = result.data.summary;
                        }

                        updateField('summary', summary);
                        updateField('summaryMethod', 'text');
                      } catch (err: any) {
                        console.error(err);
                        const errorMsg = err.message?.includes("403") || err.message?.includes("autenticação")
                           ? "Erro de autenticação da IA: Ative a 'Generative Language API' no console do Google Cloud para a sua chave do Firebase, ou configure VITE_GEMINI_API_KEY no seu arquivo .env.local com uma chave do Google AI Studio."
                           : "Não foi possível conectar com a IA devido às restrições do plano do Firebase. Por favor, configure a chave VITE_GEMINI_API_KEY no arquivo .env.local ou insira o texto manualmente.";
                        setError(errorMsg);
                        updateField('summaryMethod', 'text');
                      } finally {
                        setIsAiProcessing(false);
                      }
                    }}
                    disabled={isAiProcessing}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-500 hover:to-teal-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAiProcessing ? <Loader2 className="animate-spin" size={20} /> : <><Zap size={18} /> Lapidar Pitch com IA</>}
                  </button>
                  <p className="text-center text-xs text-slate-500 mt-3">Powered by NVIDIA NIM</p>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Descreva sua ideia em detalhes</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => updateField('summary', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 outline-none h-64 transition-all"
                  placeholder="Escreva aqui o resumo da sua patente ou ideia de negócio..."
                />
              </div>
            )}

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button 
                onClick={() => {
                  if (formData.role === 'idea') prevStep('SUMMARY_METHOD');
                  else prevStep('LOCATION');
                }} 
                className="flex items-center gap-2 text-slate-400 hover:text-white transition"
              >
                <ArrowLeft size={18} /> Voltar
              </button>
              <button 
                onClick={() => nextStep('REVIEW')} 
                className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: REVIEW */}
        {step === 'REVIEW' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            {formData.summaryMethod === 'document' && (formData as any).technologyDNA ? (
              // Beautiful Digital Twin Preview
              <div className="space-y-8 text-left">
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <Zap size={12} className="animate-pulse" /> Gêmeo Digital de Ativo
                  </div>
                  <h2 className="text-2xl font-black text-white">{(formData as any).title}</h2>
                  <p className="text-xs text-teal-400 font-bold uppercase tracking-wider">Câmara FIESC: {formData.segment}</p>
                </div>

                {/* Overall Score Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 to-teal-950/20 border border-teal-500/10 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-[50px]" />
                  <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
                    <div className="absolute inset-0 bg-teal-500/10 rounded-full blur animate-pulse" />
                    <div className="absolute w-18 h-18 border-2 border-teal-500/20 rounded-full" />
                    <span className="text-2xl font-black text-white">{(formData as any).readinessScores.overall}%</span>
                  </div>
                  <div className="text-center md:text-left space-y-1">
                    <h4 className="text-white font-bold text-base">Transfer Readiness Score</h4>
                    <p className="text-xs text-slate-400">
                      Pontuação geral ponderada para a indústria de <strong className="text-teal-300">{(formData as any).technologyDNA.industry.join(", ")}</strong>.
                    </p>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase text-slate-500 tracking-wider font-bold">Sumário Executivo (IA)</h4>
                  <p className="p-5 rounded-2xl bg-slate-950/50 border border-slate-900 text-sm text-slate-300 leading-relaxed text-justify">
                    {(formData as any).summary}
                  </p>
                </div>

                {/* Scores Radar / Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase text-slate-500 tracking-wider font-bold">Mapeamento de Readiness (Maturidade)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Maturidade Técnica (TRL)", score: (formData as any).readinessScores.technology, desc: "Protótipo operacional validado (TRL 7)" },
                      { label: "Maturidade Comercial (IRL)", score: (formData as any).readinessScores.commercial, desc: "Parceiro piloto pré-identificado" },
                      { label: "Status de Proteção Legal", score: (formData as any).readinessScores.legal, desc: "Patente concedida no INPI" },
                      { label: "Maturidade de Mercado", score: (formData as any).readinessScores.market, desc: "Endereçamento B2B de alta demanda" },
                      { label: "Prontidão de Transferência (TTR)", score: (formData as any).readinessScores.transfer, desc: "NIT e inventores aptos a transferir" },
                      { label: "Moats Regulatórios", score: (formData as any).readinessScores.regulatory, desc: "Dispositivo em conformidade regulatória (ANVISA)" }
                    ].map((item) => (
                      <div key={item.label} className="p-4 rounded-2xl bg-slate-950/30 border border-slate-900 space-y-2">
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

                {/* Technology DNA (Keywords, Competencies, Risks) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3 text-left">
                    <h4 className="text-xs uppercase text-slate-500 tracking-wider font-bold">Technology DNA</h4>
                    <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-900 space-y-4">
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Palavras-chave</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {(formData as any).technologyDNA.keywords.map((kw: string) => (
                            <span key={kw} className="px-2.5 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-300 font-semibold">{kw}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Competências Críticas</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {(formData as any).technologyDNA.competencies.map((cp: string) => (
                            <span key={cp} className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-semibold">{cp}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Riscos Monitorados</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {(formData as any).technologyDNA.risks.map((rk: string) => (
                            <span key={rk} className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-semibold">{rk}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technology Protection & Team */}
                  <div className="space-y-4 text-left">
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase text-slate-500 tracking-wider font-bold">Proteção Tecnológica</h4>
                      <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-900 text-xs space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Situação da PI</span>
                          <span className="text-white font-bold bg-teal-600/30 px-2 py-0.5 rounded border border-teal-500/30 uppercase tracking-wide">{(formData as any).technologyProtection.status === 'granted' ? 'Concedida' : (formData as any).technologyProtection.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Patente (INPI)</span>
                          <span className="text-slate-300 font-mono">{(formData as any).technologyProtection.registrations[0].number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Registro ANVISA</span>
                          <span className="text-slate-300 font-mono">{(formData as any).technologyProtection.registrations[1].number}</span>
                        </div>
                        <div className="h-px bg-slate-900 my-1" />
                        <div className="space-y-1">
                          <span className="text-slate-500 font-medium block">Titularidade</span>
                          <p className="text-[11px] text-slate-300 font-bold leading-relaxed">
                            {(formData as any).technologyProtection.owners.join(" / ")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs uppercase text-slate-500 tracking-wider font-bold">Equipe & Disponibilidade</h4>
                      <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-900 text-xs space-y-3">
                        <div>
                          <p className="text-white font-bold">{(formData as any).team.principalInvestigator}</p>
                          <p className="text-[10px] text-slate-500">{(formData as any).team.laboratoryName}</p>
                        </div>
                        <div className="flex gap-2.5 pt-1">
                          <a href={(formData as any).team.lattesUrl} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300 underline font-semibold">Lattes</a>
                          <span className="text-slate-800">|</span>
                          <a href={(formData as any).team.orcid} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300 underline font-semibold">ORCID</a>
                          <span className="text-slate-800">|</span>
                          <a href={(formData as any).team.linkedinUrl} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300 underline font-semibold">LinkedIn</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VDR Assets */}
                <div className="space-y-3 text-left">
                  <h4 className="text-xs uppercase text-slate-500 tracking-wider font-bold">Virtual Data Room (VDR) Organizadora</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(formData as any).vdrAssets.map((asset: any) => (
                      <div key={asset.id} className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 flex items-center gap-4 hover:border-slate-800 transition">
                        <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{asset.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Partição: {asset.category}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold shrink-0">{(asset.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Original basic review panel
              <>
                <div className="text-center">
                  <CheckCircle2 className="mx-auto text-emerald-400 mb-4" size={56} />
                  <h2 className="text-3xl font-bold text-white mb-2">Tudo Pronto!</h2>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Seu projeto está pronto para ser processado pelo nosso algoritmo de matchmaking.
                  </p>
                </div>

                <div className="grid gap-4 p-6 rounded-2xl bg-slate-950/50 border border-slate-800 text-sm">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Perfil</span>
                    <span className="text-slate-200 font-bold uppercase">{formData.role === 'idea' ? 'Inventor' : formData.role}</span>
                  </div>
                  
                  {formData.role === 'idea' ? (
                    <>
                      <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Segmento</span>
                        <span className="text-slate-200 font-bold">{formData.segment}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Proteção</span>
                        <span className="text-slate-200 font-bold">{formData.isProtected === 'sim' ? 'Protegida' : 'Não Protegida'}</span>
                      </div>
                    </>
                  ) : formData.role === 'ict' ? (
                    <>
                      <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Expertise</span>
                        <span className="text-slate-200 font-bold">{formData.researchLines.length} Linhas</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Infraestrutura</span>
                        <span className="text-slate-200 font-bold">{formData.infrastructure.length} Recursos</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Serviços</span>
                        <span className="text-slate-200 font-bold">{formData.services.length} Categorias</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Capacidade</span>
                        <span className="text-slate-200 font-bold uppercase">{formData.productionCapacity}</span>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={() => prevStep('SUMMARY_CONTENT')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="px-10 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-black text-lg shadow-[0_0_30px_rgba(0,181,156,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <>{ "Finalizar e Gerar Matches" } <Rocket size={24} /></>}
              </button>
            </div>
          </div>
        )}

        </div>

        {/* RIGHT COLUMN: COACHING SIDEBAR */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-[80px] pointer-events-none" />
            
            <div className="space-y-1 mb-6">
              <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">{getStepCoaching(step).subtitle}</span>
              <h3 className="text-lg font-bold text-white tracking-tight">{getStepCoaching(step).title}</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              {getStepCoaching(step).desc}
            </p>
            
            <div className="h-px bg-slate-800/80 my-4" />
            
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Diretriz de Estruturação</h4>
              {getStepCoaching(step).tips.map((tip, idx) => (
                <div key={idx} className="flex gap-2.5 items-start text-xs text-slate-350">
                  <CheckCircle2 className="text-teal-400 shrink-0 mt-0.5" size={14} />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-teal-950/10 border border-teal-550/20 rounded-2xl p-5 flex items-center gap-3 text-slate-500 text-xs backdrop-blur-sm">
            <ShieldCheck size={18} className="text-teal-400/80 shrink-0" />
            <p className="leading-relaxed">
              Ficha de qualificação em conformidade com a Lei nº 10.973/04 (Lei de Inovação). Dados e patentes protegidos no VDR.
            </p>
          </div>
        </div>
      </div>

      {/* IA Processing Overlay */}
      {isAiProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-teal-500/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,181,156,0.2)] max-w-sm w-full text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 bg-teal-500/20 rounded-full animate-ping" />
              <div className="relative bg-teal-600 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,181,156,0.5)]">
                <Zap size={40} className="animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">IA Refinando seu Pitch</h3>
              <p className="text-teal-400 text-sm font-medium animate-pulse">{aiStatus}</p>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
               <div className="bg-teal-500 h-full w-1/2 animate-[shimmer_2s_infinite] rounded-full" />
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Aguarde alguns segundos...</p>
          </div>
        </div>
      )}
    </div>
  );
}
