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
import PersonalDataPage from "./pages/PersonalDataPage";
import PropertyInfoPage from "./pages/PropertyInfoPage";
import EconomicInfoPage from "./pages/EconomicInfoPage";
import SocialInfoPage from "./pages/SocialInfoPage";
import EnvironmentalInfoPage from "./pages/EnvironmentalInfoPage";
import NotFound from "./pages/NotFound";
import ResultsPage from "./pages/ResultsPage";
import FormDebugPanel from "./components/FormDebugPanel";

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
              <Route path="/" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/form" element={<PersonalDataPage />} />
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
