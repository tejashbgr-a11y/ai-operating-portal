import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import HomePage from "@/pages/HomePage";
import LanePage from "@/pages/LanePage";
import AdminPage from "@/pages/AdminPage";
import WeeklyDigestPage from "@/pages/WeeklyDigestPage";
import ForYouPage from "@/pages/ForYouPage";
import SavedPage from "@/pages/SavedPage";
import LikedPage from "@/pages/LikedPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/for-you" element={<ForYouPage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/liked" element={<LikedPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/weekly-digest" element={<WeeklyDigestPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/:lane" element={<LanePage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
