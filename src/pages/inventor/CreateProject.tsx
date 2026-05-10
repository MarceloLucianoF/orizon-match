import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { createProject } from "../../services/projectService";
import { 
  Loader2, ArrowRight, ArrowLeft, CheckCircle2, 
  Lightbulb, GraduationCap, Factory, ShieldCheck, 
  HelpCircle, MessageSquare, Info, Video, MapPin, Zap, Rocket, Search
} from "lucide-react";
import { TRLCalculator } from "../../components/TRLCalculator";
import { searchPatentsInpi } from "../../services/inpiService";
import type { INPIPatent } from "../../services/inpiService";
import { functions } from "../../firebase/config";
import { httpsCallable } from "firebase/functions";
import { registrationSchema, maskCpfCnpj, maskPhone, validateForm } from "../../lib/validators";

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
  | 'CADASTRO' 
  | 'REVIEW'
  | 'ICT_RESEARCH'
  | 'ICT_INFRA'
  | 'PROVIDER_SERVICES'
  | 'PROVIDER_CAPACITY';

export function CreateProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('ROLE');
  const [loading, setLoading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiStatus, setAiStatus] = useState("");
  const [inpiLoading, setInpiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inpiResults, setInpiResults] = useState<INPIPatent[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Hydration from sessionStorage (Lead Capture)
  useEffect(() => {
    const cachedLead = sessionStorage.getItem('@orizon:lead_data');
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
        // If it comes from lead capture, it probably already has role and segment
        if (leadData.role) setStep('SEGMENT');
        sessionStorage.removeItem('@orizon:lead_data');
      } catch (e) {
        console.error("Erro ao recuperar dados do lead", e);
      }
    }
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    role: "", // idea, ict, provider
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
    // Provider fields
    services: [] as string[],
    productionCapacity: "",
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

  const nextStep = (next: Step) => setStep(next);
  const prevStep = (prev: Step) => setStep(prev);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateRegistration = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      registration: { ...prev.registration, [field]: value }
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
        title: formData.title || "Projeto sem título",
        type: formData.role,
        segment: formData.segment,
        needs: {
          investment: formData.role === 'idea',
          research: formData.needsResearch === 'sim',
          industry: formData.role === 'idea',
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
        }),
        // Provider fields
        ...(formData.role === 'provider' && {
          services: formData.services,
          productionCapacity: formData.productionCapacity,
        }),
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
    const steps: Step[] = ['ROLE', 'SEGMENT', 'PROTECTION', 'RESEARCH', 'INNOVATION_TYPE', 'LOCATION', 'MATURITY', 'SUMMARY_METHOD', 'SUMMARY_CONTENT', 'CADASTRO', 'REVIEW'];
    const currentIndex = steps.indexOf(step);
    return (
      <div className="flex gap-1 mb-8">
        {steps.map((s, i) => (
          <div 
            key={s} 
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= currentIndex ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800'
            }`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Novo Projeto</h1>
        <p className="text-slate-400">Preencha os detalhes para encontrar o match ideal.</p>
      </div>

      {renderProgressBar()}

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-1000" />
        
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-in fade-in zoom-in-95">
            <Info size={18} />
            <div className="flex-1">{error}</div>
            <button onClick={() => setError(null)} className="text-red-400/50 hover:text-red-400">
              <ArrowRight size={18} className="rotate-45" />
            </button>
          </div>
        )}
        {/* STEP: ROLE */}
        {step === 'ROLE' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Como você deseja começar?</h2>
              <p className="text-slate-400">Escolha o seu perfil para este projeto.</p>
            </div>

            <div className="grid gap-4">
              <button
                onClick={() => { updateField('role', 'idea'); nextStep('SEGMENT'); }}
                className="flex items-center gap-6 p-6 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all group/btn"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                  <Lightbulb className="text-amber-400" size={32} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">Tenho uma Ideia</h3>
                  <p className="text-sm text-slate-400">Desejo transformar uma ideia em inovação real.</p>
                </div>
                <ArrowRight className="ml-auto text-slate-600 group-hover/btn:text-indigo-400 group-hover/btn:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => { updateField('role', 'ict'); nextStep('SEGMENT'); }}
                className="flex items-center gap-6 p-6 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all group/btn"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                  <GraduationCap className="text-blue-400" size={32} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">Sou um ICT / Universidade</h3>
                  <p className="text-sm text-slate-400">Ofereço infraestrutura e linhas de pesquisa.</p>
                </div>
                <ArrowRight className="ml-auto text-slate-600 group-hover/btn:text-indigo-400 group-hover/btn:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => { updateField('role', 'provider'); nextStep('SEGMENT'); }}
                className="flex items-center gap-6 p-6 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all group/btn"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                  <Factory className="text-emerald-400" size={32} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">Sou Empresa / Prestador</h3>
                  <p className="text-sm text-slate-400">Ofereço capacidade produtiva ou serviços técnicos.</p>
                </div>
                <ArrowRight className="ml-auto text-slate-600 group-hover/btn:text-indigo-400 group-hover/btn:translate-x-1 transition-all" />
              </button>
            </div>
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
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' 
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {chamber}
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={() => prevStep('ROLE')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={() => {
                  if (formData.role === 'ict') nextStep('ICT_RESEARCH');
                  else if (formData.role === 'provider') nextStep('PROVIDER_SERVICES');
                  else nextStep('PROTECTION');
                }} 
                disabled={!formData.segment}
                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: ICT_RESEARCH — Linhas de Pesquisa */}
        {step === 'ICT_RESEARCH' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Linhas de Pesquisa</h2>
              <p className="text-slate-400">Selecione as áreas de pesquisa do seu ICT.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['Biotecnologia', 'Nanotecnologia', 'Engenharia de Materiais', 'Inteligência Artificial', 
                'Automação Industrial', 'Energia Renovável', 'Agrociência', 'Química Fina', 
                'Robótica', 'Saúde e Biomedicina', 'Ciência de Dados', 'Meio Ambiente'].map(line => (
                <button
                  key={line}
                  onClick={() => {
                    const current = formData.researchLines;
                    const updated = current.includes(line) ? current.filter(l => l !== line) : [...current, line];
                    updateField('researchLines', updated);
                  }}
                  className={`p-4 rounded-xl text-left text-sm font-medium transition-all border ${
                    formData.researchLines.includes(line)
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {line}
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={() => prevStep('SEGMENT')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={() => nextStep('ICT_INFRA')} 
                disabled={formData.researchLines.length === 0}
                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: ICT_INFRA — Infraestrutura */}
        {step === 'ICT_INFRA' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Infraestrutura Disponível</h2>
              <p className="text-slate-400">Quais recursos seu ICT pode oferecer a parceiros?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['Laboratório de P&D', 'Prototipagem Rápida', 'Certificação e Ensaios', 'Análise Laboratorial', 
                'Testes em Campo', 'Simulação Computacional', 'Planta Piloto', 'Metrologia'].map(item => (
                <button
                  key={item}
                  onClick={() => {
                    const current = formData.infrastructure;
                    const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
                    updateField('infrastructure', updated);
                  }}
                  className={`p-4 rounded-xl text-left text-sm font-medium transition-all border ${
                    formData.infrastructure.includes(item)
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={() => prevStep('ICT_RESEARCH')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={() => nextStep('LOCATION')} 
                disabled={formData.infrastructure.length === 0}
                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: PROVIDER_SERVICES — Serviços */}
        {step === 'PROVIDER_SERVICES' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Serviços Oferecidos</h2>
              <p className="text-slate-400">Quais serviços sua empresa pode prestar?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['Consultoria Técnica', 'Fabricação / Usinagem', 'Design de Produto', 'Testes e Ensaios',
                'Logística e Distribuição', 'Montagem Industrial', 'Embalagem', 'Certificação',
                'Manutenção Industrial', 'Engenharia de Processos'].map(svc => (
                <button
                  key={svc}
                  onClick={() => {
                    const current = formData.services;
                    const updated = current.includes(svc) ? current.filter(s => s !== svc) : [...current, svc];
                    updateField('services', updated);
                  }}
                  className={`p-4 rounded-xl text-left text-sm font-medium transition-all border ${
                    formData.services.includes(svc)
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {svc}
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={() => prevStep('SEGMENT')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={() => nextStep('PROVIDER_CAPACITY')} 
                disabled={formData.services.length === 0}
                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: PROVIDER_CAPACITY — Capacidade Produtiva */}
        {step === 'PROVIDER_CAPACITY' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Capacidade Produtiva</h2>
              <p className="text-slate-400">Qual a sua escala de operação?</p>
            </div>

            <div className="grid gap-4">
              {[
                { id: 'prototipagem', label: 'Prototipagem', desc: 'Produção unitária ou lotes muito pequenos para validação.' },
                { id: 'lotes_pequenos', label: 'Lotes Pequenos', desc: 'Produção de 10 a 500 unidades por ciclo.' },
                { id: 'escala_media', label: 'Escala Média', desc: 'Produção de 500 a 10.000 unidades por ciclo.' },
                { id: 'escala_industrial', label: 'Escala Industrial', desc: 'Produção acima de 10.000 unidades. Linha de produção dedicada.' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateField('productionCapacity', opt.id)}
                  className={`p-5 rounded-2xl text-left transition-all border ${
                    formData.productionCapacity === opt.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-base mb-1">{opt.label}</div>
                  <div className="text-xs text-slate-500">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={() => prevStep('PROVIDER_SERVICES')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={() => nextStep('LOCATION')} 
                disabled={!formData.productionCapacity}
                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50"
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
                  formData.isProtected === 'sim' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ShieldCheck size={40} />
                <span className="font-bold">Sim, está</span>
              </button>
              <button
                onClick={() => updateField('isProtected', 'nao')}
                className={`flex flex-col items-center gap-4 p-8 rounded-2xl border transition-all ${
                  formData.isProtected === 'nao' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
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
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-indigo-500 outline-none"
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
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-indigo-500 outline-none"
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
                    <button onClick={() => updateField('isGranted', 'sim')} className={`flex-1 py-2 rounded-lg border transition ${formData.isGranted === 'sim' ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-700 text-slate-400'}`}>Sim</button>
                    <button onClick={() => updateField('isGranted', 'nao')} className={`flex-1 py-2 rounded-lg border transition ${formData.isGranted === 'nao' ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-700 text-slate-400'}`}>Não</button>
                  </div>
                </div>
              </div>
            )}

            {formData.isProtected === 'nao' && (
              <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-4 animate-in zoom-in-95">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <Info size={24} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-white">Importância da Proteção</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Proteger sua ideia é o primeiro passo para uma inovação segura. Temos uma equipe para te auxiliar em todo o processo dentro do portal.
                    </p>
                  </div>
                </div>
                <button className="w-full py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center gap-2 transition border border-indigo-500/20">
                  <Video size={18} /> Assistir Vídeo Explicativo
                </button>
              </div>
            )}

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={() => prevStep('SEGMENT')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={() => nextStep('RESEARCH')} 
                disabled={!formData.isProtected}
                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50"
              >Próximo</button>
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
                  formData.needsResearch === 'sim' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >Sim</button>
              <button
                onClick={() => updateField('needsResearch', 'nao')}
                className={`p-8 rounded-2xl border transition-all font-bold ${
                  formData.needsResearch === 'nao' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >Não</button>
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={() => prevStep('PROTECTION')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={() => nextStep('INNOVATION_TYPE')} 
                disabled={!formData.needsResearch}
                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50"
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
                  formData.innovationType === 'melhoria' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-lg">Melhoria Incremental</div>
                <div className="text-xs text-slate-500">Otimização de produto existente</div>
              </button>
              <button
                onClick={() => updateField('innovationType', 'inovacao')}
                className={`p-8 rounded-2xl border transition-all text-center space-y-2 ${
                  formData.innovationType === 'inovacao' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
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
                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50"
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
                    formData.location.region === region ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
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
                  if (formData.role === 'idea') nextStep('MATURITY');
                  else nextStep('CADASTRO');
                }} 
                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition"
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
                  className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => { updateField('summaryMethod', 'questions'); nextStep('SUMMARY_CONTENT'); }}
                className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-indigo-500 transition-all space-y-4 group/card"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover/card:scale-110 transition-transform">
                  <HelpCircle size={28} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-white">Perguntas Guiadas</h3>
                  <p className="text-sm text-slate-500 mt-2">Nós te ajudamos a construir o resumo através de pequenas perguntas.</p>
                </div>
              </button>

              <button
                onClick={() => { updateField('summaryMethod', 'text'); nextStep('SUMMARY_CONTENT'); }}
                className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-indigo-500 transition-all space-y-4 group/card"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover/card:scale-110 transition-transform">
                  <MessageSquare size={28} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-white">Texto Livre</h3>
                  <p className="text-sm text-slate-500 mt-2">Você escreve o resumo da sua ideia em um único campo de texto.</p>
                </div>
              </button>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <button onClick={() => prevStep('INNOVATION_TYPE')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
            </div>
          </div>
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-indigo-500 outline-none h-24"
                    placeholder="Descreva a dor do mercado..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Qual a sua solução?</label>
                  <textarea
                    value={formData.summaryQuestions.solution}
                    onChange={(e) => updateSummaryQuestions('solution', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-indigo-500 outline-none h-24"
                    placeholder="Como sua ideia funciona..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Qual o grande diferencial?</label>
                  <textarea
                    value={formData.summaryQuestions.difference}
                    onChange={(e) => updateSummaryQuestions('difference', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-indigo-500 outline-none h-24"
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

                        const enhancePitchFn = httpsCallable(functions, 'enhancePitch');
                        const result = await enhancePitchFn(formData.summaryQuestions);
                        const summary = (result.data as any).summary;
                        updateField('summary', summary);
                        updateField('summaryMethod', 'text');
                      } catch (err: any) {
                        console.error(err);
                        const msg = err.message || "Falha na comunicação com a IA.";
                        setError(`${msg} Você pode prosseguir com o texto manual abaixo.`);
                        updateField('summaryMethod', 'text');
                      } finally {
                        setIsAiProcessing(false);
                      }
                    }}
                    disabled={isAiProcessing}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-indigo-500 outline-none h-64"
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
                onClick={() => nextStep('CADASTRO')} 
                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: CADASTRO */}
        {step === 'CADASTRO' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Finalização de Cadastro</h2>
              <p className="text-slate-400">Quase lá! Precisamos de alguns dados para contato.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-full">
                <label className="block text-sm font-medium text-slate-400 mb-1">Razão Social / Nome</label>
                <input
                  type="text"
                  value={formData.registration.name}
                  onChange={(e) => { updateRegistration('name', e.target.value); setFieldErrors(prev => ({ ...prev, name: '' })); }}
                  className={`w-full bg-slate-950 border rounded-lg px-4 py-2.5 text-slate-200 focus:border-indigo-500 outline-none transition ${fieldErrors.name ? 'border-red-500' : 'border-slate-800'}`}
                  placeholder="Nome completo ou razão social"
                />
                {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">CNPJ / CPF</label>
                <input
                  type="text"
                  value={formData.registration.idNumber}
                  onChange={(e) => { updateRegistration('idNumber', maskCpfCnpj(e.target.value)); setFieldErrors(prev => ({ ...prev, idNumber: '' })); }}
                  className={`w-full bg-slate-950 border rounded-lg px-4 py-2.5 text-slate-200 focus:border-indigo-500 outline-none transition ${fieldErrors.idNumber ? 'border-red-500' : 'border-slate-800'}`}
                  placeholder="000.000.000-00"
                />
                {fieldErrors.idNumber && <p className="text-red-400 text-xs mt-1">{fieldErrors.idNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Telefone</label>
                <input
                  type="text"
                  value={formData.registration.phone}
                  onChange={(e) => { updateRegistration('phone', maskPhone(e.target.value)); setFieldErrors(prev => ({ ...prev, phone: '' })); }}
                  className={`w-full bg-slate-950 border rounded-lg px-4 py-2.5 text-slate-200 focus:border-indigo-500 outline-none transition ${fieldErrors.phone ? 'border-red-500' : 'border-slate-800'}`}
                  placeholder="(00) 00000-0000"
                />
                {fieldErrors.phone && <p className="text-red-400 text-xs mt-1">{fieldErrors.phone}</p>}
              </div>
              <div className="col-span-full">
                <label className="block text-sm font-medium text-slate-400 mb-1">E-mail</label>
                <input
                  type="email"
                  value={formData.registration.email}
                  onChange={(e) => { updateRegistration('email', e.target.value); setFieldErrors(prev => ({ ...prev, email: '' })); }}
                  className={`w-full bg-slate-950 border rounded-lg px-4 py-2.5 text-slate-200 focus:border-indigo-500 outline-none transition ${fieldErrors.email ? 'border-red-500' : 'border-slate-800'}`}
                  placeholder="seu@email.com"
                />
                {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
              </div>
              {!user && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Senha</label>
                    <input
                      type="password"
                      value={formData.registration.password}
                      onChange={(e) => updateRegistration('password', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:border-indigo-500 outline-none"
                      placeholder="Min. 6 caracteres"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Confirmar Senha</label>
                    <input
                      type="password"
                      value={formData.registration.confirmPassword}
                      onChange={(e) => updateRegistration('confirmPassword', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:border-indigo-500 outline-none"
                      placeholder="Repita a senha"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button 
                onClick={() => {
                  if (formData.role === 'idea') prevStep('SUMMARY_CONTENT');
                  else prevStep('LOCATION');
                }} 
                className="flex items-center gap-2 text-slate-400 hover:text-white transition"
              >
                <ArrowLeft size={18} /> Voltar
              </button>
              <button 
                onClick={() => {
                  const errors = validateForm(registrationSchema, formData.registration);
                  setFieldErrors(errors);
                  if (Object.keys(errors).length === 0) nextStep('REVIEW');
                }} 
                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: REVIEW */}
        {step === 'REVIEW' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="text-center">
              <CheckCircle2 className="mx-auto text-emerald-400 mb-4" size={56} />
              <h2 className="text-3xl font-bold text-white mb-2">Tudo Pronto!</h2>
              <p className="text-slate-400 max-w-md mx-auto">
                Seu projeto está pronto para ser processado pelo nosso algoritmo de matchmaking.
              </p>
            </div>

            <div className="grid gap-4 p-6 rounded-2xl bg-slate-950/50 border border-slate-800 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Segmento</span>
                <span className="text-slate-200 font-bold">{formData.segment}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Proteção</span>
                <span className="text-slate-200 font-bold">{formData.isProtected === 'sim' ? 'Protegida (Patente)' : 'Não Protegida'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Tipo</span>
                <span className="text-slate-200 font-bold uppercase">{formData.innovationType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">P&D</span>
                <span className="text-slate-200 font-bold">{formData.needsResearch === 'sim' ? 'Necessário' : 'Não Necessário'}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={() => prevStep('CADASTRO')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-black text-lg shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <>{ "Finalizar e Gerar Matches" } <Rocket size={24} /></>}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* IA Processing Overlay */}
      {isAiProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-indigo-500/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(79,70,229,0.2)] max-w-sm w-full text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
              <div className="relative bg-indigo-600 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]">
                <Zap size={40} className="animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">IA Refinando seu Pitch</h3>
              <p className="text-indigo-400 text-sm font-medium animate-pulse">{aiStatus}</p>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
               <div className="bg-indigo-500 h-full w-1/2 animate-[shimmer_2s_infinite] rounded-full" />
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Aguarde alguns segundos...</p>
          </div>
        </div>
      )}
    </div>
  );
}
