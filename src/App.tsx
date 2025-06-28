
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import FarmerOnboarding from "./pages/FarmerOnboarding";
import CattleOnboarding from "./pages/CattleOnboarding";
import HealthCheck from "./pages/HealthCheck";
import MilkLogging from "./pages/MilkLogging";
import FeedRequests from "./pages/FeedRequests";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import OfflineSync from "./components/OfflineSync";
import Index from "./pages/Index";
import FarmersList from "./pages/FarmersList";
import FarmerProfile from "./pages/FarmerProfile";
import UserManagement from "./pages/UserManagement";
import RecentActivities from "./pages/RecentActivities";
import SearchFarmers from "./pages/SearchFarmers";
import SystemReports from "./pages/SystemReports";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reduced splash screen duration for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="w-full max-w-full overflow-x-hidden">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/farmer-onboarding" element={<FarmerOnboarding />} />
              <Route path="/cattle-onboarding" element={<CattleOnboarding />} />
              <Route path="/health-check" element={<HealthCheck />} />
              <Route path="/milk-logging" element={<MilkLogging />} />
              <Route path="/feed-requests" element={<FeedRequests />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/farmers" element={<FarmersList />} />
              <Route path="/farmer/:farmerId" element={<FarmerProfile />} />
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="/recent-activities" element={<RecentActivities />} />
              <Route path="/search-farmers" element={<SearchFarmers />} />
              <Route path="/system-reports" element={<SystemReports />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <OfflineSync />
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
