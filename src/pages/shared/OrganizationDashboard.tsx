import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../firebase/config";
import { 
  collection, query, where, getDocs, 
  doc, getDoc, limit, orderBy 
} from "firebase/firestore";
import { 
  Building2, Users, FileText, 
  Search, 
  ArrowUpRight, Clock, Zap,
  BarChart3, ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";

interface Stats {
  totalProjects: number;
  totalAssets: number;
  totalInventors: number;
  activeMatches: number;
}

interface OrgData {
  name: string;
  type: string;
  managers: string[];
}

export default function OrganizationDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    totalAssets: 0,
    totalInventors: 0,
    activeMatches: 0
  });
  const [org, setOrg] = useState<OrgData | null>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    async function loadOrgData() {
      if (!user) return;
      
      try {
        // 1. Get User Profile to find orgId
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const orgId = userDoc.data()?.orgId;

        if (!orgId) {
          setLoading(false);
          return;
        }

        // 2. Get Organization Details
        const orgDoc = await getDoc(doc(db, "organizations", orgId));
        setOrg({ id: orgDoc.id, ...orgDoc.data() } as any);

        // 3. Get Stats (All projects/assets linked to this org)
        const projectsQuery = query(collection(db, "projects"), where("orgId", "==", orgId));
        const projectsSnap = await getDocs(projectsQuery);
        
        const assetsQuery = query(collection(db, "assets_ip"), where("orgId", "==", orgId));
        const assetsSnap = await getDocs(assetsQuery);

        // Get unique inventors
        const inventorIds = new Set(projectsSnap.docs.map(d => d.data().userId));

        setStats({
          totalProjects: projectsSnap.size,
          totalAssets: assetsSnap.size,
          totalInventors: inventorIds.size,
          activeMatches: projectsSnap.docs.reduce((acc, d) => acc + (d.data().matchesCount || 0), 0)
        });

        // 4. Recent Projects
        const recentQuery = query(
          collection(db, "projects"), 
          where("orgId", "==", orgId),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const recentSnap = await getDocs(recentQuery);
        setRecentProjects(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      } catch (error) {
        console.error("Error loading org data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOrgData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6">
        <Building2 className="mx-auto text-slate-800" size={64} />
        <h2 className="text-2xl font-bold text-white">Nenhuma Instituição Vinculada</h2>
        <p className="text-slate-400">Você ainda não faz parte de uma organização gestora ou NIT no Orizon Match.</p>
        <button className="bg-indigo-600 px-6 py-3 rounded-xl font-bold text-white">Solicitar Acesso Institucional</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Building2 size={20} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/80">Painel Institucional</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{org.name}</h1>
          <p className="text-slate-400 text-sm mt-1">Gestão centralizada de inovação e ativos de PI.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-slate-400 text-sm font-bold flex items-center gap-2 hover:text-white transition-all">
             <Search size={18} /> Buscar Inventor
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all">
             Relatório Executivo
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Projetos Ativos", val: stats.totalProjects, icon: <FileText className="text-blue-400" />, change: "+12%" },
          { label: "Ativos de PI", val: stats.totalAssets, icon: <ShieldCheck className="text-emerald-400" />, change: "+5%" },
          { label: "Inventores", val: stats.totalInventors, icon: <Users className="text-amber-400" />, change: "Estável" },
          { label: "Matches Gerados", val: stats.activeMatches, icon: <Zap className="text-indigo-400" />, change: "+24%" },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-[40px] rounded-full -mr-12 -mt-12 group-hover:bg-white/10 transition-all" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded bg-slate-950 border border-slate-800 ${stat.change.includes('+') ? 'text-emerald-400' : 'text-slate-500'}`}>
                {stat.change}
              </span>
            </div>
            <div className="text-3xl font-black text-white mb-1">{stat.val}</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="text-slate-600" size={20} /> Atividade Recente
             </h2>
             <Link to="/app/projects" className="text-xs text-indigo-400 hover:underline">Ver Todos</Link>
          </div>
          
          <div className="space-y-4">
            {recentProjects.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                <p className="text-slate-500">Nenhum projeto vinculado recentemente.</p>
              </div>
            ) : (
              recentProjects.map(proj => (
                <div key={proj.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:bg-slate-900/60 transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center font-black text-indigo-500 border border-slate-800 group-hover:border-indigo-500/50 transition-colors">
                    {proj.maturity || 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm">{proj.title}</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{proj.segment} • TRL {proj.maturity}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                       <div className="text-xs font-bold text-white">{proj.matchesCount || 0} Matches</div>
                       <div className="text-[10px] text-slate-500">Inteligência Ativa</div>
                    </div>
                    <ArrowUpRight className="text-slate-700 group-hover:text-white transition-colors" size={20} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Insights */}
        <div className="space-y-6">
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-slate-600" size={20} /> Insights do Polo
           </h2>
           
           <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl shadow-xl shadow-indigo-500/10 space-y-4 relative overflow-hidden">
             <Zap className="absolute top-[-10px] right-[-10px] w-24 h-24 text-white/10 -rotate-12" />
             <h3 className="font-bold text-white leading-tight">Match de Alta Conversão Detectado</h3>
             <p className="text-white/70 text-xs leading-relaxed">
               Existem 5 empresas buscando por "Inovação em Grafeno" neste mês. Seu polo possui 2 projetos que atendem 90% dos critérios.
             </p>
             <button className="w-full py-2.5 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-colors">
                Ativar Notificação de Massa
             </button>
           </div>

           <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Métricas de Fomento</h3>
             <div className="space-y-3">
                {[
                  { label: "Embrapii", percent: 65, color: "bg-blue-500" },
                  { label: "FINEP", percent: 40, color: "bg-emerald-500" },
                  { label: "FAPESC", percent: 85, color: "bg-amber-500" },
                ].map(bar => (
                  <div key={bar.label} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-300">{bar.label}</span>
                      <span className="text-slate-500">{bar.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div className={`${bar.color} h-full rounded-full`} style={{ width: `${bar.percent}%` }} />
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
