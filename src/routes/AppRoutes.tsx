import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { MainLayout } from "../layout/MainLayout";
import { Login } from "../pages/Login";
import { Dashboard } from "../pages/Dashboard";
import { Projects } from "../pages/Projects";
import { CreateProject } from "../pages/CreateProject";
import { Matches } from "../pages/Matches";
import { Chat } from "../pages/Chat";
import Home from "../pages/marketing/Home";
import About from "../pages/marketing/About";
import PublicOnboarding from "../pages/marketing/PublicOnboarding";
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
      <Route path="/login" element={<Login />} />
      
      {/* Protected App Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/app" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<CreateProject />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/chat" element={<Chat />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}