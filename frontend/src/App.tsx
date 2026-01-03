import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ResumeProvider } from "@/contexts/ResumeContext";
import { VacancyProvider } from "@/contexts/VacancyContext";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/dashboard/Dashboard";
import CreateVacancy from "./pages/dashboard/CreateVacancy";
import JobSearch from "./pages/dashboard/JobSearch";
import MyApplications from "./pages/dashboard/MyApplications";
import UpdateResume from "./pages/dashboard/UpdateResume";
import OpenVacancies from "./pages/dashboard/OpenVacancies";
import ClosedVacancies from "./pages/dashboard/ClosedVacancies";
import Settings from "./pages/dashboard/Settings";
import Profile from "./pages/dashboard/Profile";
import Messages from "./pages/dashboard/Messages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/create-vacancy" element={<ProtectedRoute><CreateVacancy /></ProtectedRoute>} />
      <Route path="/dashboard/open-vacancies" element={<ProtectedRoute><OpenVacancies /></ProtectedRoute>} />
      <Route path="/dashboard/closed-vacancies" element={<ProtectedRoute><ClosedVacancies /></ProtectedRoute>} />
      <Route path="/dashboard/job-search" element={<ProtectedRoute><JobSearch /></ProtectedRoute>} />
      <Route path="/dashboard/my-applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
      <Route path="/dashboard/update-resume" element={<ProtectedRoute><UpdateResume /></ProtectedRoute>} />
      <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/dashboard/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ResumeProvider>
            <VacancyProvider>
              <AppRoutes />
            </VacancyProvider>
          </ResumeProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
