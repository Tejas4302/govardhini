import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import SplashScreen from "./components/SplashScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import OfflineSync from "./components/OfflineSync";

import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import FarmerOnboarding from "./pages/FarmerOnboarding";
import CattleOnboarding from "./pages/CattleOnboarding";
import HealthCheck from "./pages/HealthCheck";
import MilkLogging from "./pages/MilkLogging";
import FeedRequests from "./pages/FeedRequests";
import Analytics from "./pages/Analytics";
import FarmersList from "./pages/FarmersList";
import FarmerProfile from "./pages/FarmerProfile";
import UserManagement from "./pages/UserManagement";
import RecentActivities from "./pages/RecentActivities";
import SearchFarmers from "./pages/SearchFarmers";
import SystemReports from "./pages/SystemReports";
import NotFound from "./pages/NotFound";

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
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Root: full-screen flex column, no horizontal scroll */}
        <div className="flex flex-col h-screen w-screen overflow-x-hidden">
          {/* Toasters stay fixed above content */}
          <Toaster />
          <Sonner />

          {/* Main content: grows and scrolls vertically */}
          <main className="flex-1 w-screen overflow-y-auto">
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farmer-onboarding"
                  element={
                    <ProtectedRoute>
                      <FarmerOnboarding />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cattle-onboarding"
                  element={
                    <ProtectedRoute>
                      <CattleOnboarding />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/health-check"
                  element={
                    <ProtectedRoute>
                      <HealthCheck />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/milk-logging"
                  element={
                    <ProtectedRoute>
                      <MilkLogging />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/feed-requests"
                  element={
                    <ProtectedRoute>
                      <FeedRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farmers"
                  element={
                    <ProtectedRoute>
                      <FarmersList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farmer/:farmerId"
                  element={
                    <ProtectedRoute>
                      <FarmerProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-management"
                  element={
                    <ProtectedRoute>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recent-activities"
                  element={
                    <ProtectedRoute>
                      <RecentActivities />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/search-farmers"
                  element={
                    <ProtectedRoute>
                      <SearchFarmers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/system-reports"
                  element={
                    <ProtectedRoute>
                      <SystemReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <OfflineSync />
            </BrowserRouter>
          </main>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
