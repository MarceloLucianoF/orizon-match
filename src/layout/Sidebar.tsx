import { LayoutDashboard, FolderKanban, Users, LogOut, MessageSquare, Building2, ShieldAlert, Gavel, Compass, X, ServerCog } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout, userProfile, simulatedRole, setSimulatedRole, isActualAdmin } = useAuth();
  const { t } = useTranslation();
  
  const currentRole = userProfile?.role || 'inventor';

  // Define sidebar links dynamically per role
  let links: { to: string; icon: any; label: string }[] = [];

  if (currentRole === 'admin') {
    links = [
      { to: "/admin", icon: ShieldAlert, label: t("sidebar.adminpanel") || "Painel Admin" },
    ];
  } else if (currentRole === 'ict') {
    links = [
      { to: "/dashboard", icon: LayoutDashboard, label: "Polo Dashboard" },
      { to: "/projects", icon: FolderKanban, label: "Portfólio do Polo" },
      { to: "/assets", icon: Gavel, label: "Patentes & PI" },
      { to: "/explore", icon: Compass, label: "Explorar Radar" },
      { to: "/matches", icon: Users, label: "Matches" },
      { to: "/chat", icon: MessageSquare, label: "Mensagens" },
      { to: "/profile", icon: Building2, label: "Perfil do Polo" },
    ];
  } else if (currentRole === 'investor' || currentRole === 'industry') {
    links = [
      { to: "/dashboard", icon: LayoutDashboard, label: "CRM Pipeline" },
      { to: "/explore", icon: Compass, label: "Explorar Radar" },
      { to: "/matches", icon: Users, label: "Matches" },
      { to: "/chat", icon: MessageSquare, label: "Negociações" },
      { to: "/profile", icon: Building2, label: "Perfil Corporativo" },
    ];
  } else {
    // Default (inventor)
    links = [
      { to: "/dashboard", icon: LayoutDashboard, label: t("sidebar.dashboard") },
      { to: "/projects", icon: FolderKanban, label: t("sidebar.projects") },
      { to: "/assets", icon: Gavel, label: t("sidebar.assets") },
      { to: "/explore", icon: Compass, label: t("sidebar.explore") },
      { to: "/matches", icon: Users, label: t("sidebar.matches") },
      { to: "/chat", icon: MessageSquare, label: t("sidebar.dealflow") },
      { to: "/profile", icon: Building2, label: t("sidebar.profile") },
    ];
  }

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className="w-[19rem] xl:w-[21rem] border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col h-full shrink-0">
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

      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {/* Visualization Switcher for Admins */}
        {isActualAdmin && (
          <div className="mb-6 px-3">
            <p className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <ServerCog size={12} className="animate-spin" /> Modo de Visualização
            </p>
            <select
              value={simulatedRole || "admin"}
              onChange={(e) => {
                const selected = e.target.value;
                setSimulatedRole(selected === "admin" ? null : selected);
                if (selected === "admin") {
                  navigate("/admin");
                } else {
                  navigate("/dashboard");
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-fuchsia-500 transition-all font-semibold"
            >
              <option value="admin">Administrador (Padrão)</option>
              <option value="inventor">Inventor</option>
              <option value="ict">ICT / NIT</option>
              <option value="investor">Investidor (VC)</option>
              <option value="industry">Indústria</option>
            </select>
          </div>
        )}

        {/* User Workspace */}
        <div className="mb-6">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t("sidebar.workspace")}</p>
          <div className="space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.to || (link.to !== '/dashboard' && pathname.startsWith(link.to));
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 min-w-0 ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <Icon size={20} />
                  <span className="min-w-0 font-medium text-sm leading-tight whitespace-normal break-words">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Admin Workspace fallback/quick link */}
        {isActualAdmin && currentRole !== 'admin' && (
          <div className="pt-4 border-t border-slate-800">
            <p className="px-3 text-[10px] font-bold text-fuchsia-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShieldAlert size={12} className="animate-pulse" /> {t("sidebar.admin")}
            </p>
            <div className="space-y-1">
              <Link
                to="/admin"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 min-w-0 ${
                  pathname.startsWith('/admin')
                      ? "bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20 shadow-[0_0_15px_rgba(217,70,239,0.1)]"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                }`}
              >
                <ShieldAlert size={20} />
                  <span className="min-w-0 font-medium text-sm leading-tight whitespace-normal break-words">{t("sidebar.adminpanel")}</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => { logout(); handleLinkClick(); }}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">{t("sidebar.logout")}</span>
        </button>
      </div>
    </aside>
  );
}
