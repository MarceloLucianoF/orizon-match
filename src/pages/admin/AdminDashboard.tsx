import { useEffect, useState } from "react";
import { 
  getGlobalMetrics, getLiveDealFlows, getAllUsers, 
  toggleUserVerification, updateUserSubscription,
  adminDeleteUserAPI
} from "../../services/adminService";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ShieldAlert, Activity, Users, FolderKanban, Network, 
  Zap, Loader2, ServerCog, CheckCircle, FileSearch,
  Download, TrendingUp, Globe, PieChart, BarChart3,
  LayoutDashboard
} from "lucide-react";
import { exportEcosystemReport } from "../../services/reportService";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { StatsCard } from "../../components/analytics/StatsCard";
import { 
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { CreateUserModal } from "../../components/admin/CreateUserModal";
import { useTranslation } from "react-i18next";

export function AdminDashboard() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEngineRunning, setIsEngineRunning] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { setImpersonatedUid } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeTab = searchParams.get("tab") || "overview";

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const loadData = async () => {
    try {
      const [m, d, u] = await Promise.all([getGlobalMetrics(), getLiveDealFlows(), getAllUsers()]);
      setMetrics(m);
      setDeals(d);
      setUsers(u);

      const logsQ = query(collection(db, "logs_ai"), orderBy("timestamp", "desc"), limit(20));
      const logsSnap = await getDocs(logsQ);
      setLogs(logsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Erro no AdminDashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserVerification(userId, !currentStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, verified: !currentStatus } : u));
    } catch (error) {
      alert(t("dashboard.admin.errorToggleVerification"));
    }
  };

  const handleUpdateSubscription = async (userId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'premium' ? 'free' : 'premium';
      await updateUserSubscription(userId, nextStatus as any);
      setUsers(users.map(u => u.id === userId ? { ...u, subscriptionStatus: nextStatus } : u));
    } catch (error) {
      alert(t("dashboard.admin.errorUpdateSubscription"));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm(t("dashboard.admin.deleteUserConfirm"))) return;
    try {
      await adminDeleteUserAPI(userId);
      setUsers(users.filter(u => u.id !== userId));
      alert(t("dashboard.admin.deleteUserSuccess"));
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-fuchsia-500" size={48} /></div>;
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
        <ShieldAlert size={48} className="text-red-500" />
        <h2 className="text-xl font-bold text-slate-200">{t("dashboard.admin.accessDenied")}</h2>
        <p className="text-center max-w-md">{t("dashboard.admin.accessDeniedDesc")}</p>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label={t("dashboard.admin.totalUsers")} value={metrics.totalUsers} icon={Users} trend={12} color="indigo" description={t("dashboard.admin.totalUsersDesc", { icts: metrics.breakdownUsers.icts, companies: metrics.breakdownUsers.companies })} />
        <StatsCard label={t("dashboard.admin.activeProjects")} value={metrics.totalProjects} icon={FolderKanban} trend={8} color="cyan" />
        <StatsCard label={t("dashboard.admin.matchesGenerated")} value={metrics.totalMatchesGenerated} icon={Network} trend={24} color="emerald" />
        <StatsCard label={t("dashboard.admin.dealFlows")} value={metrics.totalActiveDeals} icon={Zap} trend={5} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0A0514] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-6">
            <PieChart className="text-indigo-400" size={20} /> {t("dashboard.admin.trlDistribution")}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{t("dashboard.admin.ideationPhase")}</span>
              <span className="text-sm font-bold text-slate-100">{metrics?.trlDistribution?.idea || 0}</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${(metrics?.trlDistribution?.idea / metrics?.totalProjects) * 100 || 0}%` }} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{t("dashboard.admin.prototypingPhase")}</span>
              <span className="text-sm font-bold text-slate-100">{metrics?.trlDistribution?.prototype || 0}</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full transition-all duration-1000" style={{ width: `${(metrics?.trlDistribution?.prototype / metrics?.totalProjects) * 100 || 0}%` }} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{t("dashboard.admin.marketReady")}</span>
              <span className="text-sm font-bold text-slate-100">{metrics?.trlDistribution?.market || 0}</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${(metrics?.trlDistribution?.market / metrics?.totalProjects) * 100 || 0}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-[#0A0514] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center items-center text-center">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
            <BarChart3 className="text-amber-400" size={20} /> {t("dashboard.admin.ecosystemHealth")}
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
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{t("dashboard.admin.vdrCompleteness")}</p>
          <p className="text-[10px] text-slate-600 mt-2 max-w-[200px] mb-4">{t("dashboard.admin.vdrCompletenessDesc")}</p>
          <button 
            onClick={() => alert("Campanha de Nudge disparada com sucesso! 42 inventores com VDR incompleto (< 70%) foram notificados por e-mail e push.")}
            className="w-full py-2 bg-indigo-650/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 rounded-xl font-bold text-xs transition-all shadow-[0_0_15px_rgba(99,102,241,0.05)]"
          >
            {t("dashboard.admin.nudgeVdrBtn")}
          </button>
        </div>
      </div>

      {/* AI Active Audit Feed */}
      <div className="bg-[#0A0514] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert className="text-fuchsia-500 animate-pulse" size={18} /> {t("dashboard.admin.activeAudit.title")}
          </h3>
          <span className="text-[9px] bg-fuchsia-500/10 text-fuchsia-400 px-2 py-0.5 rounded border border-fuchsia-500/20 font-bold uppercase tracking-wider">{t("dashboard.admin.activeAudit.realtime")}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-start gap-3 hover:border-red-500/20 transition-all">
            <ShieldAlert className="text-red-400 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Projeto: Grafeno Nano-Estruturado (LNano)</h4>
              <p className="text-[11px] text-slate-450 mt-1">Inconsistência TRL/PI: Declarado TRL 7 (pronto para mercado) porém sem patente registrada ou pendente no VDR.</p>
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => alert("Notificação enviada ao inventor!")}
                  className="text-[9px] bg-red-500/10 hover:bg-red-500/20 text-red-300 px-2.5 py-1 rounded border border-red-500/20 font-bold transition-all"
                >
                  Notificar Inventor
                </button>
                <button 
                  onClick={() => handleTabChange("logs")}
                  className="text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-400 px-2.5 py-1 rounded border border-slate-800 font-bold transition-all"
                >
                  Auditar VDR
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3 hover:border-amber-500/20 transition-all">
            <ShieldAlert className="text-amber-400 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Projeto: Smart Grid IoT para Cidades Inteligentes</h4>
              <p className="text-[11px] text-slate-450 mt-1">Inconsistência TRL/PI: Declarado TRL 5 (protótipo validado) mas com pendência de documentos de cessão de direitos autorais de software.</p>
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => alert("Notificação enviada ao inventor!")}
                  className="text-[9px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded border border-amber-500/20 font-bold transition-all"
                >
                  Notificar Inventor
                </button>
                <button 
                  onClick={() => handleTabChange("logs")}
                  className="text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-400 px-2.5 py-1 rounded border border-slate-800 font-bold transition-all"
                >
                  Auditar VDR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0A0514] border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">{t("dashboard.admin.ecosystemGrowth")}</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
              <TrendingUp size={12} /> +12% MoM
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={[
                { name: 'Jan', users: 400, deals: 240 }, { name: 'Fev', users: 300, deals: 139 },
                { name: 'Mar', users: 200, deals: 980 }, { name: 'Abr', users: 278, deals: 390 },
                { name: 'Mai', users: 189, deals: 480 }, { name: 'Jun', users: 239, deals: 380 },
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

        <div className="bg-[#0A0514] border border-slate-800 rounded-3xl p-6 flex flex-col shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-6">{t("dashboard.admin.regionalActivity")}</h3>
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
          <button 
            onClick={() => alert("Planilha de densidade regional e atividade governamental exportada!")}
            className="w-full mt-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-800 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
          >
            <Download size={12} /> {t("dashboard.admin.exportRegionalBtn")}
          </button>
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <p className="text-[10px] text-slate-500 italic flex items-center gap-2">
              <Globe size={12} /> {t("dashboard.admin.heatmapDesc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-[#0A0514] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Users className="text-indigo-500" size={20} /> {t("dashboard.admin.userControl")}
          </h2>
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5"><ServerCog size={14}/> {t("dashboard.admin.lastUsers")}</span>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]"
        >
          {t("dashboard.admin.createUser")}
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500 bg-slate-900/80">
              <th className="p-4 font-medium">{t("dashboard.admin.tableHeaders.nameEmail")}</th>
              <th className="p-4 font-medium">{t("dashboard.admin.tableHeaders.role")}</th>
              <th className="p-4 font-medium">{t("dashboard.admin.tableHeaders.badgePlan")}</th>
              <th className="p-4 font-medium text-right">{t("dashboard.admin.tableHeaders.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-500">{t("dashboard.admin.noUsers")}</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-slate-200 font-bold">{u.name || t("dashboard.admin.noName")}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-1">{u.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      u.role === 'industry' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
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
                         <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-black uppercase"><CheckCircle size={12} /> {t("dashboard.admin.verified")}</span>
                      ) : (
                         <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">{t("dashboard.admin.notVerified")}</span>
                      )}
                      <span className={`w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                        u.subscriptionStatus === 'premium' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}>
                        {u.subscriptionStatus || 'free'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleToggleVerification(u.id, u.verified)} className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${u.verified ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'}`}>
                        {u.verified ? t("dashboard.admin.actions.unverify") : t("dashboard.admin.actions.verify")}
                      </button>
                      <button onClick={() => handleUpdateSubscription(u.id, u.subscriptionStatus)} className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${u.subscriptionStatus === 'premium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20'}`}>
                        {u.subscriptionStatus === 'premium' ? t("dashboard.admin.actions.downgrade") : t("dashboard.admin.actions.premium")}
                      </button>
                      <button onClick={() => { setImpersonatedUid(u.id); navigate('/dashboard'); }} className="px-2 py-1 rounded text-[10px] font-bold transition-all border bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 hover:bg-fuchsia-500/20">
                        {t("dashboard.admin.actions.simulate")}
                      </button>
                      <button onClick={() => handleDeleteUser(u.id)} className="px-2 py-1 rounded text-[10px] font-bold transition-all border bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20">
                        {t("dashboard.admin.actions.delete")}
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
  );

  const renderDeals = () => (
    <div className="bg-[#0A0514] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Activity className="text-fuchsia-500" size={20} /> {t("dashboard.admin.liveTracker")}
        </h2>
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5"><ServerCog size={14}/> {t("dashboard.admin.lastDeals")}</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500 bg-slate-900/80">
              <th className="p-4 font-medium">{t("dashboard.admin.dealHeaders.idProject")}</th>
              <th className="p-4 font-medium">{t("dashboard.admin.dealHeaders.stage")}</th>
              <th className="p-4 font-medium text-right">{t("dashboard.admin.dealHeaders.lastInteraction")}</th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-slate-500">{t("dashboard.admin.noDeals")}</td></tr>
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
                    {deal.updatedAt?.toDate ? deal.updatedAt.toDate().toLocaleString() : t("dashboard.admin.recent")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="bg-[#0A0514] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <FileSearch className="text-amber-400" size={20} /> {t("dashboard.admin.iaAudit")}
        </h2>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Powered by NVIDIA NIM</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 uppercase tracking-wider text-slate-500 bg-slate-900/30">
              <th className="p-4 font-medium">{t("dashboard.admin.tableHeaders.idStatus")}</th>
              <th className="p-4 font-medium">{t("dashboard.admin.tableHeaders.resultingPitch")}</th>
              <th className="p-4 font-medium">{t("dashboard.admin.tableHeaders.dateTime")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {logs.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-slate-600 italic">{t("dashboard.admin.noLogs")}</td></tr>
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
                    {log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleString() : t("dashboard.admin.recent")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-700">
      
      {/* WARNING BANNER FOR PAUSED ENGINE */}
      {!isEngineRunning && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-405 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
          <div className="flex items-center gap-3">
            <ShieldAlert size={20} className="text-amber-500 flex-shrink-0 animate-pulse" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">{t("dashboard.admin.warningBanner.enginePausedTitle")}</h4>
              <p className="text-[11px] text-slate-450 mt-0.5">{t("dashboard.admin.warningBanner.enginePausedDesc")}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEngineRunning(true)}
            className="text-[10px] font-black uppercase tracking-widest bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            {t("dashboard.admin.warningBanner.resumeEngine")}
          </button>
        </div>
      )}
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-fuchsia-900/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center border border-fuchsia-500/20 shadow-[0_0_30px_rgba(217,70,239,0.15)]">
            <ShieldAlert size={28} className="text-fuchsia-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-3">
              Admin Workspace <span className="bg-fuchsia-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">{t("dashboard.admin.godMode")}</span>
            </h1>
            <p className="text-fuchsia-400/70 text-sm font-medium mt-1">{t("dashboard.admin.centralControl")}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => exportEcosystemReport()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl font-medium transition-all border border-slate-700 flex items-center gap-2 text-sm"
          >
            <Download size={16} /> {t("dashboard.admin.export")}
          </button>
          <button 
            onClick={() => setIsEngineRunning(!isEngineRunning)}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 text-sm ${isEngineRunning ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}
          >
            <ServerCog size={16} className={isEngineRunning ? 'animate-spin' : ''} /> 
            {isEngineRunning ? t("dashboard.admin.engineActive") : t("dashboard.admin.enginePaused")}
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-px overflow-x-auto custom-scrollbar">
        {[
          { id: 'overview', label: t("dashboard.admin.tabs.overview"), icon: LayoutDashboard },
          { id: 'users', label: t("dashboard.admin.tabs.users"), icon: Users },
          { id: 'deals', label: t("dashboard.admin.tabs.deals"), icon: Activity },
          { id: 'logs', label: t("dashboard.admin.tabs.logs"), icon: FileSearch },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-fuchsia-500 text-fuchsia-400 bg-fuchsia-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="pt-2">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'deals' && renderDeals()}
        {activeTab === 'logs' && renderLogs()}
      </div>

      {showCreateModal && (
        <CreateUserModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData(); // Reload users after creation
          }}
        />
      )}
    </div>
  );
}
