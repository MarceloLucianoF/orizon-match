import { useState } from 'react';
import { 
  Lightbulb, Factory, GraduationCap, ArrowRight, 
  Loader2, Star, Lock, ShieldCheck, HelpCircle, 
  Video, ArrowLeft, MessageSquare, Zap, Rocket, Info 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { functions } from "../../firebase/config";
import { httpsCallable } from "firebase/functions";
import { explainMatch } from "../../lib/matching";

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

type Step = 
  | 'PROFILE' 
  | 'EMAIL' 
  | 'SEGMENT' 
  | 'PROTECTION' 
  | 'RESEARCH' 
  | 'INNOVATION_TYPE' 
  | 'SUMMARY_METHOD'
  | 'SUMMARY_CONTENT'
  | 'FINAL_REGISTER' 
  | 'RESULTS';

export default function PublicOnboarding() {
  const [step, setStep] = useState<Step>('PROFILE');
  const [loading, setLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    role: '',
    email: '',
    segment: '',
    isProtected: '',
    patentNumber: '',
    isGranted: '',
    needsResearch: '',
    innovationType: '',
    summaryMethod: '', // questions, text
    summary: '',
    summaryQuestions: {
      problem: '',
      solution: '',
      difference: ''
    },
    maturity: 1,
    trlMin: 1,
    trlMax: 9,
    needs: { investment: true, research: false, industry: true },
    name: '',
    idNumber: '', // CNPJ/CPF
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const nextStep = (next: Step) => setStep(next);
  const prevStep = (prev: Step) => setStep(prev);

  const updateField = (field: string, value: any) => setFormData(p => ({ ...p, [field]: value }));
  const updateSummaryQuestions = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      summaryQuestions: { ...prev.summaryQuestions, [field]: value }
    }));
  };

  const handleGeneratePreview = async () => {
    setLoading(true);
    setStep('RESULTS');
    
    const finalSummary = formData.summaryMethod === 'questions' 
      ? `Problema: ${formData.summaryQuestions.problem}\nSolução: ${formData.summaryQuestions.solution}\nDiferencial: ${formData.summaryQuestions.difference}`
      : formData.summary;

    try {
      const previewMatchesFn = httpsCallable(functions, 'previewMatches');
      
      const dataForBackend = {
        title: "Meu Projeto Inovador",
        type: formData.role === 'inventor' ? 'startup' : formData.role,
        segment: formData.segment,
        maturity: formData.maturity,
        needs: {
          investment: true,
          research: formData.needsResearch === 'sim',
          industry: true
        },
        summary: finalSummary,
        location: { region: "sudeste" }
      };
      
      const result = await previewMatchesFn(dataForBackend);
      setPreviewResult(result.data);
    } catch (error) {
      console.error("Error generating preview:", error);
      setPreviewResult({
        total: Math.floor(Math.random() * 15) + 5,
        topMatches: [
          { score: 85, name: "Empresa Parceira Orizon", breakdown: { segment: 30, needs: 20 } },
          { score: 78, name: "Fundo de Investimento", breakdown: { segment: 30, needs: 0 } },
          { score: 72, name: "Indústria Local", breakdown: { segment: 10, needs: 20 } },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const ProgressBar = () => {
    const steps: Step[] = ['PROFILE', 'EMAIL', 'SEGMENT', 'PROTECTION', 'RESEARCH', 'INNOVATION_TYPE', 'SUMMARY_METHOD', 'SUMMARY_CONTENT', 'FINAL_REGISTER'];
    const currentIndex = steps.indexOf(step === 'RESULTS' ? 'FINAL_REGISTER' : step);
    
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
    <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px]"></div>
      </div>

      <div className="max-w-xl w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10">
        
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="font-semibold text-xl text-white tracking-tight">Orizon Match</Link>
          <Link to="/login" className="text-slate-400 hover:text-white transition text-sm">Já tenho conta</Link>
        </div>

        {step !== 'RESULTS' && <ProgressBar />}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-in fade-in zoom-in-95">
            <Info size={18} />
            <div className="flex-1">{error}</div>
            <button onClick={() => setError(null)} className="text-red-400/50 hover:text-red-400">
              <ArrowLeft size={18} className="rotate-45" />
            </button>
          </div>
        )}

        {/* STEP: PROFILE */}
        {step === 'PROFILE' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white leading-tight">Como você se identifica?</h2>
              <p className="text-slate-400">Escolha o seu perfil para começar.</p>
            </div>
            
            <div className="grid gap-3">
              {[
                { id: 'inventor', label: 'Tenho uma Ideia / Sou Inventor', icon: <Lightbulb className="text-amber-400"/> },
                { id: 'ict', label: 'Sou uma ICT / Universidade', icon: <GraduationCap className="text-blue-400"/> },
                { id: 'provider', label: 'Sou Empresa / Investidor', icon: <Factory className="text-emerald-400"/> }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { updateField('role', opt.id); nextStep('EMAIL'); }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition text-left group ${
                    formData.role === opt.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/40 hover:border-indigo-500/50 hover:bg-slate-800'
                  }`}
                >
                  <div className="p-3 bg-slate-900 rounded-xl group-hover:scale-110 transition duration-300">{opt.icon}</div>
                  <span className="font-medium text-slate-200">{opt.label}</span>
                  <ArrowRight className="ml-auto text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP: EMAIL */}
        {step === 'EMAIL' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Qual seu melhor e-mail?</h2>
              <p className="text-slate-400">Usaremos para salvar seu progresso e enviar o Radar de Oportunidades.</p>
            </div>

            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="seu@email.com" 
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 focus:outline-none focus:border-indigo-500 text-slate-200 text-lg" 
            />

            <div className="flex gap-4 pt-4">
              <button onClick={() => prevStep('PROFILE')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={() => nextStep('SEGMENT')} 
                disabled={!formData.email}
                className="flex-1 p-4 rounded-xl bg-indigo-600 disabled:bg-slate-800 text-white font-bold transition shadow-[0_0_15px_rgba(79,70,229,0.3)]"
              >Continuar</button>
            </div>
          </div>
        )}

        {/* STEP: SEGMENT */}
        {step === 'SEGMENT' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Segmento do Projeto</h2>
              <p className="text-slate-400">Qual Câmara da FIESC melhor representa sua ideia?</p>
            </div>
            
            <div className="max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar grid gap-2">
              {FIESC_CHAMBERS.map(chamber => (
                <button
                  key={chamber}
                  onClick={() => updateField('segment', chamber)}
                  className={`p-3 rounded-xl text-left text-sm font-medium transition-all border ${
                    formData.segment === chamber 
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' 
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {chamber}
                </button>
              ))}
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-800">
              <button onClick={() => prevStep('EMAIL')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={() => nextStep('PROTECTION')} 
                disabled={!formData.segment}
                className="flex-1 p-4 rounded-xl bg-indigo-600 disabled:bg-slate-800 font-bold transition"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: PROTECTION */}
        {step === 'PROTECTION' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Sua inovação já está protegida?</h2>
              <p className="text-slate-400 text-sm">A proteção IP é vital para a confiança do investidor.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateField('isProtected', 'sim')}
                className={`flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all ${
                  formData.isProtected === 'sim' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ShieldCheck size={32} />
                <span className="font-bold">Sim, está</span>
              </button>
              <button
                onClick={() => updateField('isProtected', 'nao')}
                className={`flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all ${
                  formData.isProtected === 'nao' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <HelpCircle size={32} />
                <span className="font-bold">Não, ainda não</span>
              </button>
            </div>

            {formData.isProtected === 'sim' && (
              <div className="space-y-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800 animate-in zoom-in-95">
                <input 
                  type="text" 
                  value={formData.patentNumber}
                  onChange={(e) => updateField('patentNumber', e.target.value)}
                  placeholder="Número do processo de Patente" 
                  className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {formData.isProtected === 'nao' && (
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-3 animate-in zoom-in-95">
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Importância da Proteção:</strong> Proteger sua ideia evita cópias e atrai investimentos sérios.
                </p>
                <button className="w-full py-2 rounded-lg bg-indigo-600/20 text-indigo-300 text-xs font-bold flex items-center justify-center gap-2 transition">
                  <Video size={14} /> Entenda como proteger sua ideia
                </button>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t border-slate-800">
              <button onClick={() => prevStep('SEGMENT')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={() => nextStep('RESEARCH')} 
                disabled={!formData.isProtected}
                className="flex-1 p-4 rounded-xl bg-indigo-600 disabled:bg-slate-800 font-bold transition"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: RESEARCH */}
        {step === 'RESEARCH' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">P&D é necessário?</h2>
              <p className="text-slate-400">Você precisa de apoio de laboratórios ou ICTs para criar o protótipo?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateField('needsResearch', 'sim')}
                className={`p-6 rounded-2xl border transition-all font-bold ${
                  formData.needsResearch === 'sim' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >Sim</button>
              <button
                onClick={() => updateField('needsResearch', 'nao')}
                className={`p-6 rounded-2xl border transition-all font-bold ${
                  formData.needsResearch === 'nao' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >Não</button>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-800">
              <button onClick={() => prevStep('PROTECTION')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={() => nextStep('INNOVATION_TYPE')} 
                disabled={!formData.needsResearch}
                className="flex-1 p-4 rounded-xl bg-indigo-600 disabled:bg-slate-800 font-bold transition"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: INNOVATION_TYPE */}
        {step === 'INNOVATION_TYPE' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Tipo de Inovação</h2>
              <p className="text-slate-400">Seu projeto é uma melhoria ou algo radical?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateField('innovationType', 'melhoria')}
                className={`p-6 rounded-2xl border transition-all text-center ${
                  formData.innovationType === 'melhoria' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold">Melhoria</div>
                <div className="text-[10px] text-slate-500">Incremental</div>
              </button>
              <button
                onClick={() => updateField('innovationType', 'inovacao')}
                className={`p-6 rounded-2xl border transition-all text-center ${
                  formData.innovationType === 'inovacao' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold">Inovação</div>
                <div className="text-[10px] text-slate-500">Radical</div>
              </button>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-800">
              <button onClick={() => prevStep('RESEARCH')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={() => nextStep('SUMMARY_METHOD')} 
                disabled={!formData.innovationType}
                className="flex-1 p-4 rounded-xl bg-indigo-600 disabled:bg-slate-800 font-bold transition"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: SUMMARY_METHOD */}
        {step === 'SUMMARY_METHOD' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 text-center">
            <h2 className="text-2xl font-bold text-white">Como deseja descrever sua ideia?</h2>
            <div className="grid gap-4 mt-6">
              <button
                onClick={() => { updateField('summaryMethod', 'questions'); nextStep('SUMMARY_CONTENT'); }}
                className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-indigo-500 transition-all flex items-center gap-4"
              >
                <HelpCircle className="text-indigo-400" size={32} />
                <div className="text-left">
                  <div className="font-bold">Perguntas Guiadas</div>
                  <div className="text-xs text-slate-500">Te ajudamos a construir o resumo</div>
                </div>
              </button>
              <button
                onClick={() => { updateField('summaryMethod', 'text'); nextStep('SUMMARY_CONTENT'); }}
                className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-indigo-500 transition-all flex items-center gap-4"
              >
                <MessageSquare className="text-emerald-400" size={32} />
                <div className="text-left">
                  <div className="font-bold">Texto Livre</div>
                  <div className="text-xs text-slate-500">Escreva tudo em um único campo</div>
                </div>
              </button>
            </div>
            <button onClick={() => prevStep('INNOVATION_TYPE')} className="mt-6 text-sm text-slate-500 hover:text-white transition">Voltar</button>
          </div>
        )}

        {/* STEP: SUMMARY_CONTENT */}
        {step === 'SUMMARY_CONTENT' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-bold text-white">Resumo do Projeto</h2>
            {formData.summaryMethod === 'questions' ? (
              <div className="space-y-4">
                <textarea
                  value={formData.summaryQuestions.problem}
                  onChange={(e) => updateSummaryQuestions('problem', e.target.value)}
                  placeholder="Qual problema sua ideia resolve?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-indigo-500 h-20"
                />
                <textarea
                  value={formData.summaryQuestions.solution}
                  onChange={(e) => updateSummaryQuestions('solution', e.target.value)}
                  placeholder="Qual a sua solução?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-indigo-500 h-20"
                />
                <textarea
                  value={formData.summaryQuestions.difference}
                  onChange={(e) => updateSummaryQuestions('difference', e.target.value)}
                  placeholder="Qual o grande diferencial?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-indigo-500 h-20"
                />
                <div className="pt-2 border-t border-slate-800/50">
                  <button 
                    onClick={async () => {
                      if (!formData.summaryQuestions.problem || !formData.summaryQuestions.solution || !formData.summaryQuestions.difference) {
                        setError("Preencha as três perguntas para que a IA possa lapidar seu pitch.");
                        return;
                      }
                      setLoading(true);
                      setError(null);
                      try {
                        const enhancePitchFn = httpsCallable(functions, 'enhancePitch');
                        const result = await enhancePitchFn(formData.summaryQuestions);
                        const summary = (result.data as any).summary;
                        updateField('summary', summary);
                        updateField('summaryMethod', 'text');
                      } catch (error) {
                        console.error(error);
                        setError("Falha na comunicação com a IA. Você pode prosseguir com o resumo manual.");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <><Zap size={18} /> Lapidar Pitch com IA</>}
                  </button>
                  <p className="text-center text-[10px] text-slate-500 mt-2">Powered by NVIDIA NIM</p>
                </div>
              </div>
            ) : (
              <textarea
                value={formData.summary}
                onChange={(e) => updateField('summary', e.target.value)}
                placeholder="Descreva sua ideia em detalhes..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 outline-none focus:border-indigo-500 h-64"
              />
            )}
            <div className="flex gap-4 pt-4 border-t border-slate-800">
              <button onClick={() => prevStep('SUMMARY_METHOD')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button onClick={() => nextStep('FINAL_REGISTER')} className="flex-1 p-4 rounded-xl bg-indigo-600 font-bold transition">Próximo</button>
            </div>
          </div>
        )}

        {/* STEP: FINAL_REGISTER */}
        {step === 'FINAL_REGISTER' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white leading-tight">Finalização de Cadastro</h2>
              <p className="text-slate-400">Precisamos de alguns dados para criar seu perfil de acesso.</p>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => updateField('name', e.target.value)} 
                  placeholder="Razão Social / Nome" 
                  className="col-span-2 w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                />
                <input 
                  type="text" 
                  value={formData.idNumber} 
                  onChange={(e) => updateField('idNumber', e.target.value)} 
                  placeholder="CNPJ / CPF" 
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                />
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={(e) => updateField('phone', e.target.value)} 
                  placeholder="Telefone" 
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                />
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={(e) => updateField('password', e.target.value)} 
                  placeholder="Senha" 
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                />
                <input 
                  type="password" 
                  value={formData.confirmPassword} 
                  onChange={(e) => updateField('confirmPassword', e.target.value)} 
                  placeholder="Confirmar" 
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-800">
              <button onClick={() => prevStep('SUMMARY_CONTENT')} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={18} /> Voltar</button>
              <button 
                onClick={handleGeneratePreview}
                disabled={!formData.name || !formData.idNumber || !formData.password || formData.password !== formData.confirmPassword}
                className="flex-1 p-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold transition shadow-[0_0_20px_rgba(79,70,229,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
              >Gerar Matches Agora <Rocket size={20} /></button>
            </div>
          </div>
        )}

        {/* STEP: RESULTS */}
        {step === 'RESULTS' && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            {loading ? (
              <div className="py-12 flex flex-col items-center text-center space-y-4">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
                <p className="text-lg text-slate-300 font-medium">Orizon Match operando...</p>
                <p className="text-sm text-slate-500">Buscando investidores e parceiros compatíveis...</p>
              </div>
            ) : previewResult && (
              <div>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
                    <Star size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Processo Concluído!</h2>
                  <p className="text-slate-400 text-sm">
                    Encontramos {previewResult.total} potenciais matches para seu perfil de {formData.segment}.
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {previewResult.topMatches.map((match: any, idx: number) => (
                    <div key={idx} className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center font-bold text-slate-300">
                        {match.score}%
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                          <Lock size={14} className="text-slate-500" /> {match.name}
                        </h4>
                        <div className="w-full bg-slate-800 rounded-full h-1 mt-2 mb-1">
                          <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-1 rounded-full" style={{ width: `${match.score}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{explainMatch(match.breakdown)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all font-bold text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] w-full justify-center">
                    Fazer Login e Ver Conexões <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
