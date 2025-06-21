
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

interface UserData {
  email: string;
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
      navigate('/login');
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
        supabase.from('cattle').select('id', { count: 'exact' }),
        supabase.from('milk_production').select('milk_produced').eq('production_date', today),
        supabase.from('health_checks').select('id', { count: 'exact' }).eq('alert_sent', true)
      ]);

      // Calculate today's total milk production
      const todayMilk = milkResult.data?.reduce((sum, record) => sum + (record.milk_produced || 0), 0) || 0;

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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'office_staff': return 'bg-blue-100 text-blue-800';
      case 'field_officer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-orange-50">
      <Navigation user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome back, {user.name}!
              </h1>
              <div className="flex items-center gap-3">
                <Badge className={getRoleBadgeColor(user.role)}>
                  {user.role.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-gray-600">• Today's Dashboard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Farmers</p>
                  <p className="text-3xl font-bold">{isLoading ? '...' : stats.totalFarmers}</p>
                </div>
                <div className="text-4xl">👨‍🌾</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100">Total Cattle</p>
                  <p className="text-3xl font-bold">{isLoading ? '...' : stats.totalCattle}</p>
                </div>
                <div className="text-4xl">🐄</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Today's Milk (L)</p>
                  <p className="text-3xl font-bold">{isLoading ? '...' : stats.todayMilk}</p>
                </div>
                <div className="text-4xl">🥛</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">Health Alerts</p>
                  <p className="text-3xl font-bold">{isLoading ? '...' : stats.healthAlerts}</p>
                </div>
                <div className="text-4xl">🚨</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Quick Actions</CardTitle>
            <CardDescription>Common tasks for your role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getQuickActions().map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center space-y-3 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                  onClick={() => navigate(action.path)}
                >
                  <div className="text-3xl">{action.icon}</div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-800">{action.title}</p>
                    <p className="text-sm text-gray-600">{action.desc}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
