import { useAuth } from "../../hooks/useAuth";
import { InventorDashboard } from "../inventor/InventorDashboard";
import { CompanyDashboard } from "../company/CompanyDashboard";
import { AdminDashboard } from "../admin/AdminDashboard";
import { LegalDashboard } from "../legal/LegalDashboard";
import OrganizationDashboard from "./OrganizationDashboard";
import { Loader2 } from "lucide-react";

export function Dashboard() {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Se o perfil ainda está carregando ou não tem role definido, podemos mostrar um loading
  // ou assumir um padrão. Vamos mostrar loading até ter certeza.
  if (userProfile === undefined) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
        </div>
      );
  }

  // Empresa ou Investidor veem o Deal Flow CRM
  if (userProfile?.role === 'industry' || userProfile?.role === 'investor') {
    return <CompanyDashboard />;
  }

  // Admin vê a Torre de Controle
  if (userProfile?.role === 'admin') {
    return <AdminDashboard />;
  }

  // ICT vê o Hub de Organização/Fomento
  if (userProfile?.role === 'ict') {
    return <OrganizationDashboard />;
  }

  // Jurídico vê a Gestão de Ativos de PI
  if (userProfile?.role === 'legal') {
    return <LegalDashboard />;
  }

  // Inventor ou Prestador veem o Dashboard de Performance
  return <InventorDashboard />;
}
