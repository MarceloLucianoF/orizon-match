import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAuth } from "../hooks/useAuth";
import { AlertTriangle } from "lucide-react";

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { impersonatingAdminId, setImpersonatedUid } = useAuth();

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
        {impersonatingAdminId && (
          <div className="bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-center gap-3 text-sm font-bold shadow-md z-50 animate-in slide-in-from-top">
            <AlertTriangle size={18} />
            <span>MODO SIMULAÇÃO ATIVO. Você está vendo o sistema como outro usuário.</span>
            <button 
              onClick={() => setImpersonatedUid(null)}
              className="ml-4 px-3 py-1 bg-amber-950 text-amber-500 rounded-md text-xs hover:bg-amber-900 transition-colors"
            >
              Encerrar Simulação
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