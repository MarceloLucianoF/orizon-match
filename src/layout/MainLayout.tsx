import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAuth } from "../hooks/useAuth";
import { AlertTriangle, ServerCog } from "lucide-react";
import { useTranslation } from "react-i18next";

export function MainLayout() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { impersonatingAdminId, setImpersonatedUid, simulatedRole, setSimulatedRole } = useAuth();

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#020617] via-[#040B1A] to-[#020617] text-slate-200 overflow-hidden font-sans">
      {/* Mobile backdrop */}
      <div 
        className={`sidebar-backdrop md:hidden ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar: hidden on mobile, visible on md+ */}
      <div className={`fixed inset-y-0 left-0 z-50 md:static md:z-auto sidebar-mobile md:!transform-none ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        {simulatedRole && (
          <div className="bg-fuchsia-600 text-white px-4 py-2 flex items-center justify-center gap-3 text-xs font-bold shadow-md z-50 animate-in slide-in-from-top">
            <ServerCog size={16} className="animate-spin" />
            <span>Visualização ativa como: <span className="uppercase font-black text-fuchsia-100">{simulatedRole}</span> (Modo de Teste Admin)</span>
            <button 
              onClick={() => setSimulatedRole(null)}
              className="ml-4 px-3 py-1 bg-slate-950/40 hover:bg-slate-950/70 border border-white/20 text-white rounded-md text-[10px] uppercase font-bold transition-colors cursor-pointer"
            >
              Voltar ao Admin
            </button>
          </div>
        )}
        {impersonatingAdminId && (
          <div className="bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-center gap-3 text-sm font-bold shadow-md z-50 animate-in slide-in-from-top">
            <AlertTriangle size={18} />
            <span>{t("common.simulationActive")}</span>
            <button 
              onClick={() => setImpersonatedUid(null)}
              className="ml-4 px-3 py-1 bg-amber-950 text-amber-500 rounded-md text-xs hover:bg-amber-900 transition-colors"
            >
              {t("common.endSimulation")}
            </button>
          </div>
        )}
        <Topbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />
        <main className="flex-1 overflow-auto custom-scrollbar">
          <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}