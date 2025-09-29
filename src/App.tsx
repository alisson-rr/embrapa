import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FormProvider } from "@/contexts/FormContext";
import PersonalDataPage from "./pages/PersonalDataPage";
import PropertyInfoPage from "./pages/PropertyInfoPage";
import EconomicInfoPage from "./pages/EconomicInfoPage";
import SocialInfoPage from "./pages/SocialInfoPage";
import NotFound from "./pages/NotFound";
import FormDebugPanel from "./components/FormDebugPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FormProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PersonalDataPage />} />
            <Route path="/property-info" element={<PropertyInfoPage />} />
            <Route path="/economic-info" element={<EconomicInfoPage />} />
            <Route path="/social-info" element={<SocialInfoPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <FormDebugPanel />
      </TooltipProvider>
    </FormProvider>
  </QueryClientProvider>
);

export default App;
