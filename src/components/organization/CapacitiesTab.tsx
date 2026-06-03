import React from "react";
import { Cpu, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CapacitiesTabProps {
  labs: any[];
  newLabName: string;
  setNewLabName: (val: string) => void;
  newLabArea: string;
  setNewLabArea: (val: string) => void;
  newLabEquip: string;
  setNewLabEquip: (val: string) => void;
  handleAddLab: (e: React.FormEvent) => void;
}

export function CapacitiesTab({
  labs,
  newLabName,
  setNewLabName,
  newLabArea,
  setNewLabArea,
  newLabEquip,
  setNewLabEquip,
  handleAddLab
}: CapacitiesTabProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Active Capacities List */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="text-indigo-400" size={22} /> {t("dashboard.organization.capacities.listTitle")}
        </h2>
        <div className="space-y-4">
          {labs.map(l => (
            <div key={l.id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all space-y-3">
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-base font-bold text-white">{l.name}</h3>
                <span className="bg-indigo-500/10 text-indigo-400 text-[10px] px-2 py-1 rounded-lg border border-indigo-500/20 font-bold whitespace-nowrap">
                  {l.area}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                <strong className="text-slate-300">{t("dashboard.organization.capacities.equipment")}: </strong> 
                {l.equipment}
              </div>
              <div className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-300">Competências: </strong> 
                {l.capacity}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Capacity Panel */}
      <div>
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="text-indigo-400" size={20} /> {t("dashboard.organization.capacities.addLabBtn")}
          </h3>
          <form onSubmit={handleAddLab} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("dashboard.organization.capacities.labName")}</label>
              <input 
                type="text" 
                required 
                value={newLabName}
                onChange={e => setNewLabName(e.target.value)}
                placeholder="Ex: Laboratório de Biofotônica"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("dashboard.organization.capacities.area")}</label>
              <input 
                type="text" 
                required
                value={newLabArea}
                onChange={e => setNewLabArea(e.target.value)}
                placeholder="Ex: Biotecnologia / Saúde"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("dashboard.organization.capacities.equipment")}</label>
              <textarea 
                value={newLabEquip}
                onChange={e => setNewLabEquip(e.target.value)}
                placeholder="Ex: Microscópio Confocal, Centrífuga refrigerada"
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all resize-none"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)]"
            >
              {t("dashboard.organization.capacities.addLabBtn")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
