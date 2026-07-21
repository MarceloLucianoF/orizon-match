import { useEffect, useState } from "react";
import { 
  Loader2, AlertCircle, Filter, TrendingUp, LayoutGrid, Target, Zap, Briefcase,
  User, Calendar, DollarSign, CheckSquare, Edit, X as XIcon, Save
} from "lucide-react";
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
import { 
  collection, query, where, onSnapshot, doc, 
  setDoc, updateDoc, getDoc, serverTimestamp 
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { logAudit, logActivity, generateUUID } from "../../services/governanceService";

type DealStatus = 'descoberta' | 'interesse' | 'nda' | 'avaliacao' | 'due_diligence' | 'comite' | 'negociacao' | 'contrato' | 'encerrado';

interface Deal {
  id: string;
  projectId: string;
  projectName: string;
  status: DealStatus;
  score: number;
  lastUpdate: string;
  companyId: string;
  ownerUserId?: string;
  nextActionDate?: string;
  probability?: number;
  ownerName?: string;
  estimatedValue?: number;
  expectedCloseDate?: string;
  nextAction?: string;
  correlationId?: string;
}

const COLUMNS: { id: DealStatus; title: string; indicatorColor: string }[] = [
  { id: 'descoberta', title: 'Descoberta', indicatorColor: 'bg-slate-500' },
  { id: 'interesse', title: 'Interesse', indicatorColor: 'bg-blue-500' },
  { id: 'nda', title: 'NDA', indicatorColor: 'bg-cyan-500' },
  { id: 'avaliacao', title: 'Análise Técnica', indicatorColor: 'bg-teal-500' },
  { id: 'due_diligence', title: 'Due Diligence', indicatorColor: 'bg-amber-500' },
  { id: 'comite', title: 'Comitê', indicatorColor: 'bg-teal-500' },
  { id: 'negociacao', title: 'Negociação', indicatorColor: 'bg-purple-500' },
  { id: 'contrato', title: 'Contrato', indicatorColor: 'bg-emerald-500' },
  { id: 'encerrado', title: 'Encerrado', indicatorColor: 'bg-rose-500' },
];

export function CompanyDashboard() {
  const { userProfile, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [smartPrompt, setSmartPrompt] = useState<{ dealId: string, message: string, action: string } | null>(null);
  const [trlFilter, setTrlFilter] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'radar'>('overview');
  const [activeMobileColumn, setActiveMobileColumn] = useState<DealStatus>('descoberta');
  
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [editOwnerName, setEditOwnerName] = useState("");
  const [editEstimatedValue, setEditEstimatedValue] = useState(0);
  const [editExpectedCloseDate, setEditExpectedCloseDate] = useState("");
  const [editProbability, setEditProbability] = useState(10);
  const [editNextAction, setEditNextAction] = useState("");

  const isPremium = userProfile?.subscriptionStatus === 'premium';

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const q = query(collection(db, "deals"), where("companyId", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      let list = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          projectId: data.projectId,
          projectName: data.projectName,
          status: (data.stage || data.status) as DealStatus,
          score: data.score || 85,
          lastUpdate: data.lastUpdate || 'Há 1 dia',
          companyId: data.companyId,
          ownerUserId: data.ownerUserId,
          nextActionDate: data.nextActionDate,
          probability: data.probability !== undefined ? data.probability : 10,
          ownerName: data.ownerName || 'Marcelo Filho',
          estimatedValue: data.estimatedValue !== undefined ? data.estimatedValue : 500000,
          expectedCloseDate: data.expectedCloseDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          nextAction: data.nextAction || 'Agendar reunião de triagem',
          correlationId: data.correlationId || generateUUID()
        } as Deal;
      });

      if (list.length === 0) {
        // Seed default deals if empty
        const defaultDeals = [
          { 
            id: `${user.uid}_p1`, 
            projectId: 'p1', 
            projectName: 'Nova Liga Metálica P/ Auto', 
            stage: 'descoberta', 
            score: 92, 
            lastUpdate: 'Há 2 horas', 
            companyId: user.uid, 
            probability: 10, 
            ownerUserId: 'inventor_rafael',
            ownerName: 'Marcelo Filho',
            estimatedValue: 250000,
            expectedCloseDate: '2026-08-15',
            nextAction: 'Agendar reunião de triagem',
            correlationId: 'seeded_corr_1_' + user.uid
          },
          { 
            id: `${user.uid}_p2`, 
            projectId: 'p2', 
            projectName: 'Sensor IoT Agrícola', 
            stage: 'avaliacao', 
            score: 85, 
            lastUpdate: 'Há 1 dia', 
            companyId: user.uid, 
            probability: 40, 
            ownerUserId: 'inventor_rafael',
            ownerName: 'Ana Costa',
            estimatedValue: 120000,
            expectedCloseDate: '2026-09-30',
            nextAction: 'Apresentar ao conselho de P&D',
            correlationId: 'seeded_corr_2_' + user.uid
          },
          { 
            id: `${user.uid}_p3`, 
            projectId: 'p3', 
            projectName: 'Plataforma de IA Jurídica', 
            stage: 'due_diligence', 
            score: 88, 
            lastUpdate: 'Há 3 dias', 
            companyId: user.uid, 
            probability: 60, 
            ownerUserId: 'inventor_rafael',
            ownerName: 'Carlos Silva',
            estimatedValue: 450000,
            expectedCloseDate: '2026-11-20',
            nextAction: 'Revisar relatório de Due Diligence',
            correlationId: 'seeded_corr_3_' + user.uid
          },
        ];
        
        try {
          await Promise.all(
            defaultDeals.map(d => setDoc(doc(db, "deals", d.id), {
              ...d,
              updatedAt: serverTimestamp()
            }))
          );
        } catch (err) {
          console.error("Erro ao semear deals:", err);
        }
      } else {
        setDeals(list);
        setLoading(false);
      }
    }, (error) => {
      console.error("Erro ao escutar deals:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const moveDeal = async (dealId: string, newStatus: DealStatus) => {
    if (!user || !userProfile) return;

    const dealDocRef = doc(db, "deals", dealId);
    try {
      const dealDoc = await getDoc(dealDocRef);
      if (!dealDoc.exists()) return;

      const beforeData = dealDoc.data();
      const oldStage = beforeData.stage || beforeData.status;

      // Update deal in Firestore
      await updateDoc(dealDocRef, {
        stage: newStatus,
        status: newStatus,
        lastUpdate: 'Atualizado agora',
        updatedAt: serverTimestamp()
      });

      // Auditing
      const actor = {
        uid: user.uid,
        name: userProfile.name || user.displayName || user.email || "Usuário",
        email: user.email || "",
        role: userProfile.role || "industry"
      };

      const correlationId = beforeData.correlationId || generateUUID();

      await logAudit(
        actor,
        "deal.stage.update",
        beforeData.projectId,
        beforeData.projectName,
        { stage: oldStage },
        { stage: newStatus },
        correlationId
      );

      await logActivity(
        "deal.stage.updated",
        actor.name,
        beforeData.projectId,
        beforeData.projectName,
        { fromStage: oldStage, toStage: newStatus },
        correlationId
      );

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

    } catch (err) {
      console.error("Erro ao mover deal:", err);
      alert("Erro ao mover o deal.");
    }
  };

  const updateDealCRM = async (
    dealId: string, 
    fields: { ownerName?: string; estimatedValue?: number; expectedCloseDate?: string; probability?: number; nextAction?: string }
  ) => {
    if (!user || !userProfile) return;

    const dealDocRef = doc(db, "deals", dealId);
    try {
      const dealDoc = await getDoc(dealDocRef);
      if (!dealDoc.exists()) return;

      const beforeData = dealDoc.data();

      await updateDoc(dealDocRef, {
        ...fields,
        lastUpdate: 'Atualizado agora',
        updatedAt: serverTimestamp()
      });

      // Auditing
      const actor = {
        uid: user.uid,
        name: userProfile.name || user.displayName || user.email || "Usuário",
        email: user.email || "",
        role: userProfile.role || "industry"
      };

      const correlationId = beforeData.correlationId || generateUUID();

      await logAudit(
        actor,
        "deal.crm.update",
        beforeData.projectId,
        beforeData.projectName,
        {
          ownerName: beforeData.ownerName || "Sem Responsável",
          estimatedValue: beforeData.estimatedValue || 0,
          expectedCloseDate: beforeData.expectedCloseDate || "",
          probability: beforeData.probability || 10,
          nextAction: beforeData.nextAction || "Nenhuma ação cadastrada"
        },
        {
          ownerName: fields.ownerName !== undefined ? fields.ownerName : (beforeData.ownerName || "Sem Responsável"),
          estimatedValue: fields.estimatedValue !== undefined ? fields.estimatedValue : (beforeData.estimatedValue || 0),
          expectedCloseDate: fields.expectedCloseDate !== undefined ? fields.expectedCloseDate : (beforeData.expectedCloseDate || ""),
          probability: fields.probability !== undefined ? fields.probability : (beforeData.probability || 10),
          nextAction: fields.nextAction !== undefined ? fields.nextAction : (beforeData.nextAction || "Nenhuma ação cadastrada")
        },
        correlationId
      );
      
      setEditingDealId(null);
    } catch (err) {
      console.error("Erro ao atualizar campos do CRM:", err);
      alert("Erro ao salvar alterações no CRM.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-teal-500" size={48} />
      </div>
    );
  }

  const funnelData = COLUMNS.map(col => ({
    name: t(`dashboard.investor.funnelColumns.${col.id}`),
    value: deals.filter(d => d.status === col.id).length,
  }));

  const FUNNEL_COLORS = [
    '#64748b', // descoberta
    '#3b82f6', // interesse
    '#06b6d4', // nda
    '#6366f1', // avaliacao
    '#f59e0b', // due_diligence
    '#d946ef', // comite
    '#a855f7', // negociacao
    '#10b981', // contrato
    '#f43f5e'  // encerrado
  ];

  return (
    <div className="space-y-6 md:space-y-8 flex flex-col">
      {/* Header com Abas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">{t("dashboard.investor.title")}</h1>
          <p className="text-slate-400 mt-1 text-sm">{t("dashboard.investor.subtitle")}</p>
        </div>

        <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 shadow-inner backdrop-blur-md">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'overview' 
                ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-[0_0_15px_rgba(0,181,156,0.35)]' 
                : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            <LayoutDashboard size={14} />
            {t("dashboard.investor.pipeline")}
          </button>
          
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'radar' 
                ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-[0_0_15px_rgba(0,181,156,0.35)]' 
                : 'text-slate-500 hover:text-teal-400'
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
              value={deals.filter(d => d.status === 'descoberta' || d.status === 'interesse' || d.status === 'nda').length} 
              icon={Zap} 
              color="teal" 
            />
            <StatsCard 
              label={t("dashboard.investor.dueDiligence")} 
              value={deals.filter(d => d.status === 'due_diligence').length} 
              icon={Target} 
              color="amber" 
            />
            <StatsCard 
              label={t("dashboard.investor.closedDeals")} 
              value={deals.filter(d => d.status === 'contrato' || d.status === 'encerrado').length} 
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

            <div className="bg-gradient-to-br from-teal-900/40 to-slate-900 border border-teal-500/20 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-teal-300 uppercase tracking-widest mb-4">{t("dashboard.investor.marketMatchScore")}</h3>
              <div className="flex flex-col items-center justify-center h-full pb-6">
                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-800" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-teal-500" strokeWidth="2.5" strokeDasharray="88, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
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
            <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-teal-300">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span className="font-medium text-sm">{smartPrompt.message}</span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setSmartPrompt(null)} className="text-slate-400 hover:text-slate-200 px-3 py-1.5 text-xs">{t("dashboard.investor.ignore")}</button>
                <button onClick={() => setSmartPrompt(null)} className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-[0_0_10px_rgba(0,181,156,0.3)] transition-all">
                  {smartPrompt.action}
                </button>
              </div>
            </div>
          )}

          {/* Kanban Board */}
          {deals.length > 0 && (
            <div className="flex sm:hidden overflow-x-auto gap-2 pb-3 mb-2 custom-scrollbar">
              {COLUMNS.map(col => {
                const count = deals.filter(d => d.status === col.id).length;
                const title = t(`dashboard.investor.funnelColumns.${col.id}`);
                const isActive = activeMobileColumn === col.id;
                
                return (
                  <button
                    key={col.id}
                    onClick={() => setActiveMobileColumn(col.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap border transition-all cursor-pointer ${
                      isActive
                        ? "bg-teal-500/10 border-teal-500/30 text-teal-400 shadow-lg"
                        : "bg-slate-900/40 border-slate-850 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {title} ({count})
                  </button>
                );
              })}
            </div>
          )}

          <div className="overflow-x-auto pb-4 custom-scrollbar">
            {deals.length === 0 ? (
              <div className="h-64 bg-slate-900/30 border border-slate-800 rounded-2xl flex items-center justify-center">
                <EmptyState icon={LayoutGrid} title={t("dashboard.investor.emptyTitle")} description={t("dashboard.investor.emptyDesc")} ctaLabel={t("dashboard.investor.emptyCta")} ctaLink="/explore" />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-6 min-w-full sm:min-w-max text-slate-200">
                {COLUMNS.map(column => {
                  const columnDeals = deals.filter(d => d.status === column.id);
                  const columnTitle = t(`dashboard.investor.funnelColumns.${column.id}`);
                  const isVisibleOnMobile = activeMobileColumn === column.id;

                  return (
                    <div 
                      key={column.id} 
                      className={`w-full sm:w-80 flex flex-col rounded-2xl border border-slate-850/60 bg-slate-900/15 p-4.5 ${
                        isVisibleOnMobile ? "flex" : "hidden sm:flex"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4.5 border-b border-slate-800/40 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${column.indicatorColor}`} />
                          <h3 className="font-bold text-slate-350 text-xs uppercase tracking-wider">{columnTitle}</h3>
                        </div>
                        <span className="bg-slate-950 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded border border-slate-800/80">{columnDeals.length}</span>
                      </div>
                      <div className="space-y-3.5">
                        {columnDeals.map(deal => {
                          const isEditing = editingDealId === deal.id;

                          if (isEditing) {
                            return (
                              <div key={deal.id} className="bg-slate-950 border border-teal-500/35 rounded-xl p-4.5 transition-all shadow-2xl shadow-teal-500/5 space-y-3.5">
                                <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">Editar CRM</div>
                                
                                <div className="space-y-1">
                                  <label className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Responsável</label>
                                  <input 
                                    type="text" 
                                    value={editOwnerName} 
                                    onChange={e => setEditOwnerName(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 text-xs text-slate-200 rounded-xl p-2.5 w-full outline-none transition-all"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Valor Estimado (R$)</label>
                                  <input 
                                    type="number" 
                                    value={editEstimatedValue} 
                                    onChange={e => setEditEstimatedValue(Number(e.target.value))}
                                    className="bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 text-xs text-slate-200 rounded-xl p-2.5 w-full outline-none transition-all"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Probabilidade (%)</label>
                                    <input 
                                      type="number" 
                                      min="0" 
                                      max="100" 
                                      value={editProbability} 
                                      onChange={e => setEditProbability(Number(e.target.value))}
                                      className="bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 text-xs text-slate-200 rounded-xl p-2.5 w-full outline-none transition-all"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Data Prevista</label>
                                    <input 
                                      type="date" 
                                      value={editExpectedCloseDate} 
                                      onChange={e => setEditExpectedCloseDate(e.target.value)}
                                      className="bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 text-xs text-slate-200 rounded-xl p-2.5 w-full outline-none transition-all"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Próxima Ação</label>
                                  <input 
                                    type="text" 
                                    value={editNextAction} 
                                    onChange={e => setEditNextAction(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 text-xs text-slate-200 rounded-xl p-2.5 w-full outline-none transition-all"
                                  />
                                </div>

                                <div className="flex gap-2 justify-end pt-2 border-t border-slate-800">
                                  <button 
                                    onClick={() => setEditingDealId(null)} 
                                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-450 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    <XIcon size={12} /> Cancelar
                                  </button>
                                  <button 
                                    onClick={() => updateDealCRM(deal.id, {
                                      ownerName: editOwnerName,
                                      estimatedValue: editEstimatedValue,
                                      expectedCloseDate: editExpectedCloseDate,
                                      probability: editProbability,
                                      nextAction: editNextAction
                                    })}
                                    className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 px-3.5 py-1.5 rounded-lg text-[10px] font-bold text-white transition-all flex items-center gap-1 shadow-md shadow-teal-650/20 active:scale-95 cursor-pointer"
                                  >
                                    <Save size={12} /> Salvar
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={deal.id} className="bg-slate-950/50 border border-slate-850/80 hover:border-teal-500/25 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-300 rounded-xl p-4.5 flex flex-col gap-3 group relative backdrop-blur-sm shadow-sm">
                              {/* Edit Button overlay on hover */}
                              <button 
                                onClick={() => {
                                  setEditingDealId(deal.id);
                                  setEditOwnerName(deal.ownerName || "Marcelo Filho");
                                  setEditEstimatedValue(deal.estimatedValue || 500000);
                                  setEditExpectedCloseDate(deal.expectedCloseDate || "");
                                  setEditProbability(deal.probability !== undefined ? deal.probability : 10);
                                  setEditNextAction(deal.nextAction || "Agendar reunião de triagem");
                                }}
                                className="absolute top-3 right-3 p-1.5 rounded bg-slate-800 border border-slate-705 text-slate-400 hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-sm"
                                title="Editar CRM"
                              >
                                <Edit size={12} />
                              </button>

                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                                  {t("dashboard.investor.fitLabel", { score: deal.score })}
                                </span>
                                <span className="text-[10px] text-slate-500 pr-6 group-hover:pr-0 transition-all">{deal.lastUpdate}</span>
                              </div>

                              <div>
                                <h4 className="font-bold text-slate-200 text-sm leading-tight tracking-tight">{deal.projectName}</h4>
                              </div>

                              {/* CRM Metric grid */}
                              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-2.5 border-t border-slate-805 text-[10px]">
                                <div className="flex items-center gap-1 text-slate-400">
                                  <DollarSign size={11} className="text-emerald-500" />
                                  <span className="font-semibold text-slate-200">
                                    {deal.estimatedValue ? `R$ ${deal.estimatedValue.toLocaleString("pt-BR")}` : "R$ 500.000"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-400 justify-end">
                                  <TrendingUp size={11} className="text-teal-400" />
                                  <span className="font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                                    {deal.probability !== undefined ? deal.probability : 10}%
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-400">
                                  <User size={11} className="text-slate-500" />
                                  <span className="truncate max-w-[80px]" title={deal.ownerName || "Marcelo Filho"}>
                                    {deal.ownerName || "Marcelo Filho"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-400 justify-end">
                                  <Calendar size={11} className="text-slate-500" />
                                  <span>{deal.expectedCloseDate || "Sem data"}</span>
                                </div>
                              </div>

                              {/* Next action callout */}
                              <div className="bg-slate-950/80 border border-slate-850 rounded-lg p-2 flex items-start gap-1.5">
                                <CheckSquare size={11} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                <div className="flex flex-col text-[10px]">
                                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5">Próxima Ação</span>
                                  <span className="text-slate-300 leading-tight truncate max-w-[170px]" title={deal.nextAction || "Agendar reunião de triagem"}>
                                    {deal.nextAction || "Agendar reunião de triagem"}
                                  </span>
                                </div>
                              </div>

                              <select 
                                className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-355 rounded-lg p-2 w-full outline-none focus:border-teal-500 mt-1 cursor-pointer transition-all hover:bg-slate-900"
                                value={deal.status}
                                onChange={(e) => moveDeal(deal.id, e.target.value as DealStatus)}
                              >
                                {COLUMNS.map(c => (
                                  <option key={c.id} value={c.id} className="bg-slate-950 text-slate-300">
                                    {t("dashboard.investor.moveOption", { col: t(`dashboard.investor.funnelColumns.${c.id}`) })}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
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
              <div className="p-3 bg-teal-500/10 rounded-xl">
                <Target className="text-teal-400" size={20} />
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
