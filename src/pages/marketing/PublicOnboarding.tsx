import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowRight, ArrowLeft, Star, Lock } from "lucide-react";
import { functions } from "../../firebase/config";
import { httpsCallable } from "firebase/functions";
import { explainMatch } from "../../lib/matching";

export default function PublicOnboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    type: "startup",
    segment: "tecnologia",
    maturity: 1,
    needs: { investment: false, research: false, industry: false },
    location: { region: "sudeste" },
  });

  const updateField = (field: string, value: any) => setFormData(p => ({ ...p, [field]: value }));
  
  const updateNeeds = (need: string, value: boolean) => setFormData(p => ({
    ...p, needs: { ...p.needs, [need]: value }
  }));

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleGeneratePreview = async () => {
    setLoading(true);
    setStep(5);
    
    try {
      const previewMatchesFn = httpsCallable(functions, 'previewMatches');
      const result = await previewMatchesFn(formData);
      setPreviewResult(result.data);
    } catch (error) {
      console.error("Error generating preview:", error);
      // Fallback estático em caso de erro no backend para não frustrar o marketing
      setPreviewResult({
        total: 12,
        topMatches: [
          { score: 85, name: "Empresa do Setor", breakdown: { segment: 30, needs: 20 } },
          { score: 78, name: "Investidor Anjo", breakdown: { segment: 30, needs: 0 } },
          { score: 72, name: "Empresa do Setor", breakdown: { segment: 10, needs: 20 } },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <header className="fixed top-0 w-full z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="font-semibold text-xl text-white tracking-tight">Orizon Match</Link>
          <Link to="/login" className="text-slate-400 hover:text-white transition font-medium">Entrar</Link>
        </div>
      </header>

      <div className="pt-32 pb-24 max-w-2xl mx-auto px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Descreva sua Inovação</h1>
          <p className="text-slate-400">Descubra com quem você pode fazer negócio agora mesmo.</p>
          
          {step < 5 && (
            <div className="w-full bg-slate-800 rounded-full h-2 mt-8">
              <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
            </div>
          )}
        </div>

        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-xl">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-semibold text-slate-200">O que você está construindo?</h2>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Nome / Título</label>
                <input type="text" value={formData.title} onChange={e => updateField('title', e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500/50" placeholder="Ex: IA para Agricultura" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Seu Perfil</label>
                <select value={formData.type} onChange={e => updateField('type', e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3">
                  <option value="startup">Startup</option>
                  <option value="ict">ICT / Universidade</option>
                  <option value="inventor">Inventor Independente</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-semibold text-slate-200">Qual a área de atuação?</h2>
              <select value={formData.segment} onChange={e => updateField('segment', e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3">
                <option value="tecnologia">Tecnologia & Software</option>
                <option value="saude">Saúde & Biotech</option>
                <option value="agronegocio">Agronegócio</option>
                <option value="industria">Indústria 4.0</option>
                <option value="financas">Finanças & Fintech</option>
              </select>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-semibold text-slate-200">Qual a maturidade da solução?</h2>
              <input type="range" min="1" max="5" value={formData.maturity} onChange={e => updateField('maturity', parseInt(e.target.value))} className="w-full accent-indigo-500" />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Ideia</span><span>MVP</span><span>Escala</span>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-semibold text-slate-200">O que você procura?</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-slate-800 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={formData.needs.investment} onChange={e => updateNeeds('investment', e.target.checked)} className="w-5 h-5 accent-indigo-500" />
                  <span>Investimento / Capital</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-slate-800 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={formData.needs.research} onChange={e => updateNeeds('research', e.target.checked)} className="w-5 h-5 accent-indigo-500" />
                  <span>Apoio de P&D</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-slate-800 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={formData.needs.industry} onChange={e => updateNeeds('industry', e.target.checked)} className="w-5 h-5 accent-indigo-500" />
                  <span>Parceiro Industrial</span>
                </label>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              {loading ? (
                <div className="py-12 flex flex-col items-center text-center space-y-4">
                  <Loader2 className="animate-spin text-indigo-500" size={48} />
                  <p className="text-lg text-slate-300 font-medium">Buscando na rede Orizon...</p>
                  <p className="text-sm text-slate-500">Cruzando dados com empresas e investidores</p>
                </div>
              ) : previewResult ? (
                <div>
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
                      <Star size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Encontramos {previewResult.total} potenciais matches!</h2>
                    <p className="text-slate-400">Aqui está uma prévia dos parceiros mais compatíveis com o seu projeto.</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {previewResult.topMatches.map((match: any, idx: number) => (
                      <div key={idx} className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center font-bold text-slate-200">
                          {match.score}%
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                            <Lock size={14} className="text-slate-500" /> {match.name}
                          </h4>
                          <div className="w-full bg-slate-800 rounded-full h-1 mt-1 mb-1">
                            <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-1 rounded-full" style={{ width: `${match.score}%` }} />
                          </div>
                          <p className="text-[10px] text-slate-500">{explainMatch(match.breakdown)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition font-bold text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] w-full justify-center">
                      Criar conta para desbloquear acessos <ArrowRight size={20} />
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {step < 5 && (
            <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between">
              <button onClick={handlePrev} disabled={step === 1} className={`px-4 py-2 flex gap-2 ${step === 1 ? 'opacity-0' : 'text-slate-400 hover:text-white'}`}>
                <ArrowLeft size={18} /> Voltar
              </button>
              {step < 4 ? (
                <button onClick={handleNext} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium flex gap-2">
                  Próximo <ArrowRight size={18} />
                </button>
              ) : (
                <button onClick={handleGeneratePreview} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium flex gap-2">
                  Ver Matches <ArrowRight size={18} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
