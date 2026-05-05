import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AboutPage from "../pages/About/AboutPage";
import AuthPlaceholderPage from "../pages/Auth/AuthPlaceholderPage";
import DashboardPage from "../pages/MainApp/Dashboard/DashboardPage";
import Home from "../pages/Home/Home";
import ProfileSelectorPage from "../pages/MainApp/Onboarding/ProfileSelectorPage";
import ProjectWizardPage from "../pages/MainApp/Onboarding/ProjectWizardPage";
import MainLayout from "../layout/MainLayout";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<DashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<AuthPlaceholderPage type="login" />} />
          <Route path="/register" element={<AuthPlaceholderPage type="register" />} />
          <Route path="/onboarding/profile" element={<ProfileSelectorPage />} />
          <Route path="/onboarding/new-project" element={<ProjectWizardPage />} />
          <Route path="/app/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}