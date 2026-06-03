import { Coins, Award } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FomentoTabProps {
  fundingCalls: any[];
}

export function FomentoTab({ fundingCalls }: FomentoTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Coins className="text-amber-400" size={22} /> {t("dashboard.organization.fomento.title")}
          </h2>
          <p className="text-slate-400 text-xs mt-1">{t("dashboard.organization.fomento.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fundingCalls.map(call => (
          <div key={call.id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all flex flex-col justify-between h-[230px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 blur-[30px] rounded-full group-hover:bg-indigo-500/10 transition-all" />
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 px-2 py-1 bg-amber-400/10 rounded-lg border border-amber-400/20">
                  {call.agency}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">{t("dashboard.organization.fomento.matchScore")}:</span>
                  <span className="text-xs font-extrabold text-emerald-400">{call.matchScore}%</span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">{call.title}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">{t("dashboard.organization.fomento.fundingAgency")}</span>
                  <strong className="text-slate-200">{call.amount}</strong>
                </div>
                <div className="border-l border-slate-850 h-8" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">{t("dashboard.organization.fomento.deadline")}</span>
                  <strong className="text-slate-200">{call.deadline}</strong>
                </div>
              </div>
            </div>
            <button 
              onClick={() => alert("Candidatura ao edital iniciada!")}
              className="w-full py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all flex items-center justify-center gap-1"
            >
              <Award size={12} /> {t("dashboard.organization.fomento.applyBtn")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
