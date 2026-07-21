import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Circle } from "lucide-react";

interface ProcessingLoaderProps {
  onComplete: () => void;
}

interface StepItem {
  id: number;
  label: string;
  duration: number; // Duration in ms for this step
}

const ANALYSIS_STEPS: StepItem[] = [
  { id: 1, label: "Lendo arquivo e decodificando texto estruturado...", duration: 2500 },
  { id: 2, label: "Identificando áreas tecnológicas e sinergias de mercado...", duration: 2500 },
  { id: 3, label: "Calculando múltiplos readiness scores (TRL, IRL, Proteção)...", duration: 2500 },
  { id: 4, label: "Extraindo DNA Tecnológico (Technology DNA)...", duration: 2500 }
];

export function ProcessingLoader({ onComplete }: ProcessingLoaderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let stepTimeout: NodeJS.Timeout;

    // Smooth progress bar calculation
    const totalDuration = ANALYSIS_STEPS.reduce((acc, step) => acc + step.duration, 0);
    const updateRate = 50; // Update progress every 50ms
    const progressStep = (updateRate / totalDuration) * 100;

    progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + progressStep;
        return next >= 100 ? 100 : next;
      });
    }, updateRate);

    // Sequence through the steps
    const runSteps = (index: number) => {
      if (index >= ANALYSIS_STEPS.length) {
        clearInterval(progressInterval);
        setProgress(100);
        // Small delay at 100% for smooth transition
        setTimeout(() => {
          onComplete();
        }, 800);
        return;
      }

      stepTimeout = setTimeout(() => {
        setCurrentStepIndex(index + 1);
        runSteps(index + 1);
      }, ANALYSIS_STEPS[index].duration);
    };

    runSteps(0);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimeout);
    };
  }, [onComplete]);

  return (
    <div className="space-y-10 py-10 flex flex-col items-center justify-center animate-in fade-in">
      <div className="relative flex items-center justify-center w-28 h-28">
        {/* Glow behind loader */}
        <div className="absolute inset-0 bg-teal-500/10 rounded-full blur-2xl animate-pulse" />
        
        {/* Inner rotating ring */}
        <div className="absolute w-24 h-24 border-4 border-slate-800 rounded-full" />
        
        {/* Outer active spinner */}
        <Loader2 
          size={96} 
          className="text-teal-500 animate-spin absolute" 
          style={{ strokeWidth: 1.5 }}
        />
        
        <span className="text-white font-extrabold text-lg select-none absolute z-10">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-white tracking-tight">Processando Documento</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto">
          Nosso motor de IA está estruturando o Gêmeo Digital do seu ativo.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md h-2 bg-slate-950 rounded-full border border-slate-900 overflow-hidden relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-teal-500 rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(0,181,156,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Timeline Steps */}
      <div className="w-full max-w-sm bg-slate-950/30 border border-slate-900 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
        {ANALYSIS_STEPS.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;

          return (
            <div 
              key={step.id} 
              className={`flex items-start gap-4 transition-all duration-500 ${
                isCompleted 
                  ? "text-emerald-400" 
                  : isActive 
                  ? "text-white scale-[1.01]" 
                  : "text-slate-600"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isCompleted ? (
                  <CheckCircle2 size={18} className="fill-emerald-500/10 text-emerald-400" />
                ) : isActive ? (
                  <Loader2 size={18} className="text-teal-400 animate-spin" />
                ) : (
                  <Circle size={18} />
                )}
              </div>
              <div className="space-y-0.5">
                <p className={`text-sm font-semibold transition-colors duration-500 ${
                  isActive ? "text-slate-100" : isCompleted ? "text-slate-300" : "text-slate-600"
                }`}>
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
