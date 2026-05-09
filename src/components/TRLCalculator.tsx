import { useState } from 'react';
import { CheckCircle2, ShieldCheck, TrendingUp, Info, Calculator } from 'lucide-react';

interface TRLQuestion {
  id: string;
  level: number;
  label: string;
}

const TRL_QUESTIONS: TRLQuestion[] = [
  { id: 'trl1', level: 1, label: 'Princípios básicos observados e relatados' },
  { id: 'trl2', level: 2, label: 'Conceito tecnológico e/ou aplicação formulada' },
  { id: 'trl3', level: 3, label: 'Prova de conceito analítica e experimental' },
  { id: 'trl4', level: 4, label: 'Componente ou validação em ambiente de laboratório' },
  { id: 'trl5', level: 5, label: 'Validação em ambiente relevante (simulado)' },
  { id: 'trl6', level: 6, label: 'Modelo ou protótipo demonstrado em ambiente relevante' },
  { id: 'trl7', level: 7, label: 'Demonstração do protótipo em ambiente operacional' },
  { id: 'trl8', level: 8, label: 'Sistema real completado e qualificado através de teste e demonstração' },
  { id: 'trl9', level: 9, label: 'Sistema real comprovado através de operações bem-sucedidas no mercado' },
];

const IRL_INDICATORS = [
  { id: 'irl1', label: 'Problema claramente identificado' },
  { id: 'irl2', label: 'Solução validada com potenciais clientes' },
  { id: 'irl3', label: 'Equipe complementar formada (Tech + Negócios)' },
  { id: 'irl4', label: 'MVP (Produto Mínimo Viável) em uso' },
  { id: 'irl5', label: 'Primeiras receitas ou parcerias firmadas' },
  { id: 'irl6', label: 'Modelo de negócio escalável e repetível' },
];

interface TRLCalculatorProps {
  initialValues?: Record<string, boolean>;
  onUpdate: (data: { trl: number; irl: number; checklist: Record<string, boolean> }) => void;
  readOnly?: boolean;
}

export function TRLCalculator({ initialValues = {}, onUpdate, readOnly = false }: TRLCalculatorProps) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>(initialValues);

  const toggleItem = (id: string) => {
    if (readOnly) return;
    setChecklist(prev => {
      const next = { ...prev, [id]: !prev[id] };
      calculateScores(next);
      return next;
    });
  };

  const calculateScores = (currentChecklist: Record<string, boolean>) => {
    // TRL is the highest level where ALL previous levels are checked
    let trl = 0;
    for (let i = 1; i <= 9; i++) {
      if (currentChecklist[`trl${i}`]) {
        trl = i;
      } else {
        break; 
      }
    }

    // IRL is simpler, just a count or progress
    const irlCount = IRL_INDICATORS.filter(item => currentChecklist[item.id]).length;
    
    onUpdate({
      trl,
      irl: irlCount,
      checklist: currentChecklist
    });
  };

  const currentTrl = TRL_QUESTIONS.reduce((acc, q) => checklist[q.id] ? q.level : acc, 0);
  const currentIrlCount = IRL_INDICATORS.filter(item => checklist[item.id]).length;

  return (
    <div className="space-y-8">
      {/* SCORES SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-indigo-500/10 border border-indigo-500/30 p-6 rounded-2xl flex items-center gap-6 relative overflow-hidden">
          <div className="absolute top-[-10px] right-[-10px] opacity-10 rotate-12">
            <TrendingUp size={80} />
          </div>
          <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex flex-col items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <span className="text-xs font-bold uppercase opacity-80 leading-none">TRL</span>
            <span className="text-3xl font-black">{currentTrl}</span>
          </div>
          <div>
            <h4 className="font-bold text-white text-lg">Maturidade Tecnológica</h4>
            <p className="text-slate-400 text-sm">Baseado na escala NASA/EMBRAPII</p>
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl flex items-center gap-6 relative overflow-hidden">
          <div className="absolute top-[-10px] right-[-10px] opacity-10 rotate-12">
            <ShieldCheck size={80} />
          </div>
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex flex-col items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <span className="text-xs font-bold uppercase opacity-80 leading-none">IRL</span>
            <span className="text-3xl font-black">{currentIrlCount}</span>
          </div>
          <div>
            <h4 className="font-bold text-white text-lg">Prontidão de Mercado</h4>
            <p className="text-slate-400 text-sm">Investment Readiness Level</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* TRL CHECKLIST */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="text-indigo-400" size={20} />
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">Checklist TRL (Técnico)</h3>
          </div>
          <div className="space-y-2">
            {TRL_QUESTIONS.map((q) => (
              <button
                key={q.id}
                disabled={readOnly}
                onClick={() => toggleItem(q.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left group ${
                  checklist[q.id] 
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-100' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  checklist[q.id] ? 'bg-indigo-500 border-indigo-500' : 'border-slate-700 group-hover:border-slate-600'
                }`}>
                  {checklist[q.id] && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Nível {q.level}</span>
                  </div>
                  <p className="text-sm leading-snug">{q.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* IRL INDICATORS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-emerald-400" size={20} />
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">Indicadores IRL (Negócio)</h3>
          </div>
          <div className="space-y-2">
            {IRL_INDICATORS.map((q) => (
              <button
                key={q.id}
                disabled={readOnly}
                onClick={() => toggleItem(q.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left group ${
                  checklist[q.id] 
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-100' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  checklist[q.id] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700 group-hover:border-slate-600'
                }`}>
                  {checklist[q.id] && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <p className="text-sm leading-snug flex-1">{q.label}</p>
              </button>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex gap-3 text-slate-400 text-xs leading-relaxed">
              <Info size={24} className="shrink-0 text-indigo-400" />
              <p>
                A certificação de maturidade aumenta as chances de match em até <strong>4x</strong>. Projetos com TRL verificado transmitem maior segurança para fundos de investimento e indústrias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
