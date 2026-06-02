import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Filter, TrendingUp, LayoutGrid, Target, Zap, Briefcase } from "lucide-react";
import { EmptyState } from "../../components/EmptyState";
import { StatsCard } from "../../components/analytics/StatsCard";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip as RechartsTooltip, Legend 
} from "recharts";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ProRadarMap } from "../../components/analytics/ProRadarMap";
import { LayoutDashboard, Map as MapIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [smartPrompt, setSmartPrompt] = useState<{ dealId: string, message: string, action: string } | null>(null);
  const [trlFilter, setTrlFilter] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'radar'>('overview');

  const isPremium = userProfile?.subscriptionStatus === 'premium';

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };

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
        message: t("dashboard.investor.smartPrompts.dueDiligence"),
        action: t("dashboard.investor.smartPrompts.sendNda")
      });
    } else if (newStatus === 'negociacao') {
        setSmartPrompt({
            dealId,
            message: t("dashboard.investor.smartPrompts.negotiation"),
            action: t("dashboard.investor.smartPrompts.requestVdr")
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

  const funnelData = COLUMNS.map(col => ({
    name: t(`dashboard.investor.funnelColumns.${col.id}`),
    value: deals.filter(d => d.status === col.id).length,
  }));

  const FUNNEL_COLORS = ['#64748b', '#3b82f6', '#f59e0b', '#a855f7', '#10b981'];

  return (
    <div className="space-y-6 md:space-y-8 flex flex-col">
      {/* Header com Abas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">{t("dashboard.investor.title")}</h1>
          <p className="text-slate-400 mt-1 text-sm">{t("dashboard.investor.subtitle")}</p>
        </div>

        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'overview' 
                ? 'bg-slate-800 text-white shadow-xl border border-slate-700' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LayoutDashboard size={14} />
            {t("dashboard.investor.pipeline")}
          </button>
          
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'radar' 
                ? 'bg-indigo-600/20 text-indigo-400 shadow-xl border border-indigo-500/30' 
                : 'text-slate-500 hover:text-indigo-400'
            }`}
          >
            <MapIcon size={14} />
            {t("dashboard.investor.radarPro")}
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard 
              label={t("dashboard.investor.inScreening")} 
              value={deals.filter(d => d.status === 'triagem').length} 
              icon={Zap} 
              color="indigo" 
            />
            <StatsCard 
              label={t("dashboard.investor.dueDiligence")} 
              value={deals.filter(d => d.status === 'due_diligence').length} 
              icon={Target} 
              color="amber" 
            />
            <StatsCard 
              label={t("dashboard.investor.closedDeals")} 
              value={deals.filter(d => d.status === 'fechado').length} 
              icon={Briefcase} 
              color="emerald" 
            />
            <StatsCard 
              label={t("dashboard.investor.avgTicket")} 
              value={t("dashboard.investor.avgTicketVal")} 
              icon={TrendingUp} 
              trend={15} 
              color="cyan" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">{t("dashboard.investor.distFunnel")}</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5">
                    <Filter size={14} className="text-slate-500" />
                    <select 
                      value={trlFilter || ""} 
                      onChange={e => setTrlFilter(e.target.value ? Number(e.target.value) : null)}
                      className="bg-transparent text-xs text-slate-300 outline-none"
                    >
                      <option value="">{t("dashboard.investor.trlAll")}</option>
                      {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{t("dashboard.investor.trlOption", { val: n })}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 h-64 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={funnelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {funnelData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4">{t("dashboard.investor.marketMatchScore")}</h3>
              <div className="flex flex-col items-center justify-center h-full pb-6">
                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-800" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-indigo-500" strokeWidth="2.5" strokeDasharray="88, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-white">88%</span>
                  </div>
                </div>
                <p className="text-center text-xs text-slate-400 leading-relaxed px-4">
                  {t("dashboard.investor.marketMatchDesc")}
                </p>
              </div>
            </div>
          </div>

          {smartPrompt && (
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-indigo-300">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span className="font-medium text-sm">{smartPrompt.message}</span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setSmartPrompt(null)} className="text-slate-400 hover:text-slate-200 px-3 py-1.5 text-xs">{t("dashboard.investor.ignore")}</button>
                <button onClick={() => setSmartPrompt(null)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-[0_0_10px_rgba(79,70,229,0.3)] transition-all">
                  {smartPrompt.action}
                </button>
              </div>
            </div>
          )}

          {/* Kanban Board */}
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            {deals.length === 0 ? (
              <div className="h-64 bg-slate-900/30 border border-slate-800 rounded-2xl flex items-center justify-center">
                <EmptyState icon={LayoutGrid} title={t("dashboard.investor.emptyTitle")} description={t("dashboard.investor.emptyDesc")} ctaLabel={t("dashboard.investor.emptyCta")} ctaLink="/explore" />
              </div>
            ) : (
              <div className="flex gap-6 min-w-max">
                {COLUMNS.map(column => {
                  const columnDeals = deals.filter(d => d.status === column.id);
                  const columnTitle = t(`dashboard.investor.funnelColumns.${column.id}`);
                  return (
                    <div key={column.id} className={`w-80 flex flex-col rounded-2xl border ${column.color} p-4`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-200 text-sm">{columnTitle}</h3>
                        <span className="bg-slate-900/50 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-md border border-slate-700/50">{columnDeals.length}</span>
                      </div>
                      <div className="space-y-3">
                        {columnDeals.map(deal => (
                          <div key={deal.id} className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 hover:border-indigo-500/50 transition-all shadow-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                                {t("dashboard.investor.fitLabel", { score: deal.score })}
                              </span>
                              <span className="text-[10px] text-slate-500">{deal.lastUpdate}</span>
                            </div>
                            <h4 className="font-bold text-slate-200 text-sm mb-3">{deal.projectName}</h4>
                            <select 
                              className="bg-slate-950 border border-slate-700 text-[11px] text-slate-300 rounded p-1.5 w-full outline-none focus:border-indigo-500"
                              value={deal.status}
                              onChange={(e) => moveDeal(deal.id, e.target.value as DealStatus)}
                            >
                              {COLUMNS.map(c => (
                                <option key={c.id} value={c.id}>
                                  {t("dashboard.investor.moveOption", { col: t(`dashboard.investor.funnelColumns.${c.id}`) })}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl">
                <Target className="text-indigo-400" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{t("dashboard.investor.geoIntel")}</h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{t("dashboard.investor.geoSub")}</p>
              </div>
            </div>
            {isPremium && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                <Zap size={12} fill="currentColor" /> {t("dashboard.investor.premiumActive")}
              </div>
            )}
          </div>
          
          <ProRadarMap 
            isPremium={isPremium} 
            onUpgradeClick={handleUpgradeClick} 
          />
        </div>
      )}
    </div>
  );
}
