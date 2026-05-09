import { useAuth } from "../hooks/useAuth";
import { Menu, LogOut } from "lucide-react";

interface TopbarProps {
  onMenuToggle?: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 md:h-16 border-b border-slate-800 bg-slate-900/30 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      {/* Mobile menu button */}
      <button 
        onClick={onMenuToggle}
        className="md:hidden p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
        aria-label="Abrir menu"
      >
        <Menu size={22} />
      </button>

      {/* Spacer for desktop (left side empty) */}
      <div className="hidden md:block" />

      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-200 truncate max-w-[160px]">
              {user?.email?.split('@')[0] || "Usuário"}
            </p>
            <p className="text-xs text-slate-400 truncate max-w-[160px]">{user?.email}</p>
          </div>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold uppercase overflow-hidden text-sm">
            {user?.email ? user.email.charAt(0) : "U"}
          </div>
        </div>
        
        <div className="h-6 w-px bg-slate-800 hidden sm:block" />
        
        <button
          onClick={logout}
          className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors font-medium text-sm"
          title="Sair"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
