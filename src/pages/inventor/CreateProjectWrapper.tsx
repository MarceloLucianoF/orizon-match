import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { CreateProjectInventor } from "./CreateProjectInventor";
import { CreateProjectICT } from "./CreateProjectICT";
import { CreateProjectCompany } from "./CreateProjectCompany";

export function CreateProjectWrapper() {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-indigo-500">Carregando...</div>;
  }

  if (!userProfile) {
    return <Navigate to="/onboarding" replace />;
  }

  // Route based on user role
  if (userProfile.role === 'ict') {
    return <CreateProjectICT />;
  }
  
  if (userProfile.role === 'company' || userProfile.role === 'provider') {
    return <CreateProjectCompany />;
  }

  // Default to Inventor for 'idea' or 'user' or 'inventor'
  return <CreateProjectInventor />;
}
