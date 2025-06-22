import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import UserGuide from '@/components/UserGuide';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Heart, 
  Calendar, 
  BarChart3, 
  UserPlus, 
  Stethoscope, 
  Plus,
  Search,
  FileText,
  Clock,
  TrendingUp,
  Activity,
  Settings,
  HelpCircle
} from 'lucide-react';

interface DashboardStats {
  totalFarmers: number;
  totalCattle: number;
  milkProduction: number;
  healthScore: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalCattle: 0,
    milkProduction: 0,
    healthScore: 95
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  useEffect(() => {
    fetchDashboardData();
    
    // Show user guide for first-time users
    const hasSeenGuide = localStorage.getItem('govardhini_guide_seen');
    if (!hasSeenGuide) {
      setShowUserGuide(true);
    }
  }, []);

  const handleCloseGuide = () => {
    setShowUserGuide(false);
    localStorage.setItem('govardhini_guide_seen', 'true');
  };

  const openUserGuide = () => {
    setShowUserGuide(true);
  };

  const fetchDashboardData = async () => {
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
        milkProduction: totalMilk,
        healthScore: 95
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
      title: "Add Farmer",
      description: "Register a new farmer",
      icon: UserPlus,
      color: "from-blue-500 to-blue-600",
      path: "/farmer-onboarding"
    },
    {
      title: "Add Cattle",
      description: "Register new cattle",
      icon: Plus,
      color: "from-green-500 to-green-600", 
      path: "/cattle-onboarding"
    },
    {
      title: "Health Check",
      description: "Record cattle health",
      icon: Stethoscope,
      color: "from-red-500 to-red-600",
      path: "/health-check"
    },
    {
      title: "Log Milk",
      description: "Record milk production",
      icon: Plus,
      color: "from-purple-500 to-purple-600",
      path: "/milk-logging"
    }
  ];

  const managementOptions = [
    {
      title: "Farmers List",
      description: "View all registered farmers",
      icon: Users,
      path: "/farmers"
    },
    {
      title: "Search Farmers",
      description: "Find specific farmers",
      icon: Search,
      path: "/search-farmers"
    },
    {
      title: "User Management",
      description: "Manage system users",
      icon: Settings,
      path: "/user-management",
      adminOnly: true
    },
    {
      title: "Analytics",
      description: "View detailed analytics",
      icon: BarChart3,
      path: "/analytics"
    },
    {
      title: "Recent Activities",
      description: "View recent system activities",
      icon: Clock,
      path: "/recent-activities"
    },
    {
      title: "System Reports",
      description: "Generate system reports",
      icon: FileText,
      path: "/system-reports"
    }
  ];

  const isAdmin = user.role === 'admin' || user.role === 'Admin';
  const filteredManagementOptions = managementOptions.filter(option => 
    !option.adminOnly || isAdmin
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900">
      <Navigation user={user} />
      
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 space-y-8">
        {/* Header with User Guide Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-emerald-300 text-lg animate-fade-in" style={{animationDelay: '0.1s'}}>
              Manage your cattle operations efficiently
            </p>
          </div>
          <Button
            onClick={openUserGuide}
            variant="outline"
            className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            User Guide
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-emerald-500/20 cursor-pointer hover:border-emerald-400/50 transition-all hover:scale-105 animate-slide-up" onClick={() => navigate('/farmers')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-200">Total Farmers</CardTitle>
              <Users className="h-5 w-5 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalFarmers}</div>
              <p className="text-xs text-emerald-400 mt-1">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                Active farmers in system
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-emerald-500/20 cursor-pointer hover:border-emerald-400/50 transition-all hover:scale-105 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-200">Total Cattle</CardTitle>
              <span className="text-2xl">🐄</span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalCattle}</div>
              <p className="text-xs text-emerald-400 mt-1">
                <Activity className="inline w-3 h-3 mr-1" />
                Registered cattle
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-emerald-500/20 cursor-pointer hover:border-emerald-400/50 transition-all hover:scale-105 animate-slide-up" style={{animationDelay: '0.2s'}} onClick={() => navigate('/milk-logging')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-200">Milk Production</CardTitle>
              <span className="text-2xl">🥛</span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.milkProduction}L</div>
              <p className="text-xs text-emerald-400 mt-1">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                This month
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-emerald-500/20 cursor-pointer hover:border-emerald-400/50 transition-all hover:scale-105 animate-slide-up" style={{animationDelay: '0.3s'}} onClick={() => navigate('/health-check')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-200">Health Score</CardTitle>
              <Heart className="h-5 w-5 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.healthScore}%</div>
              <p className="text-xs text-emerald-400 mt-1">
                <Activity className="inline w-3 h-3 mr-1" />
                Overall cattle health
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass-card border-emerald-500/20 animate-fade-in" style={{animationDelay: '0.4s'}}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white flex items-center">
              <Plus className="w-8 h-8 mr-3 text-emerald-400" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-emerald-300">Frequently used operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={action.title}
                  onClick={() => navigate(action.path)}
                  className="h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 hover:border-emerald-400/50 hover:bg-emerald-500/20 text-white transition-all hover:scale-105"
                  style={{animationDelay: `${0.5 + index * 0.1}s`}}
                >
                  <action.icon className="w-6 h-6 text-emerald-400" />
                  <div className="text-center">
                    <div className="font-semibold text-sm">{action.title}</div>
                    <div className="text-xs text-emerald-300">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Management Options */}
        <Card className="glass-card border-emerald-500/20 animate-fade-in" style={{animationDelay: '0.5s'}}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white flex items-center">
              <Settings className="w-8 h-8 mr-3 text-emerald-400" />
              Management
            </CardTitle>
            <CardDescription className="text-emerald-300">System management and reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredManagementOptions.map((option, index) => (
                <Button
                  key={option.title}
                  onClick={() => navigate(option.path)}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 border-emerald-500/30 hover:border-emerald-400/50 hover:bg-emerald-500/20 text-white transition-all hover:scale-105"
                  style={{animationDelay: `${0.6 + index * 0.1}s`}}
                >
                  <option.icon className="w-5 h-5 text-emerald-400" />
                  <div className="text-center">
                    <div className="font-semibold text-sm">{option.title}</div>
                    <div className="text-xs text-emerald-300">{option.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="glass-card border-emerald-500/20 animate-fade-in" style={{animationDelay: '0.6s'}}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white flex items-center">
              <Clock className="w-8 h-8 mr-3 text-emerald-400" />
              Recent Activities
            </CardTitle>
            <CardDescription className="text-emerald-300">Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-emerald-300 py-4">Loading activities...</div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-300">
                      {activity.type}
                    </Badge>
                    <span className="text-white text-sm flex-1">{activity.description}</span>
                    <span className="text-emerald-400 text-xs">{activity.timestamp}</span>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/recent-activities')}
                  className="w-full border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                >
                  View All Activities
                </Button>
              </div>
            ) : (
              <div className="text-center text-emerald-400 py-8">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent activities found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Guide Modal */}
      <UserGuide isOpen={showUserGuide} onClose={handleCloseGuide} />
    </div>
  );
};

export default Dashboard;
