import { useEffect, useState } from "react";
import { getGlobalMetrics, getLiveDealFlows, getAllUsers, toggleUserVerification, updateUserSubscription } from "../../services/adminService";
import { 
  ShieldAlert, Activity, Users, FolderKanban, Network, 
  Zap, Loader2, ServerCog, CheckCircle, FileSearch,
  Download, TrendingUp, Globe, PieChart, BarChart3
} from "lucide-react";
import { exportEcosystemReport } from "../../services/reportService";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { StatsCard } from "../../components/analytics/StatsCard";
import { 
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEngineRunning, setIsEngineRunning] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [m, d, u] = await Promise.all([getGlobalMetrics(), getLiveDealFlows(), getAllUsers()]);
        setMetrics(m);
        setDeals(d);
        setUsers(u);

        // Load AI Logs
        const logsQ = query(collection(db, "logs_ai"), orderBy("timestamp", "desc"), limit(10));
        const logsSnap = await getDocs(logsQ);
        setLogs(logsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Erro no AdminDashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserVerification(userId, !currentStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, verified: !currentStatus } : u));
    } catch (error) {
      alert("Erro ao alterar verificação do usuário.");
    }
  };

  const handleUpdateSubscription = async (userId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'premium' ? 'free' : 'premium';
      await updateUserSubscription(userId, nextStatus as any);
      setUsers(users.map(u => u.id === userId ? { ...u, subscriptionStatus: nextStatus } : u));
    } catch (error) {
      alert("Erro ao atualizar assinatura.");
    }
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

        <div className="flex gap-3">
          <button 
            onClick={() => exportEcosystemReport()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl font-medium transition-all border border-slate-700 flex items-center gap-2"
          >
            <Download size={18} /> Exportar Relatório
          </button>
          <button 
            onClick={() => setIsEngineRunning(!isEngineRunning)}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${isEngineRunning ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}
          >
            <ServerCog size={18} className={isEngineRunning ? 'animate-spin' : ''} /> 
            {isEngineRunning ? 'Engine: Ativa' : 'Engine: Pausada'}
          </button>
        </div>
      </div>

      {/* MÉTRICAS MACRO */}
      {/* ECOSYSTEM HEALTH & TRL DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0A0514] border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-6">
            <PieChart className="text-indigo-400" size={20} /> Distribuição de Maturidade (TRL)
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Fase de Ideação (TRL 1-3)</span>
              <span className="text-sm font-bold text-slate-100">{metrics?.trlDistribution?.ideia || 0}</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full transition-all duration-1000" 
                style={{ width: `${(metrics?.trlDistribution?.ideia / metrics?.totalProjects) * 100 || 0}%` }} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Prototipação (TRL 4-6)</span>
              <span className="text-sm font-bold text-slate-100">{metrics?.trlDistribution?.prototipo || 0}</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-cyan-500 h-full transition-all duration-1000" 
                style={{ width: `${(metrics?.trlDistribution?.prototipo / metrics?.totalProjects) * 100 || 0}%` }} 
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Pronto para Mercado (TRL 7+)</span>
              <span className="text-sm font-bold text-slate-100">{metrics?.trlDistribution?.mercado || 0}</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-1000" 
                style={{ width: `${(metrics?.trlDistribution?.mercado / metrics?.totalProjects) * 100 || 0}%` }} 
              />
            </div>
          </div>
        </div>

        <div className="bg-[#0A0514] border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-center items-center text-center">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
            <BarChart3 className="text-amber-400" size={20} /> Saúde do Ecossistema
          </h2>
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-amber-500 transition-all duration-1000" strokeWidth="3" strokeDasharray={`${metrics?.avgVdrProgress || 0}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-slate-100">{metrics?.avgVdrProgress || 0}%</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Média de Completude VDR</p>
          <p className="text-[10px] text-slate-600 mt-2 max-w-[200px]">Indica o nível médio de prontidão para investimento do ecossistema.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          label="Total de Usuários" 
          value={metrics.totalUsers} 
          icon={Users} 
          trend={12} 
          color="indigo" 
          description={`${metrics.breakdownUsers.icts} ICTs / ${metrics.breakdownUsers.companies} Orgs`}
        />
        <StatsCard 
          label="Projetos Ativos" 
          value={metrics.totalProjects} 
          icon={FolderKanban} 
          trend={8} 
          color="cyan" 
        />
        <StatsCard 
          label="Matches Gerados" 
          value={metrics.totalMatchesGenerated} 
          icon={Network} 
          trend={24} 
          color="emerald" 
        />
        <StatsCard 
          label="Deal Flows" 
          value={metrics.totalActiveDeals} 
          icon={Zap} 
          trend={5} 
          color="amber" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Crescimento do Ecossistema</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
              <TrendingUp size={12} /> +12% MoM
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={[
                { name: 'Jan', users: 400, deals: 240 },
                { name: 'Fev', users: 300, deals: 139 },
                { name: 'Mar', users: 200, deals: 980 },
                { name: 'Abr', users: 278, deals: 390 },
                { name: 'Mai', users: 189, deals: 480 },
                { name: 'Jun', users: 239, deals: 380 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                <Bar dataKey="users" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="deals" fill="#10b981" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-6">Atividade Regional</h3>
          <div className="flex-1 flex flex-col justify-center space-y-4">
             {[
               { region: 'Joinville / Norte', activity: 85, color: 'bg-indigo-500' },
               { region: 'Florianópolis / Litoral', activity: 92, color: 'bg-emerald-500' },
               { region: 'Chapecó / Oeste', activity: 45, color: 'bg-amber-500' },
               { region: 'Blumenau / Vale', activity: 68, color: 'bg-cyan-500' },
             ].map((reg, idx) => (
               <div key={idx} className="space-y-1">
                 <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                   <span>{reg.region}</span>
                   <span>{reg.activity}%</span>
                 </div>
                 <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div className={`${reg.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${reg.activity}%` }} />
                 </div>
               </div>
             ))}
          </div>
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 italic flex items-center gap-2">
              <Globe size={12} /> Heatmap baseado em logins e novos projetos
            </p>
          </div>
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

      {/* AI AUDIT LOGS */}
      <div className="bg-[#0A0514] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileSearch className="text-amber-400" size={20} /> Auditoria de IA (Histórico de Refinamento)
          </h2>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Powered by NVIDIA NIM</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 uppercase tracking-wider text-slate-500 bg-slate-900/30">
                <th className="p-4 font-medium">ID / Status</th>
                <th className="p-4 font-medium">Pitch Resultante</th>
                <th className="p-4 font-medium">Data / Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {logs.length === 0 ? (
                <tr><td colSpan={3} className="p-8 text-center text-slate-600 italic">Nenhum log de IA registrado.</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-slate-500">{log.id.slice(0, 8)}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded w-fit ${log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {log.status.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 max-w-md">
                      <p className="text-slate-300 line-clamp-2 italic">"{log.output?.summary || 'N/A'}"</p>
                    </td>
                    <td className="p-4 text-slate-500">
                      {log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleString() : 'Recent'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONTROLE DE USUÁRIOS */}
      <div className="bg-[#0A0514] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Users className="text-indigo-500" size={20} /> Controle de Usuários
          </h2>
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5"><ServerCog size={14}/> Últimos 100</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500 bg-slate-900/80">
                <th className="p-4 font-medium">Nome / Email</th>
                <th className="p-4 font-medium">Papel (Role)</th>
                <th className="p-4 font-medium">Selo / Plano</th>
                <th className="p-4 font-medium text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">Nenhum usuário encontrado.</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-slate-200 font-bold">{u.name || "Sem Nome"}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-1">{u.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        u.role === 'company' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                        u.role === 'investor' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        u.role === 'ict' ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        {u.verified ? (
                           <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-black uppercase"><CheckCircle size={12} /> Verificado</span>
                        ) : (
                           <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Não Verificado</span>
                        )}
                        
                        <span className={`w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                          u.subscriptionStatus === 'premium' 
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}>
                          {u.subscriptionStatus || 'free'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleToggleVerification(u.id, u.verified)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${
                            u.verified 
                              ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white' 
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                        >
                          {u.verified ? "Desverificar" : "Verificar"}
                        </button>
                        
                        <button 
                          onClick={() => handleUpdateSubscription(u.id, u.subscriptionStatus)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${
                            u.subscriptionStatus === 'premium'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20'
                          }`}
                        >
                          {u.subscriptionStatus === 'premium' ? "Downgrade Free" : "Dar Premium"}
                        </button>
                      </div>
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
