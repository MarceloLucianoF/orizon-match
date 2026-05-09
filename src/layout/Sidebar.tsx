import { LayoutDashboard, FolderKanban, Users, LogOut, MessageSquare, Building2, ShieldAlert, Gavel } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { SUPER_ADMIN_UID } from "../services/adminService";

export function Sidebar() {
  const { pathname } = useLocation();
  const { logout, user, userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin' || user?.uid === SUPER_ADMIN_UID;
  const isLegal = userProfile?.role === 'legal';

  const links = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/projects", icon: isLegal ? Gavel : FolderKanban, label: isLegal ? "Ativos de PI" : "Meus Projetos" },
    { to: "/matches", icon: Users, label: "Matches" },
    { to: "/chat", icon: MessageSquare, label: "Deal Flow" },
    { to: "/profile", icon: Building2, label: "Meu Perfil" },
  ];

  if (isAdmin) {
    links.push({ to: "/admin", icon: ShieldAlert, label: "Painel Admin" });
  }

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Orizon Match
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.to);
          const Icon = link.icon;
          
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}
