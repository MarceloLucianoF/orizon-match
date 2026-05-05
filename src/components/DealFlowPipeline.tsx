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
    <div className="w-full bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Deal Flow Pipeline</h3>
        
        <div className="relative flex justify-between items-center w-full">
          {/* Linha de progresso no fundo */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full z-0"></div>
          
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 rounded-full z-0 transition-all duration-500"
            style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
          ></div>

          {/* Etapas */}
          {STAGES.map((stage, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={stage.id} className="relative z-10 flex flex-col items-center gap-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted 
                      ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]" 
                      : "bg-slate-900 border-2 border-slate-700 text-slate-500"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </div>
                <span className={`text-xs font-medium absolute top-10 whitespace-nowrap transition-colors ${
                  isCurrent ? "text-indigo-400 font-bold" : isCompleted ? "text-slate-300" : "text-slate-500"
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
