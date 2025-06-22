
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { 
  Users, 
  Heart, 
  TrendingUp, 
  Calendar,
  Search,
  FileText,
  UserCheck,
  Clock,
  Plus,
  Activity,
  BarChart3
} from 'lucide-react';

interface DashboardStats {
  totalFarmers: number;
  totalCattle: number;
  activeFarmers: number;
  totalMilkProduction: number;
  recentHealthChecks: number;
  pendingFeedRequests: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalFarmers: 0,
    totalCattle: 0,
    activeFarmers: 0,
    totalMilkProduction: 0,
    recentHealthChecks: 0,
    pendingFeedRequests: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [farmersResult, cattleResult, milkResult, healthResult, feedResult] = await Promise.all([
        supabase.from('farmers').select('id'),
        supabase.from('cattle_profiles').select('farmer_id'),
        supabase.from('milk_production').select('quantity_litres'),
        supabase.from('health_checkups').select('id').gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('feed_requests').select('id').eq('status', 'pending')
      ]);

      const activeFarmersSet = new Set(cattleResult.data?.map(c => c.farmer_id).filter(Boolean));
      const totalMilk = milkResult.data?.reduce((sum, record) => sum + (record.quantity_litres || 0), 0) || 0;

      setStats({
        totalFarmers: farmersResult.data?.length || 0,
        totalCattle: cattleResult.data?.length || 0,
        activeFarmers: activeFarmersSet.size,
        totalMilkProduction: totalMilk,
        recentHealthChecks: healthResult.data?.length || 0,
        pendingFeedRequests: feedResult.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Add New Farmer',
      description: 'Register a new farmer',
      icon: Users,
      action: () => navigate('/farmer-onboarding'),
      gradient: 'from-emerald-500 to-green-600'
    },
    {
      title: 'Add Cattle',
      description: 'Register new cattle',
      icon: () => <span className="text-2xl">🐄</span>, // Cow icon instead of Beef
      action: () => navigate('/cattle-onboarding'),
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      title: 'Health Check',
      description: 'Record health checkup',
      icon: Heart,
      action: () => navigate('/health-check'),
      gradient: 'from-red-500 to-pink-600'
    },
    {
      title: 'Milk Logging',
      description: 'Log milk production',
      icon: TrendingUp,
      action: () => navigate('/milk-logging'),
      gradient: 'from-blue-500 to-cyan-600'
    }
  ];

  const navigationCards = [
    {
      title: 'Farmers Directory',
      description: 'View and manage all farmers',
      icon: Users,
      action: () => navigate('/farmers'),
      count: stats.totalFarmers,
      gradient: 'from-emerald-500 to-green-600'
    },
    {
      title: 'Search Farmers',
      description: 'Find specific farmers',
      icon: Search,
      action: () => navigate('/search-farmers'),
      gradient: 'from-teal-500 to-cyan-600'
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics',
      icon: BarChart3,
      action: () => navigate('/analytics'),
      gradient: 'from-purple-500 to-indigo-600'
    },
    {
      title: 'System Reports',
      description: 'Generate comprehensive reports',
      icon: FileText,
      action: () => navigate('/system-reports'),
      gradient: 'from-orange-500 to-red-600'
    },
    {
      title: 'User Management',
      description: 'Manage user access',
      icon: UserCheck,
      action: () => navigate('/user-management'),
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Recent Activities',
      description: 'View system activities',
      icon: Activity,
      action: () => navigate('/recent-activities'),
      gradient: 'from-violet-500 to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-teal-900">
      <Navigation user={user} />
      
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in">
              Welcome to Govardhini
            </h1>
            <p className="text-emerald-300 text-lg animate-fade-in" style={{animationDelay: '0.1s'}}>
              Agricultural Cattle Management System
            </p>
          </div>

          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="glass-card text-white border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-green-500/10 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-300 text-sm font-medium">Total Farmers</p>
                    <p className="text-3xl font-bold text-white">{stats.totalFarmers}</p>
                    <div className="flex items-center mt-2">
                      <Users className="w-4 h-4 text-emerald-400 mr-1" />
                      <span className="text-emerald-400 text-sm">Registered</span>
                    </div>
                  </div>
                  <Users className="w-12 h-12 text-emerald-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card text-white border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-300 text-sm font-medium">Total Cattle</p>
                    <p className="text-3xl font-bold text-white">{stats.totalCattle}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-lg mr-1">🐄</span>
                      <span className="text-amber-400 text-sm">Managed</span>
                    </div>
                  </div>
                  <span className="text-5xl">🐄</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card text-white border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-300 text-sm font-medium">Active Farmers</p>
                    <p className="text-3xl font-bold text-white">{stats.activeFarmers}</p>
                    <div className="flex items-center mt-2">
                      <Heart className="w-4 h-4 text-teal-400 mr-1" />
                      <span className="text-teal-400 text-sm">With Cattle</span>
                    </div>
                  </div>
                  <Heart className="w-12 h-12 text-teal-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="glass-card border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5 mb-8 animate-fade-in" style={{animationDelay: '0.5s'}}>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <Plus className="w-8 h-8 mr-3 text-emerald-400" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-emerald-300">
                Frequently used actions for efficient management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <Button
                      key={action.title}
                      onClick={action.action}
                      className={`h-auto p-6 bg-gradient-to-r ${action.gradient} hover:scale-105 transition-transform duration-200 text-white border-0 animate-slide-up`}
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        {typeof IconComponent === 'function' && IconComponent.name === '' ? 
                          <IconComponent /> : 
                          <IconComponent className="w-8 h-8" />
                        }
                        <div className="text-center">
                          <p className="font-semibold">{action.title}</p>
                          <p className="text-xs opacity-90">{action.description}</p>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Cards */}
          <Card className="glass-card border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5 animate-fade-in" style={{animationDelay: '0.6s'}}>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <Calendar className="w-8 h-8 mr-3 text-emerald-400" />
                System Overview
              </CardTitle>
              <CardDescription className="text-emerald-300">
                Access all system features and management tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {navigationCards.map((card, index) => {
                  const IconComponent = card.icon;
                  return (
                    <Card
                      key={card.title}
                      className="glass-card border-emerald-500/10 hover:border-emerald-400/30 transition-all hover:bg-emerald-500/10 cursor-pointer animate-slide-up"
                      style={{animationDelay: `${index * 0.1}s`}}
                      onClick={card.action}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${card.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg">{card.title}</h3>
                            <p className="text-emerald-300 text-sm">{card.description}</p>
                            {card.count !== undefined && (
                              <Badge className="mt-2 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                {card.count} items
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
