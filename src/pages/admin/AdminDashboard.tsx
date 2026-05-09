import { useEffect, useState } from "react";
import { getGlobalMetrics, getLiveDealFlows } from "../../services/adminService";
import { ShieldAlert, Activity, Users, FolderKanban, Network, Zap, Loader2, ServerCog, Cpu } from "lucide-react";

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEngineRunning, setIsEngineRunning] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [m, d] = await Promise.all([getGlobalMetrics(), getLiveDealFlows()]);
        setMetrics(m);
        setDeals(d);
      } catch (error) {
        console.error("Erro no AdminDashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const triggerMatchEngine = () => {
    setIsEngineRunning(true);
    // Simula a execução do Cloud Function
    setTimeout(() => {
      setIsEngineRunning(false);
      alert("Motor de Match executado com sucesso! Ecossistema scaneado.");
    }, 2500);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-fuchsia-500" size={48} /></div>;
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
        <ShieldAlert size={48} className="text-red-500" />
        <h2 className="text-xl font-bold text-slate-200">Acesso Negado</h2>
        <p className="text-center max-w-md">Você não tem permissões no banco de dados para ler dados globais. Por favor, atualize as Regras do Firestore (Firestore Rules).</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-fuchsia-900/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center border border-fuchsia-500/20 shadow-[0_0_30px_rgba(217,70,239,0.15)]">
            <ShieldAlert size={28} className="text-fuchsia-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-3">
              God Mode <span className="bg-fuchsia-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Admin</span>
            </h1>
            <p className="text-fuchsia-400/70 text-sm font-medium mt-1">Painel de Observabilidade do Orizon Match</p>
          </div>
        </div>

        <button 
          onClick={triggerMatchEngine}
          disabled={isEngineRunning}
          className="bg-slate-900 hover:bg-slate-800 text-fuchsia-400 border border-fuchsia-500/30 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(217,70,239,0.1)] hover:shadow-[0_0_30px_rgba(217,70,239,0.2)] disabled:opacity-50"
        >
          {isEngineRunning ? <Loader2 size={18} className="animate-spin" /> : <Cpu size={18} />}
          {isEngineRunning ? "Processando Algoritmo..." : "Forçar Motor de Match"}
        </button>
      </div>

      {/* MÉTRICAS MACRO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0A0514] border border-fuchsia-900/50 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-fuchsia-900/20 group-hover:text-fuchsia-900/40 transition-colors"><Users size={120} /></div>
          <p className="text-fuchsia-400 text-sm font-bold uppercase tracking-wider mb-2 relative z-10">Total de Usuários</p>
          <p className="text-5xl font-black text-slate-100 relative z-10">{metrics.totalUsers}</p>
          <div className="mt-4 flex gap-2 text-[10px] text-slate-400 font-medium uppercase relative z-10">
            <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">{metrics.breakdownUsers.icts} ICTs</span>
            <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">{metrics.breakdownUsers.companies} Empresas</span>
            <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">{metrics.breakdownUsers.investors} Invest.</span>
          </div>
        </div>

        <div className="bg-[#0A0514] border border-cyan-900/50 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-cyan-900/20 group-hover:text-cyan-900/40 transition-colors"><FolderKanban size={120} /></div>
          <p className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-2 relative z-10">Projetos Ativos</p>
          <p className="text-5xl font-black text-slate-100 relative z-10">{metrics.totalProjects}</p>
          <p className="text-xs text-slate-500 mt-4 relative z-10 font-medium">Pool de inovação atual</p>
        </div>

        <div className="bg-[#0A0514] border border-emerald-900/50 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-emerald-900/20 group-hover:text-emerald-900/40 transition-colors"><Network size={120} /></div>
          <p className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2 relative z-10">Matches Gerados</p>
          <p className="text-5xl font-black text-slate-100 relative z-10">{metrics.totalMatchesGenerated}</p>
          <p className="text-xs text-slate-500 mt-4 relative z-10 font-medium">Recomendações feitas pelo algoritmo</p>
        </div>

        <div className="bg-[#0A0514] border border-amber-900/50 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-amber-900/20 group-hover:text-amber-900/40 transition-colors"><Zap size={120} /></div>
          <p className="text-amber-400 text-sm font-bold uppercase tracking-wider mb-2 relative z-10">Deal Flows Abertos</p>
          <p className="text-5xl font-black text-slate-100 relative z-10">{metrics.totalActiveDeals}</p>
          <p className="text-xs text-slate-500 mt-4 relative z-10 font-medium">Negociações em andamento no Chat</p>
        </div>
      </div>

      {/* LIVE DEAL FLOWS */}
      <div className="bg-[#0A0514] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Activity className="text-fuchsia-500" size={20} /> Live Deal Flow Tracker
          </h2>
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5"><ServerCog size={14}/> Últimos 50 deals</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500 bg-slate-900/80">
                <th className="p-4 font-medium">ID da Conversa / Projeto</th>
                <th className="p-4 font-medium">Estágio</th>
                <th className="p-4 font-medium text-right">Última Interação</th>
              </tr>
            </thead>
            <tbody>
              {deals.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500">Nenhum Deal Flow ativo na plataforma.</td>
                </tr>
              ) : (
                deals.map(deal => (
                  <tr key={deal.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-slate-200 font-bold">{deal.projectTitle || `Match ${deal.matchId?.slice(0,6)}`}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-1">Ref: {deal.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        deal.stage === 'closed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        deal.stage === 'negotiation' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        deal.stage === 'proposal' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        deal.stage === 'nda' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {deal.stage}
                      </span>
                    </td>
                    <td className="p-4 text-right text-xs text-slate-400">
                      {deal.updatedAt?.toDate ? deal.updatedAt.toDate().toLocaleString() : 'Recente'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
