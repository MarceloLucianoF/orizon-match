import { LayoutDashboard, FolderKanban, Users, LogOut, MessageSquare, Building2, ShieldAlert, Gavel, Compass, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { SUPER_ADMIN_UID } from "../services/adminService";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { pathname } = useLocation();
  const { logout, user, userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin' || user?.uid === SUPER_ADMIN_UID;


  const links = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/projects", icon: FolderKanban, label: "Meus Projetos" },
    { to: "/assets", icon: Gavel, label: "Ativos de PI" },
    { to: "/explore", icon: Compass, label: "Explorar" },
    { to: "/matches", icon: Users, label: "Matches" },
    { to: "/chat", icon: MessageSquare, label: "Deal Flow" },
    { to: "/profile", icon: Building2, label: "Meu Perfil" },
  ];

  if (isAdmin) {
    links.push({ to: "/admin", icon: ShieldAlert, label: "Painel Admin" });
  }

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Orizon Match
        </h1>
        {/* Close button visible only on mobile */}
        <button 
          onClick={onClose}
          className="md:hidden p-1 text-slate-400 hover:text-white transition-colors"
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {links.map((link) => {
          const isActive = pathname === link.to || (link.to !== '/dashboard' && pathname.startsWith(link.to));
          const Icon = link.icon;
          
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => { logout(); handleLinkClick(); }}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Sair</span>
        </button>
      </div>
    </aside>
  );
}
