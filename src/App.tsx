import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FormProvider } from "@/contexts/FormContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import GeneralInfoPage from "./pages/GeneralInfoPage";
import PersonalDataPage from "./pages/PersonalDataPage";
import PropertyInfoPage from "./pages/PropertyInfoPage";
import EconomicInfoPage from "./pages/EconomicInfoPage";
import SocialInfoPage from "./pages/SocialInfoPage";
import EnvironmentalInfoPage from "./pages/EnvironmentalInfoPage";
import NotFound from "./pages/NotFound";
import ResultsPage from "./pages/ResultsPage";
import FormDebugPanel from "./components/FormDebugPanel";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import PermissionsPage from "./pages/PermissionsPage";
import { FormResponsesPage } from "./pages/FormResponsesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FormProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<GeneralInfoPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/personal-data" element={<PersonalDataPage />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/permissions" element={
                <ProtectedRoute>
                  <PermissionsPage />
                </ProtectedRoute>
              } />
              <Route path="/form-responses" element={
                <ProtectedRoute>
                  <FormResponsesPage />
                </ProtectedRoute>
              } />
              <Route path="/result/:id" element={<ResultsPage />} />
              <Route path="/property-info" element={<PropertyInfoPage />} />
              <Route path="/economic-info" element={<EconomicInfoPage />} />
              <Route path="/social-info" element={<SocialInfoPage />} />
              <Route path="/environmental-info" element={<EnvironmentalInfoPage />} />
              <Route path="/results" element={<ResultsPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FormDebugPanel />
          </BrowserRouter>
        </TooltipProvider>
      </FormProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
