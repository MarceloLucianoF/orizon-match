import { useEffect, useState } from "react";
import { 
  getGlobalMetrics, getLiveDealFlows, getAllUsers, 
  toggleUserVerification, updateUserSubscription,
  adminDeleteUserAPI
} from "../../services/adminService";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ShieldAlert, ShieldCheck, Activity, Users, FolderKanban, Network, 
  Zap, Loader2, ServerCog, CheckCircle, FileSearch,
  Download, TrendingUp, Globe, PieChart, BarChart3,
  LayoutDashboard
} from "lucide-react";
import { exportEcosystemReport } from "../../services/reportService";
import { collection, query, orderBy, limit, getDocs, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
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
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEngineRunning, setIsEngineRunning] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [complianceLogs, setComplianceLogs] = useState<any[]>([]);
  const [loadingCompliance, setLoadingCompliance] = useState(false);
  const [filterAction, setFilterAction] = useState("");
  const [filterActor, setFilterActor] = useState("");

  // Match Simulator State
  const [simProject, setSimProject] = useState("");
  const [simUser, setSimUser] = useState("");
  const [simScore, setSimScore] = useState(90);
  const [simFullFlow, setSimFullFlow] = useState(true);
  const [simulating, setSimulating] = useState(false);
  
  const { setImpersonatedUid } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeTab = searchParams.get("tab") || "overview";
  const surfaceClass = "bg-[#0A0514] border border-slate-800 rounded-3xl shadow-[0_24px_80px_rgba(2,6,23,0.38)] backdrop-blur-sm overflow-hidden";

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const loadData = async () => {
    try {
      const [m, d, u] = await Promise.all([getGlobalMetrics(), getLiveDealFlows(), getAllUsers()]);
      setMetrics(m);
      setDeals(d);
      setUsers(u);

      const projSnap = await getDocs(collection(db, "projects"));
      setProjects(projSnap.docs.map(d => ({ id: d.id, ...d.data() })));

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

  const loadComplianceLogs = async () => {
    setLoadingCompliance(true);
    try {
      const q = query(
        collection(db, "audit_logs"),
        orderBy("timestamp", "desc"),
        limit(100)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComplianceLogs(data);
    } catch (error) {
      console.error("Erro ao carregar logs de compliance:", error);
    } finally {
      setLoadingCompliance(false);
    }
  };

  useEffect(() => {
    if (activeTab === "compliance") {
      loadComplianceLogs();
    }
  }, [activeTab]);

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
        <div className={surfaceClass}>
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

        <div className={surfaceClass + " flex flex-col justify-center items-center text-center"}>
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
      <div className={surfaceClass + " p-6 space-y-4"}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert className="text-fuchsia-500 animate-pulse" size={18} /> {t("dashboard.admin.activeAudit.title")}
          </h3>
          <span className="text-[9px] bg-fuchsia-500/10 text-fuchsia-400 px-2 py-0.5 rounded border border-fuchsia-500/20 font-bold uppercase tracking-wider">{t("dashboard.admin.activeAudit.realtime")}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {logs && logs.length > 0 ? (
            logs.slice(0, 2).map((log: any) => (
              <div key={log.id} className={`p-4 rounded-2xl flex items-start gap-3 transition-all ${log.type === 'alert' ? 'bg-red-500/5 border border-red-500/10 hover:border-red-500/20' : 'bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/20'}`}>
                <ShieldAlert className={`${log.type === 'alert' ? 'text-red-400' : 'text-amber-400'} mt-0.5 flex-shrink-0`} size={16} />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Projeto: {log.projectTitle || (log.projectId === 'proj_gateway_iot' ? 'Gateway IoT Industrial' : (log.projectId === 'proj_scm_embrapii' ? 'Smart City Manager (SCM)' : 'Projeto Inatel'))}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{log.message || log.text}</p>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => alert("Notificação enviada ao inventor!")}
                      className={`text-[9px] px-2.5 py-1 rounded border font-bold transition-all ${log.type === 'alert' ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-300' : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-300'}`}
                    >
                      Notificar Inventor
                    </button>
                    <button 
                      onClick={() => handleTabChange("logs")}
                      className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-400 px-2.5 py-1 rounded border border-slate-800 font-bold transition-all"
                    >
                      Auditar VDR
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3 hover:border-amber-500/20 transition-all">
                <ShieldAlert className="text-amber-400 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Projeto: Gateway IoT Industrial</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Auditoria: Este projeto está aderente ao programa MOVER (Mobilidade Verde e Inovação). Sugerimos vincular o laboratório WAI Lab do Inatel para acelerar a subvenção de R$ 300k da EMBRAPII.</p>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => alert("Notificação enviada ao inventor!")}
                      className="text-[9px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded border border-amber-500/20 font-bold transition-all"
                    >
                      Notificar Inventor
                    </button>
                    <button 
                      onClick={() => handleTabChange("logs")}
                      className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-400 px-2.5 py-1 rounded border border-slate-800 font-bold transition-all"
                    >
                      Auditar VDR
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-start gap-3 hover:border-red-500/20 transition-all">
                <ShieldAlert className="text-red-400 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Projeto: Smart City Manager (SCM)</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Inconsistência TRL/PI: Declarado TRL 6 mas com pendência de documentos de cessão de direitos autorais de software.</p>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => alert("Notificação enviada ao inventor!")}
                      className="text-[9px] bg-red-500/10 hover:bg-red-500/20 text-red-300 px-2.5 py-1 rounded border border-red-500/20 font-bold transition-all"
                    >
                      Notificar Inventor
                    </button>
                    <button 
                      onClick={() => handleTabChange("logs")}
                      className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-400 px-2.5 py-1 rounded border border-slate-800 font-bold transition-all"
                    >
                      Auditar VDR
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
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
          <div className="h-64 min-w-0 w-full">
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

        <div className={surfaceClass + " flex flex-col"}>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-6">{t("dashboard.admin.regionalActivity")}</h3>
          <div className="flex-1 flex flex-col justify-center space-y-4">
             {[
               { region: 'Santa Rita do Sapucaí / Vale da Eletrônica', activity: 95, color: 'bg-indigo-500' },
               { region: 'Belo Horizonte / Região Metropolitana', activity: 88, color: 'bg-emerald-500' },
               { region: 'Uberlândia / Triângulo Mineiro', activity: 64, color: 'bg-amber-500' },
               { region: 'Juiz de Fora / Zona da Mata', activity: 48, color: 'bg-cyan-500' },
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
    <div className={surfaceClass + " animate-in fade-in slide-in-from-bottom-4 duration-500"}>
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
    <div className={surfaceClass + " animate-in fade-in slide-in-from-bottom-4 duration-500"}>
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
                       <span className="text-slate-200 font-bold">{deal.projectName || `Match ${deal.id?.slice(0,6)}`}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-1">Ref: {deal.id}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      deal.stage === 'contrato' || deal.stage === 'encerrado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      deal.stage === 'negociacao' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      deal.stage === 'avaliacao' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                      deal.stage === 'nda' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {deal.stage || deal.status}
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
    <div className={surfaceClass + " animate-in fade-in slide-in-from-bottom-4 duration-500"}>
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

  const handleCreateSimulation = async () => {
    if (!simProject || !simUser) {
      alert("Por favor, selecione um projeto e um usuário-alvo.");
      return;
    }
    setSimulating(true);
    try {
      const selectedProj = projects.find(p => p.id === simProject);
      const selectedUser = users.find(u => u.id === simUser);

      if (!selectedProj || !selectedUser) return;

      const matchId = `match_${simProject}_${simUser}`;
      const matchRef = doc(db, "matches", matchId);

      // Create Match
      await setDoc(matchRef, {
        id: matchId,
        ownerProjectId: simProject,
        ownerProjectTitle: selectedProj.title || "Projeto Orizon",
        targetUserId: simUser,
        targetRole: selectedUser.role,
        targetSegment: selectedUser.segment || selectedUser.segments?.[0] || "Deep Tech",
        score: simScore,
        status: simFullFlow ? "negotiation" : "new",
        createdAt: serverTimestamp(),
        breakdown: {
          segment: 30,
          maturity: 20,
          readiness: 15,
          needs: 15,
          location: 10
        }
      });

      // If full flow requested, create conversation and initial messages
      if (simFullFlow) {
        const convRef = doc(db, "conversations", matchId);
        await setDoc(convRef, {
          projectId: simProject,
          organizationId: simUser,
          matchId: matchId,
          participants: [selectedProj.userId || "inventor_rafael", simUser],
          stage: "negotiation",
          status: "active",
          initiatorId: selectedProj.userId || "inventor_rafael",
          updatedAt: serverTimestamp(),
          projectTitle: selectedProj.title || "Projeto Orizon",
          unreadCount: {
            [selectedProj.userId || "inventor_rafael"]: 0,
            [simUser]: 0
          },
          lastMessage: "Olá! Vimos o selo ICT Verified no seu projeto e gostaríamos de iniciar a análise de Due Diligence."
        });

        // Add initial system message
        await addDoc(collection(db, "messages"), {
          conversationId: matchId,
          senderId: "system",
          text: "Interesse demonstrado. O Deal Flow foi iniciado na etapa de Negociação Ativa (Match Simulado).",
          type: "system",
          createdAt: serverTimestamp(),
          isSystem: true
        });

        // Add user message
        await addDoc(collection(db, "messages"), {
          conversationId: matchId,
          senderId: simUser,
          text: "Olá! Vimos o selo ICT Verified no seu projeto e gostaríamos de iniciar a análise de Due Diligence.",
          type: "text",
          createdAt: serverTimestamp()
        });
      }

      alert("Match simulado com sucesso!");
      loadData();
    } catch (err: any) {
      console.error(err);
      alert("Erro ao simular match: " + err.message);
    } finally {
      setSimulating(false);
    }
  };

  const renderSimulator = () => (
    <div className={surfaceClass + " p-6 space-y-6 max-w-2xl mx-auto animate-in fade-in duration-500"}>
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <ServerCog className="text-fuchsia-500 animate-spin" size={22} /> Simulador de Match ("Demo Maker")
        </h2>
        <p className="text-xs text-slate-400 mt-1">Gere matches e fluxos de negociação (CRM/Chat) fictícios para testar a plataforma instantaneamente.</p>
      </div>

      <div className="space-y-4">
        {/* Project Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">1. Selecionar Projeto (Inventor/ICT)</label>
          <select
            value={simProject}
            onChange={e => setSimProject(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-fuchsia-500"
          >
            <option value="">-- Escolha um Projeto --</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.title} (TRL {p.maturity || p.declaredTRL || 1} - {p.segment})
              </option>
            ))}
          </select>
        </div>

        {/* User Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">2. Selecionar Empresa / Vendedor (Destino)</label>
          <select
            value={simUser}
            onChange={e => setSimUser(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-fuchsia-500"
          >
            <option value="">-- Escolha uma Empresa/Investidor --</option>
            {users
              .filter(u => u.role === 'industry' || u.role === 'investor')
              .map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role?.toUpperCase()} - {u.segment || "Deep Tech"})
                </option>
              ))}
          </select>
        </div>

        {/* Score Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>3. Afinidade (Match Score)</span>
            <span className="text-fuchsia-400">{simScore}% FIT</span>
          </div>
          <input
            type="range"
            min="60"
            max="100"
            step="1"
            value={simScore}
            onChange={e => setSimScore(Number(e.target.value))}
            className="w-full accent-fuchsia-500"
          />
        </div>

        {/* Full Flow Switch */}
        <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
          <input
            type="checkbox"
            id="simFullFlow"
            checked={simFullFlow}
            onChange={e => setSimFullFlow(e.target.checked)}
            className="w-5 h-5 text-fuchsia-500 rounded border-slate-750 focus:ring-fuchsia-500 bg-slate-900"
          />
          <label htmlFor="simFullFlow" className="text-xs font-bold text-slate-300 cursor-pointer select-none">
            Simular Fluxo Completo (Criar Chat & Conversas no CRM)
          </label>
        </div>

        <button
          onClick={handleCreateSimulation}
          disabled={simulating}
          className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(217,70,239,0.3)] flex items-center justify-center gap-2 cursor-pointer"
        >
          {simulating ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>Simular & Forçar Match</>
          )}
        </button>
      </div>
    </div>
  );

  const renderCompliance = () => {
    const filteredLogs = complianceLogs.filter(log => {
      const matchAction = filterAction ? log.action?.toLowerCase().includes(filterAction.toLowerCase()) : true;
      const matchActor = filterActor ? (
        log.actorName?.toLowerCase().includes(filterActor.toLowerCase()) || 
        log.actorEmail?.toLowerCase().includes(filterActor.toLowerCase()) ||
        log.actorRole?.toLowerCase().includes(filterActor.toLowerCase())
      ) : true;
      return matchAction && matchActor;
    });

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className={surfaceClass + " p-6 space-y-4"}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="text-emerald-400 animate-pulse" size={22} /> Auditoria & Compliance Center
              </h2>
              <p className="text-xs text-slate-400 mt-1">Registros imutáveis de ações críticas e histórico jurídico (Event Sourcing).</p>
            </div>
            <button
              onClick={loadComplianceLogs}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold border border-slate-800 transition-all flex items-center gap-1.5"
            >
              {loadingCompliance ? <Loader2 className="animate-spin" size={14} /> : "Atualizar Logs"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Filtrar por Ação</label>
              <input
                type="text"
                value={filterAction}
                onChange={e => setFilterAction(e.target.value)}
                placeholder="Ex: project.due_diligence.toggle, deal.created"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Filtrar por Usuário (Nome, Email ou Role)</label>
              <input
                type="text"
                value={filterActor}
                onChange={e => setFilterActor(e.target.value)}
                placeholder="Buscar ator..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#0A0514] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          {loadingCompliance ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-indigo-500" size={36} />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 italic">
              Nenhum registro de auditoria encontrado com os filtros atuais.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider bg-slate-900/60">
                    <th className="p-4 font-bold">{t("dashboard.admin.tableHeaders.dateTime")}</th>
                    <th className="p-4 font-bold">Ação</th>
                    <th className="p-4 font-bold">Ator (Usuário)</th>
                    <th className="p-4 font-bold">Contexto</th>
                    <th className="p-4 font-bold">Telemetria (IP/Sessão)</th>
                    <th className="p-4 font-bold">Alterações (Diff)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="p-4 whitespace-nowrap text-slate-400">
                        {log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleString() : "Recent"}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          log.action?.includes("toggle") ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          log.action?.includes("create") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          log.action?.includes("update") ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                          "bg-slate-800 text-slate-400 border-slate-700"
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-200">{log.actorName}</span>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">{log.actorEmail}</span>
                          <span className="text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-tight">Role: {log.actorRole}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {log.projectId ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-200">{log.projectTitle || "Sem Título"}</span>
                            <span className="text-[9px] text-slate-500 font-mono mt-0.5">ID: {log.projectId}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Global</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">IP:</span>
                            <span className="font-mono text-indigo-400">{log.ipAddress || "127.0.0.1"}</span>
                          </div>
                          {log.sessionId && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-500">Sessão:</span>
                              <span className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]" title={log.sessionId}>{log.sessionId.slice(0, 15)}...</span>
                            </div>
                          )}
                          {log.correlationId && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-emerald-500">Tracking:</span>
                              <span className="font-mono text-[10px] text-emerald-500 truncate max-w-[120px]" title={log.correlationId}>{log.correlationId}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 max-w-sm">
                        {log.before || log.after ? (
                          <div className="space-y-1.5">
                            {log.before && (
                              <div className="bg-red-500/5 border border-red-500/10 rounded p-1.5">
                                <span className="text-[9px] uppercase font-black tracking-widest text-red-400 block mb-0.5">Antes</span>
                                <pre className="text-[10px] font-mono text-red-300 truncate max-w-full overflow-hidden">{JSON.stringify(log.before)}</pre>
                              </div>
                            )}
                            {log.after && (
                              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded p-1.5">
                                <span className="text-[9px] uppercase font-black tracking-widest text-emerald-400 block mb-0.5">Depois</span>
                                <pre className="text-[10px] font-mono text-emerald-300 truncate max-w-full overflow-hidden">{JSON.stringify(log.after)}</pre>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Sem payload</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-700">
      
      {/* WARNING BANNER FOR PAUSED ENGINE */}
      {!isEngineRunning && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
          <div className="flex items-center gap-3">
            <ShieldAlert size={20} className="text-amber-500 flex-shrink-0 animate-pulse" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">{t("dashboard.admin.warningBanner.enginePausedTitle")}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{t("dashboard.admin.warningBanner.enginePausedDesc")}</p>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
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
          { id: 'compliance', label: "Auditoria & Compliance", icon: ShieldCheck },
          { id: 'simulator', label: "Simulador de Match", icon: ServerCog },
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
        {activeTab === 'compliance' && renderCompliance()}
        {activeTab === 'simulator' && renderSimulator()}
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
