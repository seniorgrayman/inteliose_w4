import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletContext";
import WalletConnectModal from "@/components/WalletConnectModal";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ManageProject from "./pages/ManageProject";
import ProjectDetail from "./pages/ProjectDetail";
import ChecklistPage from "./pages/ChecklistPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WalletProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/manage-project" element={<ManageProject />} />
              <Route path="/manage-project/:id" element={<ProjectDetail />} />
              <Route path="/manage-project/:id/checklist" element={<ChecklistPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <WalletConnectModal />
        </WalletProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
