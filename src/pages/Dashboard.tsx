
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
}

const Dashboard = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalFarmers: 0,
    totalCattle: 0,
    todayMilk: 0,
    healthAlerts: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('govardhini_user');
    if (!userData) {
      navigate('/auth');
      return;
    }
    setUser(JSON.parse(userData));
    fetchDashboardStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Fetch all stats in parallel
      const [farmersResult, cattleResult, milkResult, healthResult] = await Promise.all([
        supabase.from('farmers').select('id', { count: 'exact' }),
        supabase.from('cattle_profiles').select('id', { count: 'exact' }),
        supabase.from('milk_production').select('quantity_litres').eq('date', today),
        supabase.from('health_checkups').select('id', { count: 'exact' }).not('issue', 'is', null)
      ]);

      // Calculate today's total milk production
      const todayMilk = milkResult.data?.reduce((sum, record) => sum + (record.quantity_litres || 0), 0) || 0;

      setStats({
        totalFarmers: farmersResult.count || 0,
        totalCattle: cattleResult.count || 0,
        todayMilk: Math.round(todayMilk * 100) / 100,
        healthAlerts: healthResult.count || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const getQuickActions = () => {
    const baseActions = [
      { title: 'Farmer Registration', desc: 'Register new farmers', icon: '👨‍🌾', path: '/farmer-onboarding' },
      { title: 'Cattle Onboarding', desc: 'Add new cattle', icon: '🐄', path: '/cattle-onboarding' },
      { title: 'Health Check', desc: 'Record cattle health', icon: '❤️', path: '/health-check' },
      { title: 'Milk Production', desc: 'Log milk production', icon: '🥛', path: '/milk-logging' },
    ];

    if (user.role === 'admin' || user.role === 'office_staff') {
      baseActions.push(
        { title: 'Feed Requests', desc: 'Manage feed requests', icon: '🌾', path: '/feed-requests' },
        { title: 'Analytics', desc: 'View reports & charts', icon: '📊', path: '/analytics' }
      );
    }

    return baseActions;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation user={user} />
      
      {/* Header */}
      <div className="bg-gray-900 px-4 py-6 border-b border-gray-700">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-600 text-white">
              {user.role.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Key Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Farmers</p>
                    <p className="text-3xl font-bold">{isLoading ? '...' : stats.totalFarmers}</p>
                  </div>
                  <div className="text-4xl">👨‍🌾</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Cattle</p>
                    <p className="text-3xl font-bold">{isLoading ? '...' : stats.totalCattle}</p>
                  </div>
                  <div className="text-4xl">🐄</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Today's Milk Production</p>
                  <p className="text-3xl font-bold">{isLoading ? '...' : stats.todayMilk}L</p>
                </div>
                <div className="text-4xl">🥛</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getQuickActions().map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-6 flex items-center justify-start space-x-4 bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:border-green-500 transition-all duration-200"
                onClick={() => navigate(action.path)}
              >
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-2xl">
                  {action.icon}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white">{action.title}</p>
                  <p className="text-sm text-gray-400">{action.desc}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Health Status */}
        {stats.healthAlerts > 0 && (
          <Card className="bg-red-900 border-red-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-200 text-sm">Health Alerts</p>
                  <p className="text-3xl font-bold">{stats.healthAlerts}</p>
                  <p className="text-red-200 text-sm">Require attention</p>
                </div>
                <div className="text-4xl">🚨</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
