import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { createProject } from "../../services/projectService";
import { 
  Loader2, ArrowRight, ArrowLeft, CheckCircle2, 
  Info, MapPin, Rocket
} from "lucide-react";

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
  | 'LINK_ASSETS'
  | 'ICT_RESEARCH'
  | 'ICT_INFRA'
  | 'ICT_FOMENTO'
  | 'ICT_PI'
  | 'PROVIDER_SERVICES'
  | 'PROVIDER_CAPACITY'
  | 'PROVIDER_THESIS'
  | 'PROVIDER_MODEL';

export function CreateProjectICT() {
  const { user, impersonatingAdminId } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('SEGMENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const [formData, setFormData] = useState({
    title: "",
    role: "ict", // idea, ict, provider
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

  const nextStep = (next: Step) => setStep(next);
  const prevStep = (prev: Step) => setStep(prev);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        type: "ict",
        segment: formData.segment,
        needs: {
          investment: false,
          research: false,
          industry: false,
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
    let steps: Step[] = ['SEGMENT', 'ICT_RESEARCH', 'ICT_INFRA', 'ICT_FOMENTO', 'ICT_PI', 'LOCATION', 'REVIEW'];

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
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Novo Projeto</h1>
        <p className="text-slate-400">Preencha os detalhes para encontrar o match ideal.</p>
      </div>

      {renderProgressBar()}

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
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
                onClick={() => nextStep('ICT_RESEARCH')} 
                disabled={!formData.segment}
                className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition disabled:opacity-50"
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
                className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition disabled:opacity-50"
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
                onClick={() => nextStep('ICT_FOMENTO')} 
                disabled={formData.infrastructure.length === 0}
                className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition disabled:opacity-50"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: ICT_FOMENTO — Acesso a Fomento */}
        {step === 'ICT_FOMENTO' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Acesso a Fomento</h2>
              <p className="text-slate-400">Quais linhas de financiamento seu ICT costuma operar?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['Unidade Embrapii', 'FINEP', 'FAPESP / FAPESC', 'BNDES', 'Recursos Próprios', 'Incentivos Fiscais', 'Editais Internos', 'Convênios'].map(item => (
                <button
                  key={item}
                  onClick={() => {
                    const current = formData.fomentoAccess;
                    const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
                    updateField('fomentoAccess', updated);
                  }}
                  className={`p-4 rounded-xl text-left text-sm font-medium transition-all border ${
                    formData.fomentoAccess.includes(item)
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={() => prevStep('ICT_INFRA')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={() => nextStep('ICT_PI')} 
                disabled={formData.fomentoAccess.length === 0}
                className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition disabled:opacity-50"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: ICT_PI — Política de PI */}
        {step === 'ICT_PI' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Política de PI</h2>
              <p className="text-slate-400">Como sua instituição lida com a co-titularidade?</p>
            </div>

            <div className="grid gap-3">
              {[
                { id: 'licenciamento', label: 'Licenciamento Exclusivo', desc: 'Permitimos o uso exclusivo pela empresa parceira via royalties.' },
                { id: 'co_titularidade', label: 'Co-titularidade', desc: 'A patente é dividida entre o ICT e a empresa (mais comum).' },
                { id: 'aberta', label: 'Inovação Aberta', desc: 'Foco em transferência rápida de tecnologia para o mercado.' },
                { id: 'sob_demanda', label: 'Sob Demanda', desc: 'Políticas flexíveis de acordo com o contrato.' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateField('piPolicy', opt.id)}
                  className={`p-5 rounded-2xl text-left transition-all border ${
                    formData.piPolicy === opt.id
                      ? 'bg-teal-500/10 border-teal-500 text-teal-300'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-base mb-1">{opt.label}</div>
                  <div className="text-xs text-slate-500">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={() => prevStep('ICT_FOMENTO')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={() => nextStep('LOCATION')} 
                disabled={!formData.piPolicy}
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
                onClick={() => prevStep('ICT_PI')} 
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

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={() => prevStep('LOCATION')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
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

    </div>
  );
}
