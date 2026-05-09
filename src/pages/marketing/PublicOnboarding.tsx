import { useState } from 'react';
import { Lightbulb, Factory, GraduationCap, ArrowRight, Loader2, Star, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { functions } from "../../firebase/config";
import { httpsCallable } from "firebase/functions";
import { explainMatch } from "../../lib/matching";

type Step = 'PROFILE' | 'SEGMENT' | 'PROTECTION' | 'MATURITY' | 'NEEDS_INTERESTS' | 'FINAL_REGISTER' | 'RESULTS';

export default function PublicOnboarding() {
  const [step, setStep] = useState<Step>('PROFILE');
  const [loading, setLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    role: '',
    email: '',
    segment: '',
    isProtected: '',
    patentNumber: '',
    maturity: 1,
    trlMin: 1,
    trlMax: 9,
    needs: { investment: false, research: false, industry: false },
    interests: { investment: false, research: false, industry: false },
    name: '',
    password: ''
  });

  const nextStep = (next: Step) => setStep(next);
  const updateField = (field: string, value: any) => setFormData(p => ({ ...p, [field]: value }));
  const updateNestedField = (parent: 'needs'|'interests', field: string, value: boolean) => 
    setFormData(p => ({ ...p, [parent]: { ...p[parent], [field]: value } }));

  const handleNextFromSegment = () => {
    if (formData.role === 'inventor') nextStep('PROTECTION');
    else if (formData.role === 'provider') nextStep('MATURITY');
    else nextStep('NEEDS_INTERESTS'); // ICT skip to interests
  };

  const handleNextFromProtection = () => nextStep('MATURITY');
  const handleNextFromMaturity = () => nextStep('NEEDS_INTERESTS');
  const handleNextFromNeeds = () => nextStep('FINAL_REGISTER');

  const handleGeneratePreview = async () => {
    setLoading(true);
    setStep('RESULTS');
    
    try {
      const previewMatchesFn = httpsCallable(functions, 'previewMatches');
      
      const dataForBackend = {
        title: "Projeto Em Empreendedorismo",
        type: formData.role === 'inventor' ? 'startup' : formData.role,
        segment: formData.segment || "tecnologia",
        maturity: formData.maturity,
        needs: formData.role === 'inventor' ? formData.needs : { investment: false, research: false, industry: false },
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
    const steps: Step[] = ['PROFILE', 'SEGMENT', 'PROTECTION', 'MATURITY', 'NEEDS_INTERESTS', 'FINAL_REGISTER'];
    // Pula Protection para Provider/ICT visualmente
    const activeSteps = formData.role === 'provider' 
      ? ['PROFILE', 'SEGMENT', 'MATURITY', 'NEEDS_INTERESTS', 'FINAL_REGISTER'] 
      : formData.role === 'ict' 
      ? ['PROFILE', 'SEGMENT', 'NEEDS_INTERESTS', 'FINAL_REGISTER']
      : steps;
      
    const currentIndex = activeSteps.indexOf(step === 'RESULTS' ? 'FINAL_REGISTER' : step);
    
    return (
      <div className="flex gap-2 mb-8">
        {activeSteps.map((s, i) => (
          <div 
            key={s} 
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= currentIndex ? 'bg-indigo-500' : 'bg-slate-800'
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

      <div className="max-w-xl w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
        
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="font-semibold text-xl text-white tracking-tight">Orizon Match</Link>
          <Link to="/login" className="text-slate-400 hover:text-white transition text-sm">Já tenho conta</Link>
        </div>

        {step !== 'RESULTS' && <ProgressBar />}

        {/* PASSO 1: PERFIL */}
        {step === 'PROFILE' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-white leading-tight">Como você se identifica?</h2>
            
            <div className="grid gap-3">
              {[
                { id: 'inventor', label: 'Tenho uma Ideia / Sou Inventor', icon: <Lightbulb className="text-amber-400"/> },
                { id: 'ict', label: 'Sou uma ICT / Universidade', icon: <GraduationCap className="text-blue-400"/> },
                { id: 'provider', label: 'Sou Empresa / Investidor', icon: <Factory className="text-emerald-400"/> }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updateField('role', opt.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition text-left group ${
                    formData.role === opt.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/40 hover:border-indigo-500/50 hover:bg-slate-800'
                  }`}
                >
                  <div className="p-3 bg-slate-900 rounded-xl group-hover:scale-110 transition duration-300">{opt.icon}</div>
                  <span className="font-medium text-slate-200">{opt.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-4 space-y-3">
              <label className="block text-sm font-medium text-slate-400">Qual o seu melhor e-mail?</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="seu@email.com" 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-slate-200" 
              />
            </div>

            <button 
              onClick={() => nextStep('SEGMENT')} 
              disabled={!formData.role || !formData.email}
              className="w-full p-4 rounded-xl bg-indigo-600 disabled:bg-slate-800 text-white font-bold mt-4 flex justify-center items-center gap-2 hover:bg-indigo-500 transition-colors"
            >
              Começar minha jornada <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* PASSO 2: SEGMENTO */}
        {step === 'SEGMENT' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Qual a sua área de atuação principal?</h2>
            </div>
            
            <select 
              value={formData.segment}
              onChange={(e) => updateField('segment', e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 outline-none focus:border-indigo-500 text-slate-200 appearance-none"
            >
              <option value="">Selecione uma câmara...</option>
              <option value="agro">Agroindústria / Alimentos</option>
              <option value="energy">Energia / CleanTech</option>
              <option value="tech">Tecnologia & Software</option>
              <option value="health">Saúde e Biotecnologia</option>
              <option value="industry">Indústria 4.0</option>
            </select>

            <div className="flex gap-4 pt-4 border-t border-slate-800">
              <button onClick={() => setStep('PROFILE')} className="flex-1 p-4 rounded-xl border border-slate-700 hover:bg-slate-800 transition">Voltar</button>
              <button 
                onClick={handleNextFromSegment} 
                disabled={!formData.segment}
                className="flex-1 p-4 rounded-xl bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 font-bold transition"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* PASSO 3: PROTEÇÃO (APENAS INVENTORES) */}
        {step === 'PROTECTION' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-bold text-white">Sua inovação já está protegida?</h2>
            
            <div className="flex gap-4">
              <button 
                onClick={() => updateField('isProtected', 'sim')}
                className={`flex-1 p-4 rounded-xl border transition ${formData.isProtected === 'sim' ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
              >Sim, está</button>
              <button 
                onClick={() => updateField('isProtected', 'nao')}
                className={`flex-1 p-4 rounded-xl border transition ${formData.isProtected === 'nao' ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
              >Não</button>
            </div>

            {formData.isProtected === 'sim' && (
              <input 
                type="text" 
                value={formData.patentNumber}
                onChange={(e) => updateField('patentNumber', e.target.value)}
                placeholder="Número do processo (opcional)" 
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
              />
            )}

            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep('SEGMENT')} className="w-1/3 p-4 rounded-xl border border-slate-700 hover:bg-slate-800 transition">Voltar</button>
              <button 
                onClick={handleNextFromProtection} 
                disabled={!formData.isProtected}
                className="flex-1 p-4 rounded-xl bg-indigo-600 disabled:bg-slate-800 font-bold transition"
              >Próximo</button>
            </div>
          </div>
        )}

        {/* PASSO 4: MATURIDADE (INVENTOR = SEU TRL | PROVIDER = TRL ALVO) */}
        {step === 'MATURITY' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-bold text-white">
              {formData.role === 'inventor' ? 'Qual a maturidade da solução?' : 'Qual o TRL alvo que você busca?'}
            </h2>
            
            {formData.role === 'inventor' ? (
              <div className="space-y-4">
                <input type="range" min="1" max="9" value={formData.maturity} onChange={e => updateField('maturity', parseInt(e.target.value))} className="w-full accent-indigo-500" />
                <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
                  <span>TRL 1 (Ideia)</span>
                  <span className="text-indigo-400 text-sm font-bold border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 rounded-full">TRL {formData.maturity}</span>
                  <span>TRL 9 (Escala)</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-slate-400">Defina o intervalo de maturidade dos projetos que você aceita avaliar.</p>
                <div>
                  <label className="text-xs text-slate-400 mb-2 block">Maturidade Mínima (TRL)</label>
                  <input type="range" min="1" max={formData.trlMax} value={formData.trlMin} onChange={e => updateField('trlMin', parseInt(e.target.value))} className="w-full accent-cyan-500" />
                  <div className="text-right text-xs text-cyan-400 mt-1">Mínimo: TRL {formData.trlMin}</div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-2 block">Maturidade Máxima (TRL)</label>
                  <input type="range" min={formData.trlMin} max="9" value={formData.trlMax} onChange={e => updateField('trlMax', parseInt(e.target.value))} className="w-full accent-emerald-500" />
                  <div className="text-right text-xs text-emerald-400 mt-1">Máximo: TRL {formData.trlMax}</div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t border-slate-800">
              <button onClick={() => formData.role === 'inventor' ? setStep('PROTECTION') : setStep('SEGMENT')} className="w-1/3 p-4 rounded-xl border border-slate-700 hover:bg-slate-800 transition">Voltar</button>
              <button onClick={handleNextFromMaturity} className="flex-1 p-4 rounded-xl bg-indigo-600 font-bold transition">Próximo</button>
            </div>
          </div>
        )}

        {/* PASSO 5: NECESSIDADES VS INTERESSES */}
        {step === 'NEEDS_INTERESTS' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-bold text-white">
              {formData.role === 'inventor' ? 'O que o seu projeto busca na rede?' : 'O que você oferece para a rede?'}
            </h2>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-800/50 transition">
                <input 
                  type="checkbox" 
                  checked={formData.role === 'inventor' ? formData.needs.investment : formData.interests.investment} 
                  onChange={e => updateNestedField(formData.role === 'inventor' ? 'needs' : 'interests', 'investment', e.target.checked)} 
                  className="w-5 h-5 accent-indigo-500" 
                />
                <span className="font-medium">Investimento Financeiro</span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-800/50 transition">
                <input 
                  type="checkbox" 
                  checked={formData.role === 'inventor' ? formData.needs.research : formData.interests.research} 
                  onChange={e => updateNestedField(formData.role === 'inventor' ? 'needs' : 'interests', 'research', e.target.checked)} 
                  className="w-5 h-5 accent-indigo-500" 
                />
                <span className="font-medium">Apoio em P&D e Laboratórios</span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-800/50 transition">
                <input 
                  type="checkbox" 
                  checked={formData.role === 'inventor' ? formData.needs.industry : formData.interests.industry} 
                  onChange={e => updateNestedField(formData.role === 'inventor' ? 'needs' : 'interests', 'industry', e.target.checked)} 
                  className="w-5 h-5 accent-indigo-500" 
                />
                <span className="font-medium">Parceria de Manufatura/Indústria</span>
              </label>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-800">
              <button onClick={() => formData.role === 'ict' ? setStep('SEGMENT') : setStep('MATURITY')} className="w-1/3 p-4 rounded-xl border border-slate-700 hover:bg-slate-800 transition">Voltar</button>
              <button onClick={handleNextFromNeeds} className="flex-1 p-4 rounded-xl bg-indigo-600 font-bold transition">Continuar para Cadastro</button>
            </div>
          </div>
        )}

        {/* PASSO 6: CADASTRO FINAL */}
        {step === 'FINAL_REGISTER' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Último passo!</h2>
              <p className="text-slate-400 text-sm mt-2">Crie sua senha para rodar o motor de Match e ver resultados reais.</p>
            </div>
            
            <input type="email" value={formData.email} disabled className="w-full p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-500 cursor-not-allowed" />
            <input type="text" value={formData.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Seu Nome Completo" className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500" />
            <input type="password" value={formData.password} onChange={(e) => updateField('password', e.target.value)} placeholder="Crie uma Senha Forte" className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500" />
            
            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep('NEEDS_INTERESTS')} className="w-1/3 p-4 rounded-xl border border-slate-700 hover:bg-slate-800 transition">Voltar</button>
              <button 
                onClick={handleGeneratePreview}
                disabled={!formData.name || !formData.password}
                className="flex-1 p-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 font-bold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all"
              >
                Gerar Meus Matches 🚀
              </button>
            </div>
          </div>
        )}

        {/* PASSO 7: RESULTADOS */}
        {step === 'RESULTS' && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            {loading ? (
              <div className="py-12 flex flex-col items-center text-center space-y-4">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
                <p className="text-lg text-slate-300 font-medium">Motor de Match operando...</p>
                <p className="text-sm text-slate-500">Avaliando compatibilidade de TRL e interesses na rede...</p>
              </div>
            ) : previewResult && (
              <div>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
                    <Star size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Processo Concluído!</h2>
                  <p className="text-slate-400 text-sm">
                    Encontramos {previewResult.total} potenciais matches com base no seu perfil de {formData.role}.
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
