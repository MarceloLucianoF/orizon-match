import { useState, useEffect } from "react";
import { 
  Shield, Gavel, Search, 
  Loader2, Clock
} from "lucide-react";

type IPStatus = 'analise' | 'redacao' | 'protocolo' | 'acompanhamento';

interface IPAsset {
  id: string;
  projectName: string;
  status: IPStatus;
  clientName: string;
  lastUpdate: string;
  inpiNumber?: string;
}

const COLUMNS: { id: IPStatus; title: string; color: string }[] = [
  { id: 'analise', title: 'Aguardando Convite', color: 'border-slate-700 bg-slate-800/30' },
  { id: 'redacao', title: 'Análise de VDR', color: 'border-blue-500/30 bg-blue-500/10' },
  { id: 'protocolo', title: 'Documentação Validada', color: 'border-amber-500/30 bg-amber-500/10' },
  { id: 'acompanhamento', title: 'Apto para Investimento', color: 'border-emerald-500/30 bg-emerald-500/10' },
];

export function LegalDashboard() {
  const [assets, setAssets] = useState<IPAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for IP management
    setTimeout(() => {
      setAssets([
        { id: '1', projectName: 'Nova Liga Metálica', status: 'analise', clientName: 'João Silva', lastUpdate: 'Há 1 dia' },
        { id: '2', projectName: 'Sensor IoT Agrícola', status: 'redacao', clientName: 'TechAgro Ltda', lastUpdate: 'Há 4 horas' },
        { id: '3', projectName: 'Plataforma IA Jurídica', status: 'protocolo', clientName: 'Dr. Pedro', lastUpdate: 'Há 3 dias', inpiNumber: 'BR 10 2024 001234-5' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const moveAsset = (id: string, newStatus: IPStatus) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Gavel className="text-indigo-400" /> Curadoria Jurídica
          </h1>
          <p className="text-slate-400 mt-1">Valide a maturidade jurídica de projetos convidados para atrair investidores.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] flex items-center gap-2">
            <Search size={18} /> Monitorar Novo CNPJ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6 flex flex-col h-full">
           {/* Kanban Board */}
          <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex gap-6 h-full min-w-max">
              {COLUMNS.map(column => {
                const columnAssets = assets.filter(a => a.status === column.id);
                return (
                  <div key={column.id} className={`w-72 flex flex-col rounded-2xl border ${column.color} p-4`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">{column.title}</h3>
                      <span className="bg-slate-900/50 text-slate-400 text-xs font-bold px-2 py-1 rounded-md border border-slate-700/50">
                        {columnAssets.length}
                      </span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                      {columnAssets.map(asset => (
                        <div key={asset.id} className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 hover:border-indigo-500/50 transition-all shadow-lg">
                          <h4 className="font-bold text-slate-100 text-sm mb-1">{asset.projectName}</h4>
                          <p className="text-xs text-slate-500 mb-3">Cliente: {asset.clientName}</p>
                          
                          {asset.inpiNumber && (
                            <div className="bg-slate-950 px-2 py-1.5 rounded border border-slate-800 text-[10px] text-slate-400 font-mono mb-3">
                              {asset.inpiNumber}
                            </div>
                          )}

                          <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                             <span className="text-[10px] text-slate-600 flex items-center gap-1">
                               <Clock size={10} /> {asset.lastUpdate}
                             </span>
                             <select 
                                className="bg-slate-950 border border-slate-700 text-[10px] text-slate-400 rounded p-1 outline-none focus:border-indigo-400"
                                value={asset.status}
                                onChange={(e) => moveAsset(asset.id, e.target.value as IPStatus)}
                             >
                                 {COLUMNS.map(c => (
                                     <option key={c.id} value={c.id}>{c.title}</option>
                                 ))}
                             </select>
                          </div>
                        </div>
                      ))}
                      
                      {columnAssets.length === 0 && (
                        <div className="h-24 border-2 border-dashed border-slate-700/30 rounded-xl flex items-center justify-center text-slate-600 text-xs italic">
                          Vazio
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Shield className="text-emerald-400" size={16} /> Monitoramento INPI
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-indigo-400">PUBLICAÇÃO</span>
                  <span className="text-[10px] text-slate-600">Hoje</span>
                </div>
                <p className="text-xs text-slate-300">Processo BR 10... movido para exame técnico.</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-amber-400">EXIGÊNCIA</span>
                  <span className="text-[10px] text-slate-600">Ontem</span>
                </div>
                <p className="text-xs text-slate-300">Nova exigência formal no processo de João Silva.</p>
              </div>
            </div>
            <button className="w-full mt-4 text-[10px] font-bold text-slate-500 hover:text-slate-300 transition uppercase tracking-widest">
              Ver Todas as Notificações
            </button>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-indigo-300 mb-2">Convidado com Inteligência</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              O Orizon identificou 4 novos projetos no setor de <strong>Agroindústria</strong> que ainda não possuem proteção de patente.
            </p>
            <button className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 py-2 rounded-lg text-xs font-bold transition">
              Propor Consultoria
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
