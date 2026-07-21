import { Scale, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

interface IpBalcaoTabProps {
  activePatents: any[];
  royaltyRate: number;
  setRoyaltyRate: (val: number) => void;
  allowExclusive: boolean;
  setAllowExclusive: (val: boolean) => void;
  isConfigSaving: boolean;
  handleSaveConfig: () => void;
}

export function IpBalcaoTab({
  activePatents,
  royaltyRate,
  setRoyaltyRate,
  allowExclusive,
  setAllowExclusive,
  isConfigSaving,
  handleSaveConfig
}: IpBalcaoTabProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Patents Portfolio */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Scale className="text-teal-400" size={22} /> {t("dashboard.organization.ip_balcao.patentsPortfolio")}
        </h2>
        <div className="space-y-4">
          {activePatents.map(pat => (
            <div key={pat.id} className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-3xl hover:border-slate-700 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white leading-snug">{pat.title}</h3>
                <div className="flex flex-wrap items-center gap-3 text-[10px]">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">{t("dashboard.organization.ip_balcao.inpiNumber")}: <strong className="text-slate-300 font-mono">{pat.inpi}</strong></span>
                  <div className="h-3 border-l border-slate-800/80" />
                  <span className="bg-slate-950 border border-slate-800/80 px-2 py-0.5 rounded text-slate-400 font-bold">TRL {pat.trl}</span>
                </div>
              </div>
              <span className={`text-[10px] px-3 py-1.5 rounded-full border font-bold self-start sm:self-auto ${
                pat.status === "licensingAvailable" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-blue-500/10 border-blue-500/20 text-blue-400"
              }`}>
                {t(`dashboard.organization.ip_balcao.${pat.status}`)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PI Parameters Config */}
      <div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="text-teal-400" size={20} /> {t("dashboard.organization.ip_balcao.title")}
          </h3>
          <div className="space-y-5">
            {/* Royalty slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">{t("dashboard.organization.ip_balcao.royaltyRate")}</span>
                <span className="text-teal-400 font-mono">{royaltyRate}%</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="0.5" 
                value={royaltyRate}
                onChange={e => setRoyaltyRate(Number(e.target.value))}
                className="w-full accent-teal-500 bg-slate-950 border border-slate-800 rounded-lg h-2"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                <span>1.0% Min</span>
                <span>10.0% Max</span>
              </div>
            </div>

            <div className="border-t border-slate-800/80 my-4" />

            {/* Toggles */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">{t("dashboard.organization.ip_balcao.exclusiveOption")}</span>
              <button 
                onClick={() => setAllowExclusive(!allowExclusive)}
                className={`w-11 h-6 rounded-full transition-all relative outline-none border ${
                  allowExclusive 
                    ? 'bg-teal-600 border-teal-500' 
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow transition-all ${
                  allowExclusive ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <button 
              onClick={handleSaveConfig}
              disabled={isConfigSaving}
              className="w-full mt-4 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,181,156,0.2)] flex items-center justify-center gap-2"
            >
              {isConfigSaving ? "..." : t("dashboard.organization.ip_balcao.saveConfig")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
