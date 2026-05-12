import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { MainLayout } from "../layout/MainLayout";
import { Login } from "../pages/auth/Login";
import { Dashboard } from "../pages/shared/Dashboard";
import { Projects } from "../pages/inventor/Projects";
import { CreateProjectWrapper } from "../pages/inventor/CreateProjectWrapper";
import { ProjectDetails } from "../pages/inventor/ProjectDetails";
import { Matches } from "../pages/shared/Matches";
import { Explore } from "../pages/shared/Explore";
import { Chat } from "../pages/shared/Chat";
import { Profile } from "../pages/shared/Profile";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { AssetRegistry } from "../pages/legal/AssetRegistry";
import OrganizationDashboard from "../pages/shared/OrganizationDashboard";
import { SUPER_ADMIN_UID } from "../services/adminService";
import Home from "../pages/marketing/Home";
import About from "../pages/marketing/About";
import PublicOnboarding from "../pages/marketing/PublicOnboarding";
import { Billing } from "../pages/billing/Billing";
import Pricing from "../pages/billing/Pricing";
import { Loader2 } from "lucide-react";

function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#020617] text-indigo-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function AdminRoute() {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  return user?.uid === SUPER_ADMIN_UID ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#020617] text-indigo-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <Routes>
      {/* Marketing / Public */}
      <Route path="/" element={<Home />} />
      <Route path="/sobre" element={<About />} />
      <Route path="/onboarding" element={<PublicOnboarding />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected App Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/app" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<CreateProjectWrapper />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/assets" element={<AssetRegistry />} />
          <Route path="/organization" element={<OrganizationDashboard />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}