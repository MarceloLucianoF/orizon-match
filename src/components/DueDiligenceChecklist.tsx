import { useState } from "react";
import { 
  CheckCircle2, Circle, ShieldCheck, 
  AlertCircle, ArrowRight, Activity
} from "lucide-react";
import { notifyStakeholdersOnVdrCompletion } from "../services/notificationService";

interface ChecklistItem {
  id: string;
  label: string;
  category: 'pi' | 'finance' | 'legal' | 'team';
  isCompleted: boolean;
  isRequired: boolean;
}

export function DueDiligenceChecklist({ items: initialItems = [] }: any) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems.length > 0 ? initialItems : [
    { id: '1', label: 'Certificado de Depósito de Patente', category: 'pi', isCompleted: true, isRequired: true },
    { id: '2', label: 'Análise de Anterioridade Validada', category: 'pi', isCompleted: false, isRequired: true },
    { id: '3', label: 'Projeção Financeira (3 anos)', category: 'finance', isCompleted: false, isRequired: true },
    { id: '4', label: 'Pitch Deck Atualizado', category: 'finance', isCompleted: true, isRequired: true },
    { id: '5', label: 'Estatuto Social / Contrato Social', category: 'legal', isCompleted: true, isRequired: false },
    { id: '6', label: 'Currículo Lattes/LinkedIn Fundadores', category: 'team', isCompleted: false, isRequired: true },
  ]);

  const [hasNotified, setHasNotified] = useState(false);

  const progress = Math.round((items.filter(i => i.isCompleted).length / items.length) * 100);
  const requiredCompleted = items.filter(i => i.isRequired && i.isCompleted).length;
  const totalRequired = items.filter(i => i.isRequired).length;
  const isReady = requiredCompleted === totalRequired;

  if (isReady && !hasNotified) {
    setHasNotified(true);
    // Simulação de gatilho de notificação
    notifyStakeholdersOnVdrCompletion("mock-project-id", "Projeto Orizon Match");
  }

  const toggleItem = (id: string) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    );
    setItems(newItems);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-widest">
            <ShieldCheck className="text-emerald-400" size={16} /> Checklist de Due Diligence
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight">Status de auditoria jurídica e técnica</p>
        </div>
        <div className="text-right">
          <span className={`text-xl font-black ${isReady ? 'text-emerald-400' : 'text-indigo-400'}`}>{progress}%</span>
          <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${isReady ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-indigo-500'}`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <div 
            key={item.id} 
            onClick={() => toggleItem(item.id)}
            className={`group flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
              item.isCompleted 
              ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-300' 
              : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.isCompleted ? (
                <CheckCircle2 className="text-emerald-400" size={18} />
              ) : (
                <Circle className="text-slate-700 group-hover:text-slate-500" size={18} />
              )}
              <span className={`text-xs font-medium ${item.isCompleted ? 'text-slate-200' : ''}`}>
                {item.label}
                {item.isRequired && !item.isCompleted && (
                  <span className="ml-2 text-[9px] text-amber-500 font-bold uppercase">Obrigatório</span>
                )}
              </span>
            </div>
            <div className={`w-2 h-2 rounded-full ${
              item.category === 'pi' ? 'bg-indigo-500' : 
              item.category === 'finance' ? 'bg-amber-500' : 
              item.category === 'legal' ? 'bg-fuchsia-500' : 'bg-cyan-500'
            } opacity-40`} />
          </div>
        ))}
      </div>

      {isReady ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 animate-in zoom-in-95">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-400">Projeto Apto para Investimento</p>
            <p className="text-[10px] text-emerald-500/70">Toda a documentação obrigatória foi validada.</p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-slate-500" size={18} />
            <span className="text-[10px] text-slate-400 font-bold uppercase">Aguardando auditoria jurídica</span>
          </div>
          <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase tracking-widest">
            Convidar Especialista <ArrowRight size={10} />
          </button>
        </div>
      )}
    </div>
  );
}
