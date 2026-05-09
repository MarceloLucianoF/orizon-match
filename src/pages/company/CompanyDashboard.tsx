import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Filter, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

type DealStatus = 'triagem' | 'avaliacao' | 'due_diligence' | 'negociacao' | 'fechado';

interface Deal {
  id: string;
  projectId: string;
  projectName: string;
  status: DealStatus;
  score: number;
  lastUpdate: string;
}

const COLUMNS: { id: DealStatus; title: string; color: string }[] = [
  { id: 'triagem', title: 'Triagem Inicial', color: 'border-slate-700 bg-slate-800/30' },
  { id: 'avaliacao', title: 'Análise Técnica', color: 'border-blue-500/30 bg-blue-500/10' },
  { id: 'due_diligence', title: 'Due Diligence', color: 'border-amber-500/30 bg-amber-500/10' },
  { id: 'negociacao', title: 'Negociação Ativa', color: 'border-purple-500/30 bg-purple-500/10' },
  { id: 'fechado', title: 'Deal Fechado', color: 'border-emerald-500/30 bg-emerald-500/10' },
];

export function CompanyDashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [smartPrompt, setSmartPrompt] = useState<{ dealId: string, message: string, action: string } | null>(null);
  const [trlFilter, setTrlFilter] = useState<number | null>(null);
  const [irlFilter, setIrlFilter] = useState<number | null>(null);

  useEffect(() => {
    // Dados demonstrativos do pipeline - em produção, busca da collection "deals"
    setTimeout(() => {
      setDeals([
        { id: '1', projectId: 'p1', projectName: 'Nova Liga Metálica P/ Auto', status: 'triagem', score: 92, lastUpdate: 'Há 2 horas' },
        { id: '2', projectId: 'p2', projectName: 'Sensor IoT Agrícola', status: 'avaliacao', score: 85, lastUpdate: 'Há 1 dia' },
        { id: '3', projectId: 'p3', projectName: 'Plataforma de IA Jurídica', status: 'due_diligence', score: 88, lastUpdate: 'Há 3 dias' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const moveDeal = (dealId: string, newStatus: DealStatus) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: newStatus } : d));
    
    if (newStatus === 'due_diligence') {
      setSmartPrompt({
        dealId,
        message: "Projeto movido para Due Diligence. Deseja enviar o modelo de NDA padrão Orizon para o Inventor?",
        action: "Enviar NDA"
      });
    } else if (newStatus === 'negociacao') {
        setSmartPrompt({
            dealId,
            message: "Negociação iniciada. Deseja solicitar acesso ao Data Room Virtual (VDR) do projeto?",
            action: "Solicitar Acesso ao VDR"
        });
    } else {
      setSmartPrompt(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">Pipeline de Investimentos</h1>
          <p className="text-slate-400 mt-1 text-sm">Gerencie seu pipeline de negociações e acompanhe cada oportunidade.</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5">
            <Filter size={14} className="text-slate-500" />
            <select 
              value={trlFilter || ""} 
              onChange={e => setTrlFilter(e.target.value ? Number(e.target.value) : null)}
              className="bg-transparent text-xs text-slate-300 outline-none"
            >
              <option value="">Todos os TRLs</option>
              {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>TRL {n}+</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5">
            <TrendingUp size={14} className="text-slate-500" />
            <select 
              value={irlFilter || ""} 
              onChange={e => setIrlFilter(e.target.value ? Number(e.target.value) : null)}
              className="bg-transparent text-xs text-slate-300 outline-none"
            >
              <option value="">Todos os IRLs</option>
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>IRL {n}+</option>)}
            </select>
          </div>
          <Link to="/explore" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 md:px-5 py-2 rounded-xl font-medium transition-all text-xs md:text-sm shadow-[0_0_10px_rgba(79,70,229,0.2)]">
            Explorar Mercado
          </Link>
        </div>
      </div>

      {smartPrompt && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-indigo-300">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span className="font-medium text-sm">{smartPrompt.message}</span>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setSmartPrompt(null)} className="text-slate-400 hover:text-slate-200 px-3 py-1.5 text-xs">Ignorar</button>
            <button 
              onClick={() => {
                setSmartPrompt(null);
              }} 
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-[0_0_10px_rgba(79,70,229,0.3)] transition-all"
            >
              {smartPrompt.action}
            </button>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-4 md:gap-6 h-full min-w-max">
          {COLUMNS.map(column => {
            const columnDeals = deals.filter(d => d.status === column.id);
            return (
              <div key={column.id} className={`w-64 md:w-72 lg:w-80 flex flex-col rounded-2xl border ${column.color} p-3 md:p-4`}>
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="font-bold text-slate-200 text-sm">{column.title}</h3>
                  <span className="bg-slate-900/50 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-md border border-slate-700/50">
                    {columnDeals.length}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                  {columnDeals.map(deal => (
                    <div key={deal.id} className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 md:p-4 hover:border-indigo-500/50 transition-all shadow-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          {deal.score}% FIT
                        </span>
                        <span className="text-[10px] text-slate-500">{deal.lastUpdate}</span>
                      </div>
                      <h4 className="font-bold text-slate-200 text-sm mb-3">{deal.projectName}</h4>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-600 border border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">IN</div>
                          <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">VC</div>
                        </div>
                        <span className="text-[10px] text-slate-500 ml-1">Equipe ativa</span>
                      </div>

                      <div className="flex items-center gap-2 border-t border-slate-800 pt-3">
                         <select 
                            className="bg-slate-950 border border-slate-700 text-[11px] text-slate-300 rounded p-1.5 w-full outline-none focus:border-indigo-500"
                            value={deal.status}
                            onChange={(e) => moveDeal(deal.id, e.target.value as DealStatus)}
                         >
                             {COLUMNS.map(c => (
                                 <option key={c.id} value={c.id}>Mover para {c.title}</option>
                             ))}
                         </select>
                      </div>
                    </div>
                  ))}
                  
                  {columnDeals.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-700/50 rounded-xl flex items-center justify-center text-slate-600 text-xs">
                      Sem projetos nesta etapa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
