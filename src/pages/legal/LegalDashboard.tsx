import { useState, useEffect } from "react";
import { 
  Shield, Gavel, Search, 
  Loader2, Clock, FileCheck
} from "lucide-react";
import { useTranslation } from "react-i18next";

type IPStatus = 'analise' | 'redacao' | 'protocolo' | 'acompanhamento';

interface IPAsset {
  id: string;
  projectName: string;
  status: IPStatus;
  clientName: string;
  lastUpdate: string;
  inpiNumber?: string;
}

const COLUMNS: { id: IPStatus; color: string }[] = [
  { id: 'analise', color: 'border-slate-700 bg-slate-800/30' },
  { id: 'redacao', color: 'border-blue-500/30 bg-blue-500/10' },
  { id: 'protocolo', color: 'border-amber-500/30 bg-amber-500/10' },
  { id: 'acompanhamento', color: 'border-emerald-500/30 bg-emerald-500/10' },
];

export function LegalDashboard() {
  const { t } = useTranslation();
  const [assets, setAssets] = useState<IPAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dados demonstrativos - em produção, busca da collection "legal_invites" + "projects"
    setTimeout(() => {
      setAssets([
        { id: '1', projectName: 'Nova Liga Metálica', status: 'analise', clientName: 'João Silva', lastUpdate: '1' },
        { id: '2', projectName: 'Sensor IoT Agrícola', status: 'redacao', clientName: 'TechAgro Ltda', lastUpdate: '4' },
        { id: '3', projectName: 'Plataforma IA Jurídica', status: 'protocolo', clientName: 'Dr. Pedro', lastUpdate: '3', inpiNumber: 'BR 10 2024 001234-5' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const moveAsset = (id: string, newStatus: IPStatus) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const formatLastUpdate = (val: string) => {
    if (val === '1') return t("dashboard.legal.yesterday");
    if (val === '4') return t("dashboard.investor.fitLabel", { score: 85 }).replace("% FIT", "h"); // simple fallback or customize
    return `${val}d`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-teal-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Gavel className="text-teal-400" size={24} /> {t("dashboard.legal.title")}
          </h1>
          <p className="text-slate-400 mt-1 text-sm">{t("dashboard.legal.subtitle")}</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-teal-600 hover:bg-teal-500 text-white px-4 md:px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(0,181,156,0.3)] flex items-center gap-2 text-xs md:text-sm">
            <Search size={16} /> {t("dashboard.legal.monitorInpiBtn")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 flex-1 min-h-0">
        <div className="lg:col-span-3 flex flex-col min-h-0">
           {/* Kanban Board */}
          <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex gap-4 md:gap-6 h-full min-w-max">
              {COLUMNS.map(column => {
                const columnAssets = assets.filter(a => a.status === column.id);
                return (
                  <div key={column.id} className={`w-60 md:w-72 flex flex-col rounded-2xl border ${column.color} p-3 md:p-4`}>
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <h3 className="font-bold text-slate-200 text-xs md:text-sm uppercase tracking-wider">{t("dashboard.legal.columns." + column.id)}</h3>
                      <span className="bg-slate-900/50 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-md border border-slate-700/50">
                        {columnAssets.length}
                      </span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                      {columnAssets.map(asset => (
                        <div key={asset.id} className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 md:p-4 hover:border-teal-500/50 transition-all shadow-lg">
                          <h4 className="font-bold text-slate-100 text-sm mb-1">{asset.projectName}</h4>
                          <p className="text-[11px] text-slate-500 mb-3">{t("dashboard.legal.clientLabel", { name: asset.clientName })}</p>
                          
                          {asset.inpiNumber && (
                            <div className="bg-slate-950 px-2 py-1.5 rounded border border-slate-800 text-[10px] text-slate-400 font-mono mb-3">
                              {asset.inpiNumber}
                            </div>
                          )}

                          <div className="flex items-center justify-between border-t border-slate-800 pt-3 gap-2">
                             <span className="text-[10px] text-slate-600 flex items-center gap-1 flex-shrink-0">
                               <Clock size={10} /> {formatLastUpdate(asset.lastUpdate)}
                             </span>
                             <select 
                                className="bg-slate-950 border border-slate-700 text-[10px] text-slate-400 rounded p-1 outline-none focus:border-teal-400 min-w-0"
                                value={asset.status}
                                onChange={(e) => moveAsset(asset.id, e.target.value as IPStatus)}
                             >
                                 {COLUMNS.map(c => (
                                     <option key={c.id} value={c.id}>
                                       {t("dashboard.legal.columns." + c.id)}
                                     </option>
                                 ))}
                             </select>
                          </div>
                        </div>
                      ))}
                      
                      {columnAssets.length === 0 && (
                        <div className="h-24 border-2 border-dashed border-slate-700/30 rounded-xl flex items-center justify-center text-slate-600 text-xs italic">
                          {t("dashboard.legal.noProjects")}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Shield className="text-emerald-400" size={16} /> {t("dashboard.legal.inpiMonitorTitle")}
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-teal-400">PUBLICACAO</span>
                  <span className="text-[10px] text-slate-600">{t("dashboard.legal.today")}</span>
                </div>
                <p className="text-xs text-slate-300">{t("dashboard.legal.updateExame")}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-amber-400">EXIGENCIA</span>
                  <span className="text-[10px] text-slate-600">{t("dashboard.legal.yesterday")}</span>
                </div>
                <p className="text-xs text-slate-300">{t("dashboard.legal.updateExigencia")}</p>
              </div>
            </div>
            <button className="w-full mt-4 text-[10px] font-bold text-slate-500 hover:text-slate-300 transition uppercase tracking-widest">
              {t("dashboard.legal.viewAllUpdates")}
            </button>
          </div>

          <div className="bg-gradient-to-br from-teal-900/20 to-slate-900 border border-teal-500/20 rounded-2xl p-4 md:p-6">
            <h3 className="text-sm font-bold text-teal-300 mb-2 flex items-center gap-2">
              <FileCheck size={16} /> {t("dashboard.legal.curatorOpportunities")}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {t("dashboard.legal.opportunitiesDesc", { count: 4, sector: "Agroindústria" })}
            </p>
            <button className="w-full bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 py-2.5 rounded-lg text-xs font-bold transition">
              {t("dashboard.legal.proposeConsultancy")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
