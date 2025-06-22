
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

interface UserData {
  id: string;
  email?: string;
  phone?: string;
  role: string;
  name: string;
}

interface DashboardStats {
  totalFarmers: number;
  totalCattle: number;
  todayMilk: number;
  healthAlerts: number;
  pendingApprovals: number;
}

const Dashboard = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalFarmers: 0,
    totalCattle: 0,
    todayMilk: 0,
    healthAlerts: 0,
    pendingApprovals: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('govardhini_user');
    if (!userData) {
      navigate('/auth');
      return;
    }
    setUser(JSON.parse(userData));
    fetchDashboardStats();
  }, [navigate]);

  // Auto-refresh when navigating to dashboard
  useEffect(() => {
    if (location.pathname === '/dashboard' && user) {
      fetchDashboardStats();
    }
  }, [location.pathname, user]);

  // Auto-refresh when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchDashboardStats();
      }
    };

    document.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  const fetchDashboardStats = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      const [farmersResult, cattleResult, milkResult, healthResult, pendingUsersResult] = await Promise.all([
        supabase.from('farmers').select('id', { count: 'exact' }),
        supabase.from('cattle_profiles').select('id', { count: 'exact' }),
        supabase.from('milk_production').select('quantity_litres').eq('date', today),
        supabase.from('health_checkups').select('id', { count: 'exact' }).not('issue', 'is', null),
        supabase.from('users').select('id', { count: 'exact' }).eq('status', 'pending')
      ]);

      const todayMilk = milkResult.data?.reduce((sum, record) => sum + (record.quantity_litres || 0), 0) || 0;

      setStats({
        totalFarmers: farmersResult.count || 0,
        totalCattle: cattleResult.count || 0,
        todayMilk: Math.round(todayMilk * 100) / 100,
        healthAlerts: healthResult.count || 0,
        pendingApprovals: pendingUsersResult.count || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchDashboardStats(true);
  };

  const handleMetricClick = (metric: string) => {
    switch (metric) {
      case 'farmers':
        navigate('/farmers');
        break;
      case 'cattle':
        navigate('/farmers'); // Will show all farmers with their cattle
        break;
      case 'milk':
        navigate('/milk-logging');
        break;
      case 'health':
        navigate('/health-check');
        break;
      case 'approvals':
        navigate('/user-management');
        break;
    }
  };

  if (!user) return null;

  const getQuickActions = () => {
    const baseActions = [
      { title: 'Farmers Directory', desc: 'View all farmers & profiles', icon: '👨‍🌾', path: '/farmers', gradient: 'from-emerald-500 to-green-600' },
      { title: 'Farmer Registration', desc: 'Register new farmers', icon: '➕', path: '/farmer-onboarding', gradient: 'from-green-500 to-emerald-600' },
      { title: 'SMS Notifications', desc: 'View & manage SMS communications', icon: '📱', path: '/sms-notifications', gradient: 'from-blue-500 to-cyan-600' },
      { title: 'Recent Activities', desc: 'View latest system activities', icon: '📊', path: '/recent-activities', gradient: 'from-purple-500 to-indigo-600' },
      { title: 'Search Farmers', desc: 'Advanced farmer search & filtering', icon: '🔍', path: '/search-farmers', gradient: 'from-amber-500 to-orange-600' },
    ];

    if (user.role === 'admin' || user.role === 'office_staff') {
      baseActions.push(
        { title: 'User Management', desc: 'Approve pending users', icon: '👤', path: '/user-management', gradient: 'from-purple-500 to-indigo-600' },
        { title: 'System Reports', desc: 'Generate & download reports', icon: '📋', path: '/system-reports', gradient: 'from-red-500 to-pink-600' },
        { title: 'Analytics', desc: 'View reports & charts', icon: '📈', path: '/analytics', gradient: 'from-indigo-500 to-purple-600' }
      );
    }

    return baseActions;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation user={user} />
      
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10 px-4 py-6">
        <div className="container mx-auto">
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <Button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="glass-button flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-4 py-2 rounded-full">
                {user.role.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-6 animate-slide-up">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card 
              className="metric-card text-white border-0 animate-fade-in cursor-pointer hover:scale-105 transition-transform" 
              style={{animationDelay: '0.1s'}}
              onClick={() => handleMetricClick('farmers')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm font-medium">Total Farmers</p>
                    <p className="text-3xl font-bold mt-2">{isLoading ? '...' : stats.totalFarmers}</p>
                  </div>
                  <div className="text-4xl opacity-80">👨‍🌾</div>
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="metric-card text-white border-0 animate-fade-in cursor-pointer hover:scale-105 transition-transform" 
              style={{animationDelay: '0.2s'}}
              onClick={() => handleMetricClick('cattle')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm font-medium">Total Cattle</p>
                    <p className="text-3xl font-bold mt-2">{isLoading ? '...' : stats.totalCattle}</p>
                  </div>
                  <div className="text-4xl opacity-80">🐄</div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="metric-card text-white border-0 animate-fade-in cursor-pointer hover:scale-105 transition-transform" 
              style={{animationDelay: '0.3s'}}
              onClick={() => handleMetricClick('milk')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm font-medium">Today's Milk</p>
                    <p className="text-3xl font-bold mt-2">{isLoading ? '...' : stats.todayMilk}L</p>
                  </div>
                  <div className="text-4xl opacity-80">🥛</div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="metric-card text-white border-0 animate-fade-in cursor-pointer hover:scale-105 transition-transform" 
              style={{animationDelay: '0.4s'}}
              onClick={() => handleMetricClick('health')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm font-medium">Health Alerts</p>
                    <p className="text-3xl font-bold mt-2">{isLoading ? '...' : stats.healthAlerts}</p>
                  </div>
                  <div className="text-4xl opacity-80">🚨</div>
                </div>
              </CardContent>
            </Card>

            {(user.role === 'admin' || user.role === 'office_staff') && (
              <Card 
                className="metric-card text-white border-0 animate-fade-in cursor-pointer hover:scale-105 transition-transform" 
                style={{animationDelay: '0.5s'}}
                onClick={() => handleMetricClick('approvals')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm font-medium">Pending Approvals</p>
                      <p className="text-3xl font-bold mt-2">{isLoading ? '...' : stats.pendingApprovals}</p>
                    </div>
                    <div className="text-4xl opacity-80">⏳</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-6 animate-slide-up" style={{animationDelay: '0.5s'}}>Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getQuickActions().map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className={`glass-card h-auto p-6 flex items-center justify-start space-x-4 text-white border-white/20 hover:border-white/40 animate-fade-in`}
                style={{animationDelay: `${0.6 + index * 0.1}s`}}
                onClick={() => navigate(action.path)}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                  {action.icon}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white">{action.title}</p>
                  <p className="text-sm text-gray-300">{action.desc}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Health Status Alert */}
        {stats.healthAlerts > 0 && (
          <Card className="glass-card border-red-500/50 text-white animate-fade-in" style={{animationDelay: '1s'}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-200 text-sm font-medium">Health Alerts</p>
                  <p className="text-3xl font-bold text-red-300">{stats.healthAlerts}</p>
                  <p className="text-red-200 text-sm">Require immediate attention</p>
                </div>
                <div className="text-4xl animate-pulse">🚨</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Approvals Alert */}
        {stats.pendingApprovals > 0 && (user.role === 'admin' || user.role === 'office_staff') && (
          <Card className="glass-card border-yellow-500/50 text-white animate-fade-in mt-4" style={{animationDelay: '1.1s'}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-200 text-sm font-medium">Pending User Approvals</p>
                  <p className="text-3xl font-bold text-yellow-300">{stats.pendingApprovals}</p>
                  <p className="text-yellow-200 text-sm">Users waiting for approval</p>
                </div>
                <div className="text-4xl animate-pulse">⏳</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
