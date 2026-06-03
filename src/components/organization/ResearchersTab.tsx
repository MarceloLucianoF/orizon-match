import { GraduationCap, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ResearchersTabProps {
  researchersSearch: string;
  setResearchersSearch: (val: string) => void;
  filteredResearchers: any[];
}

export function ResearchersTab({
  researchersSearch,
  setResearchersSearch,
  filteredResearchers
}: ResearchersTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="text-indigo-400" size={24} /> {t("dashboard.organization.researchers.title")}
          </h2>
          <p className="text-slate-400 text-xs mt-1">{t("dashboard.organization.researchers.subtitle")}</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            value={researchersSearch}
            onChange={e => setResearchersSearch(e.target.value)}
            placeholder={t("dashboard.organization.researchers.searchPlaceholder")}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResearchers.map(r => (
          <div key={r.id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all flex flex-col justify-between gap-5 relative group">
            <div className="flex items-start gap-4">
              <img 
                src={r.image} 
                alt={r.name} 
                className="w-12 h-12 rounded-xl object-cover border border-slate-800"
              />
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{r.name}</h3>
                <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">{r.title}</p>
                <div className="flex gap-2.5 mt-2">
                  <span className="text-[9px] bg-slate-950 border border-slate-855 px-2 py-0.5 rounded text-slate-400">
                    {t("dashboard.organization.researchers.hindex")}: <strong>{r.hIndex}</strong>
                  </span>
                  <span className="text-[9px] bg-slate-950 border border-slate-855 px-2 py-0.5 rounded text-slate-400">
                    {t("dashboard.organization.researchers.patents")}: <strong>{r.patents}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                <strong className="text-slate-300">Expertise: </strong> {r.expertise}
              </div>
              <div className="flex justify-between items-center text-[10px] p-2.5 bg-slate-950/50 rounded-xl border border-slate-850">
                <span className="text-slate-400">{t("dashboard.organization.researchers.compat")}:</span>
                <strong className="text-emerald-400 font-extrabold">{r.compatibility}%</strong>
              </div>
            </div>

            <button 
              onClick={() => alert("Pesquisador alocado para novo edital!")}
              className="w-full py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all"
            >
              {t("dashboard.organization.researchers.assignBtn")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
