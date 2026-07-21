import type { DealStage } from "../services/chatService";
import { CheckCircle2, Circle } from "lucide-react";

interface DealFlowPipelineProps {
  currentStage: DealStage;
}

const STAGES: { id: DealStage; label: string }[] = [
  { id: "initial_contact", label: "Contato Inicial" },
  { id: "nda", label: "Assinatura NDA" },
  { id: "proposal", label: "Proposta" },
  { id: "negotiation", label: "Negociação" },
  { id: "closed", label: "Fechado" }
];

export function DealFlowPipeline({ currentStage }: DealFlowPipelineProps) {
  const currentIndex = STAGES.findIndex(s => s.id === currentStage);

  return (
    <div className="w-full bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 py-4 px-4 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Deal Flow Pipeline</h3>
        
        <div className="relative flex justify-between items-center w-full pb-8 overflow-x-auto md:overflow-visible gap-4 md:gap-0">
          {/* Linha de progresso no fundo */}
          <div className="absolute left-0 top-4 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full z-0 hidden md:block"></div>
          
          <div 
            className="absolute left-0 top-4 -translate-y-1/2 h-1 bg-teal-500 rounded-full z-0 transition-all duration-500 hidden md:block"
            style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
          ></div>

          {/* Etapas */}
          {STAGES.map((stage, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={stage.id} className="relative z-10 flex flex-col items-center min-w-[72px] md:min-w-0 shrink-0">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted 
                      ? "bg-teal-500 text-white shadow-[0_0_15px_rgba(0,181,156,0.5)]" 
                      : "bg-slate-900 border-2 border-slate-700 text-slate-500"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </div>
                <span className={`text-[10px] sm:text-xs font-medium md:absolute md:top-10 whitespace-normal md:whitespace-nowrap text-center md:left-1/2 md:-translate-x-1/2 transition-colors max-w-[72px] md:max-w-none ${
                  isCurrent ? "text-teal-400 font-bold" : isCompleted ? "text-slate-300" : "text-slate-500"
                }`}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
