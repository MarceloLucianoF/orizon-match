import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createProject } from "../services/projectService";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export function CreateProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "startup", // startup, company, ict, inventor
    segment: "tecnologia",
    maturity: 1, // 1 to 5
    needs: {
      investment: false,
      research: false,
      industry: false,
    },
    location: {
      region: "sudeste",
    },
  });

  const handleNext = () => setStep(s => Math.min(s + 1, 6));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Salvar projeto
      const projectId = await createProject({
        userId: user.uid,
        ...formData
      });

      // 3. Redirecionar instantaneamente
      navigate(`/matches?project=${projectId}`);
    } catch (error) {
      console.error("Erro ao salvar projeto e gerar matches", error);
      alert("Ocorreu um erro ao processar seu projeto.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNeeds = (need: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      needs: { ...prev.needs, [need]: value }
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Criar Novo Projeto</h1>
        <div className="w-full bg-slate-800 rounded-full h-2 mt-4">
          <div 
            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-xl">
        
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-semibold text-slate-200">Informações Básicas</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Título do Projeto</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="Ex: Plataforma de IA para Saúde"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Tipo de Atuação</label>
              <select
                value={formData.type}
                onChange={(e) => updateField('type', e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="startup">Startup</option>
                <option value="company">Empresa / Corporação</option>
                <option value="ict">ICT / Universidade</option>
                <option value="inventor">Inventor Independente</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-semibold text-slate-200">Segmento</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Qual o segmento principal?</label>
              <select
                value={formData.segment}
                onChange={(e) => updateField('segment', e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="tecnologia">Tecnologia & Software</option>
                <option value="saude">Saúde & Biotech</option>
                <option value="agronegocio">Agronegócio</option>
                <option value="industria">Indústria 4.0</option>
                <option value="financas">Finanças & Fintech</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-semibold text-slate-200">Maturidade</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-4">Nível de maturidade atual (1 a 5)</label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.maturity}
                onChange={(e) => updateField('maturity', parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>Ideia</span>
                <span>MVP</span>
                <span>Escala</span>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-semibold text-slate-200">Necessidades</h2>
            <p className="text-sm text-slate-400">O que você busca em um match?</p>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-slate-800 rounded-lg hover:bg-slate-800/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.needs.investment}
                  onChange={(e) => updateNeeds('investment', e.target.checked)}
                  className="w-5 h-5 accent-indigo-500 rounded bg-slate-900 border-slate-700"
                />
                <span className="text-slate-200">Investimento / Capital</span>
              </label>

              <label className="flex items-center gap-3 p-3 border border-slate-800 rounded-lg hover:bg-slate-800/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.needs.research}
                  onChange={(e) => updateNeeds('research', e.target.checked)}
                  className="w-5 h-5 accent-indigo-500 rounded bg-slate-900 border-slate-700"
                />
                <span className="text-slate-200">Pesquisa & Desenvolvimento (P&D)</span>
              </label>

              <label className="flex items-center gap-3 p-3 border border-slate-800 rounded-lg hover:bg-slate-800/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.needs.industry}
                  onChange={(e) => updateNeeds('industry', e.target.checked)}
                  className="w-5 h-5 accent-indigo-500 rounded bg-slate-900 border-slate-700"
                />
                <span className="text-slate-200">Parceria Industrial / Comercial</span>
              </label>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-semibold text-slate-200">Localização</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Região de atuação</label>
              <select
                value={formData.location.region}
                onChange={(e) => updateField('location', { region: e.target.value })}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="norte">Norte</option>
                <option value="nordeste">Nordeste</option>
                <option value="centro-oeste">Centro-Oeste</option>
                <option value="sudeste">Sudeste</option>
                <option value="sul">Sul</option>
                <option value="nacional">Nacional (Todo Brasil)</option>
              </select>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="text-center">
              <CheckCircle2 className="mx-auto text-indigo-400 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-slate-100 mb-2">Tudo pronto!</h2>
              <p className="text-slate-400">
                Revise os dados abaixo. Ao concluir, nosso algoritmo irá analisar toda a base em busca dos melhores parceiros para <strong>{formData.title}</strong>.
              </p>
            </div>
            
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 space-y-2 text-sm text-slate-300">
              <p><span className="text-slate-500">Tipo:</span> {formData.type}</p>
              <p><span className="text-slate-500">Segmento:</span> {formData.segment}</p>
              <p><span className="text-slate-500">Maturidade:</span> Nível {formData.maturity}</p>
              <p><span className="text-slate-500">Região:</span> {formData.location.region}</p>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between">
          <button
            onClick={handlePrev}
            disabled={step === 1 || loading}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
              step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ArrowLeft size={18} /> Voltar
          </button>

          {step < 6 ? (
            <button
              onClick={handleNext}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
            >
              Próximo <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Gerar Matches"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
