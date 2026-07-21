import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
import { useAuth } from "../hooks/useAuth";
import { MainLayout } from "../layout/MainLayout";
import { Loader2 } from "lucide-react";

// Lazy-loaded components
const Login = lazy(() => import("../pages/auth/Login").then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import("../pages/shared/Dashboard").then(m => ({ default: m.Dashboard })));
const Projects = lazy(() => import("../pages/inventor/Projects").then(m => ({ default: m.Projects })));
const CreateProjectWrapper = lazy(() => import("../pages/inventor/CreateProjectWrapper").then(m => ({ default: m.CreateProjectWrapper })));
const ProjectDetails = lazy(() => import("../pages/inventor/ProjectDetails").then(m => ({ default: m.ProjectDetails })));
const Matches = lazy(() => import("../pages/shared/Matches").then(m => ({ default: m.Matches })));
const Explore = lazy(() => import("../pages/shared/Explore").then(m => ({ default: m.Explore })));
const Chat = lazy(() => import("../pages/shared/Chat").then(m => ({ default: m.Chat })));
const Profile = lazy(() => import("../pages/shared/Profile").then(m => ({ default: m.Profile })));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AssetRegistry = lazy(() => import("../pages/legal/AssetRegistry").then(m => ({ default: m.AssetRegistry })));
const OrganizationDashboard = lazy(() => import("../pages/shared/OrganizationDashboard"));
const Home = lazy(() => import("../pages/marketing/Home"));
const About = lazy(() => import("../pages/marketing/About"));
const PublicOnboarding = lazy(() => import("../pages/marketing/PublicOnboarding"));
const Billing = lazy(() => import("../pages/billing/Billing").then(m => ({ default: m.Billing })));
const Pricing = lazy(() => import("../pages/billing/Pricing"));
import { SUPER_ADMIN_UID } from "../services/adminService";

function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#020617] text-teal-500">
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
      <div className="h-screen w-screen flex items-center justify-center bg-[#020617] text-teal-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-[#020617] text-teal-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    }>
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
    </Suspense>
  );
}