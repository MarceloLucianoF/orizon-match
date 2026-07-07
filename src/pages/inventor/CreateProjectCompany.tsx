import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { createProject } from "../../services/projectService";
import { 
  Loader2, ArrowRight, ArrowLeft, CheckCircle2, 
  Info, MapPin, Zap, Rocket
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
  | 'SEGMENT' 
  | 'PROVIDER_SERVICES'
  | 'PROVIDER_CAPACITY'
  | 'PROVIDER_THESIS'
  | 'PROVIDER_MODEL'
  | 'LOCATION'
  | 'REVIEW';

export function CreateProjectCompany() {
  const { user, impersonatingAdminId } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('SEGMENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          if (leadData.role === 'provider') setStep('PROVIDER_SERVICES');
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
    role: "provider",
    segment: "",
    location: {
      region: "Sudeste"
    },
    services: [] as string[],
    productionCapacity: "",
    innovationThesis: "",
    partnershipModel: [] as string[],
    registration: {
      name: "",
      idNumber: "",
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

    try {
      const projectId = await createProject({
        userId: user.uid,
        updatedByAdmin: !!impersonatingAdminId,
        adminId: impersonatingAdminId || null,
        title: formData.title || "Projeto da Empresa",
        type: "provider",
        segment: formData.segment,
        needs: {
          investment: false,
          research: false,
          industry: false,
        },
        location: {
          region: formData.location.region,
        },
        services: formData.services,
        productionCapacity: formData.productionCapacity,
        innovationThesis: formData.innovationThesis,
        partnershipModel: formData.partnershipModel,
        linkedAssets: [],
        maturity: 1,
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
    const steps: Step[] = ['SEGMENT', 'PROVIDER_SERVICES', 'PROVIDER_CAPACITY', 'PROVIDER_THESIS', 'PROVIDER_MODEL', 'LOCATION', 'REVIEW'];
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
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Perfil Empresa</h1>
        <p className="text-slate-400">Preencha os detalhes da sua empresa para encontrar parceiros ideais.</p>
      </div>

      {renderProgressBar()}

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-1000" />
        
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
              <h2 className="text-2xl font-bold text-white">Segmento de Atuação</h2>
              <p className="text-slate-400">Selecione a Câmara ou Comitê da FIESC mais adequada.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FIESC_CHAMBERS.map(chamber => (
                <button
                  key={chamber}
                  onClick={() => updateField('segment', chamber)}
                  className={`p-4 rounded-xl text-left text-sm font-medium transition-all border ${
                    formData.segment === chamber 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {chamber}
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => nextStep('PROVIDER_SERVICES')} 
                disabled={!formData.segment}
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition disabled:opacity-50"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: PROVIDER_SERVICES */}
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
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition disabled:opacity-50"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: PROVIDER_CAPACITY */}
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
                onClick={() => nextStep('PROVIDER_THESIS')} 
                disabled={!formData.productionCapacity}
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition disabled:opacity-50"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: PROVIDER_THESIS */}
        {step === 'PROVIDER_THESIS' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Tese de Inovação</h2>
              <p className="text-slate-400">O que sua empresa busca resolver no ecossistema?</p>
            </div>

            <div className="space-y-4">
              <textarea
                value={formData.innovationThesis}
                onChange={(e) => updateField('innovationThesis', e.target.value)}
                placeholder="Ex: Buscamos soluções de eficiência energética e novos materiais para o setor automotivo..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm text-slate-200 focus:border-emerald-500 outline-none h-48 transition-all resize-none"
              />
              <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 flex gap-3 items-start">
                <Zap size={20} className="text-emerald-400 mt-1" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <strong>Dica Orizon:</strong> Descreva seus desafios atuais. Nossa IA usará este texto para encontrar inventores que tenham a solução exata para você.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={() => prevStep('PROVIDER_CAPACITY')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={() => nextStep('PROVIDER_MODEL')} 
                disabled={!formData.innovationThesis}
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition disabled:opacity-50"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: PROVIDER_MODEL */}
        {step === 'PROVIDER_MODEL' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Modelo de Parceria</h2>
              <p className="text-slate-400">Como você prefere atuar com parceiros?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['Co-desenvolvimento (P&D)', 'Licenciamento de Tecnologia', 'M&A / Aquisição', 'CVC (Investimento)', 
                'Contratação Direta', 'Mentoria e Networking', 'Aceleração de Projetos', 'Joint Venture'].map(item => (
                <button
                  key={item}
                  onClick={() => {
                    const current = formData.partnershipModel;
                    const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
                    updateField('partnershipModel', updated);
                  }}
                  className={`p-4 rounded-xl text-left text-sm font-medium transition-all border ${
                    formData.partnershipModel.includes(item)
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={() => prevStep('PROVIDER_THESIS')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={() => nextStep('LOCATION')} 
                disabled={formData.partnershipModel.length === 0}
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition disabled:opacity-50"
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
                    formData.location.region === region ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <MapPin size={20} />
                  <span className="font-bold">{region}</span>
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button 
                onClick={() => prevStep('PROVIDER_MODEL')} 
                className="flex items-center gap-2 text-slate-400 hover:text-white transition"
              >
                <ArrowLeft size={18} /> Voltar
              </button>
              <button 
                onClick={() => nextStep('REVIEW')} 
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
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
                Seu perfil de empresa está pronto para ser processado pelo nosso algoritmo de matchmaking.
              </p>
            </div>

            <div className="grid gap-4 p-6 rounded-2xl bg-slate-950/50 border border-slate-800 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Perfil</span>
                <span className="text-slate-200 font-bold uppercase">Empresa / Prestador</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Serviços</span>
                <span className="text-slate-200 font-bold">{formData.services.length} Categorias</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Capacidade</span>
                <span className="text-slate-200 font-bold uppercase">{formData.productionCapacity}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={() => prevStep('LOCATION')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
