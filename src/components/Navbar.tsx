type UserRole = "user" | "company" | "admin";

interface NavbarUser {
  displayName?: string;
  role?: UserRole;
}

interface NavbarProps {
  user?: NavbarUser | null;
  currentPath?: string;
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
}

interface NavItem {
  label: string;
  to: string;
  publicOnly?: boolean;
  authOnly?: boolean;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Sobre", to: "/about" },
  { label: "Entrar", to: "/login", publicOnly: true },
  { label: "Cadastrar", to: "/register", publicOnly: true },
  { label: "Dashboard", to: "/app/dashboard", authOnly: true },
  { label: "Novo Projeto", to: "/app/new-project", authOnly: true, roles: ["user"] },
  { label: "Meu Perfil", to: "/app/profile", authOnly: true, roles: ["user"] },
  { label: "Conexoes", to: "/app/match-history", authOnly: true, roles: ["user"] },
  { label: "Projetos Recebidos", to: "/app/company-projects", authOnly: true, roles: ["company"] },
  { label: "Portal da Empresa", to: "/app/company-dashboard", authOnly: true, roles: ["company"] },
  { label: "Painel Admin", to: "/app/admin-panel", authOnly: true, roles: ["admin"] },
  { label: "Gerenciar Usuarios", to: "/app/users-management", authOnly: true, roles: ["admin"] },
  { label: "Financas", to: "/app/finance", authOnly: true, roles: ["admin"] },
];

function canRender(item: NavItem, user?: NavbarUser | null): boolean {
  if (item.publicOnly) {
    return !user;
  }

  if (item.authOnly && !user) {
    return false;
  }

  if (item.roles && item.roles.length > 0) {
    return Boolean(user?.role && item.roles.includes(user.role));
  }

  return true;
}

function getItemClass(itemPath: string, currentPath: string): string {
  const isActive = currentPath === itemPath;

  if (isActive) {
    return "rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary";
  }

  return "rounded-xl px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface2/80 hover:text-text";
}

export default function Navbar({
  user,
  currentPath = "/",
  onNavigate,
  onLogout,
}: NavbarProps) {
  const renderedItems = NAV_ITEMS.filter((item) => canRender(item, user));

  return (
    <nav className="sticky top-0 z-40 border-b border-border/80 bg-bg/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <button
          type="button"
          className="rounded-2xl bg-orizon-gradient px-4 py-2 text-left text-white shadow-glow"
          onClick={() => onNavigate?.("/")}
        >
          <span className="block text-xs uppercase tracking-[0.22em] text-cyan-100">Orizon</span>
          <span className="text-lg font-semibold leading-tight">Match</span>
        </button>

        <ul className="flex flex-wrap items-center gap-2">
          {renderedItems.map((item) => (
            <li key={item.to}>
              <button
                type="button"
                className={getItemClass(item.to, currentPath)}
                onClick={() => onNavigate?.(item.to)}
              >
                {item.label}
              </button>
            </li>
          ))}

          {user && (
            <li>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-200 dark:hover:bg-rose-500/10"
              >
                Sair
              </button>
            </li>
          )}
        </ul>

      </div>
    </nav>
  );
}
