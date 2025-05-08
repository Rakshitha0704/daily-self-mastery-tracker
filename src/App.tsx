
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import DailyTasksPage from "./pages/DailyTasksPage";
import WeeklyViewPage from "./pages/WeeklyViewPage";
import ProgressDashboardPage from "./pages/ProgressDashboardPage";
import ReportPage from "./pages/ReportPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DailyTasksPage />} />
            <Route path="/weekly" element={<WeeklyViewPage />} />
            <Route path="/progress" element={<ProgressDashboardPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
