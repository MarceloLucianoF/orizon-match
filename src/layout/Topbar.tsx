import { useAuth } from "../hooks/useAuth";
import { LogOut } from "lucide-react";

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/30 backdrop-blur-md flex items-center justify-end px-6 sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-200">
              {user?.email?.split('@')[0] || "Usuário"}
            </p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold uppercase overflow-hidden">
            {user?.email ? user.email.charAt(0) : "U"}
          </div>
        </div>
        
        <div className="h-6 w-px bg-slate-800"></div>
        
        <button
          onClick={logout}
          className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors font-medium text-sm"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </header>
  );
}
