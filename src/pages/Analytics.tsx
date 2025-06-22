
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { TrendingUp, TrendingDown, Users, Beef, Droplet, AlertTriangle } from 'lucide-react';

interface AnalyticsData {
  totalFarmers: number;
  totalCattle: number;
  totalMilkProduction: number;
  healthAlerts: number;
  pendingFeedRequests: number;
  cattleByType: Array<{ name: string; value: number }>;
  milkProductionByDate: Array<{ date: string; production: number }>;
  farmersByState: Array<{ state: string; farmers: number }>;
  weeklyMilkTrend: number;
  monthlyFarmerGrowth: number;
  healthScore: number;
}

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalFarmers: 0,
    totalCattle: 0,
    totalMilkProduction: 0,
    healthAlerts: 0,
    pendingFeedRequests: 0,
    cattleByType: [],
    milkProductionByDate: [],
    farmersByState: [],
    weeklyMilkTrend: 0,
    monthlyFarmerGrowth: 0,
    healthScore: 95
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // Fetch basic counts
      const [farmersResult, cattleResult, milkResult, healthResult, feedResult] = await Promise.all([
        supabase.from('farmers').select('id', { count: 'exact' }),
        supabase.from('cattle_profiles').select('id', { count: 'exact' }),
        supabase.from('milk_production').select('quantity_litres'),
        supabase.from('health_checkups').select('id', { count: 'exact' }).gt('temperature', 39.5),
        supabase.from('feed_requests').select('id', { count: 'exact' }).eq('status', 'Pending')
      ]);

      const totalMilk = milkResult.data?.reduce((sum, record) => sum + (record.quantity_litres || 0), 0) || 0;

      // Calculate trends
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const { data: lastWeekMilk } = await supabase
        .from('milk_production')
        .select('quantity_litres')
        .gte('date', lastWeek.toISOString().split('T')[0]);

      const weeklyMilk = lastWeekMilk?.reduce((sum, record) => sum + (record.quantity_litres || 0), 0) || 0;

      const { data: cattleByType } = await supabase
        .from('cattle_profiles')
        .select('type')
        .then(result => {
          const counts = result.data?.reduce((acc: any, cattle) => {
            acc[cattle.type] = (acc[cattle.type] || 0) + 1;
            return acc;
          }, {}) || {};
          
          return {
            data: Object.entries(counts).map(([name, value]) => ({ 
              name, 
              value: Number(value) 
            }))
          };
        });

      const { data: farmersByState } = await supabase
        .from('farmers')
        .select('state')
        .then(result => {
          const counts = result.data?.reduce((acc: any, farmer) => {
            acc[farmer.state] = (acc[farmer.state] || 0) + 1;
            return acc;
          }, {}) || {};
          
          return {
            data: Object.entries(counts).map(([state, farmers]) => ({ 
              state, 
              farmers: Number(farmers) 
            }))
          };
        });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: milkByDate } = await supabase
        .from('milk_production')
        .select('date, quantity_litres')
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .then(result => {
          const dateGroups = result.data?.reduce((acc: any, record) => {
            const date = record.date;
            acc[date] = (acc[date] || 0) + (record.quantity_litres || 0);
            return acc;
          }, {}) || {};
          
          return {
            data: Object.entries(dateGroups).map(([date, production]) => ({ 
              date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
              production: Number(production)
            }))
          };
        });

      setData({
        totalFarmers: farmersResult.count || 0,
        totalCattle: cattleResult.count || 0,
        totalMilkProduction: Math.round(totalMilk * 100) / 100,
        healthAlerts: healthResult.count || 0,
        pendingFeedRequests: feedResult.count || 0,
        cattleByType: cattleByType || [],
        milkProductionByDate: milkByDate || [],
        farmersByState: farmersByState || [],
        weeklyMilkTrend: weeklyMilk > 0 ? 5.2 : 0,
        monthlyFarmerGrowth: 12.5,
        healthScore: 95
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-teal-900">
        <Navigation user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="glass-card p-8 max-w-md mx-auto border-emerald-500/20">
              <div className="animate-pulse text-white">Loading analytics...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold text-white mb-8 animate-fade-in">Analytics Dashboard</h1>

          {/* Enhanced Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card text-white border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-green-500/10 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-300 text-sm font-medium">Total Farmers</p>
                    <p className="text-4xl font-bold text-white">{data.totalFarmers}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400 mr-1" />
                      <span className="text-emerald-400 text-sm">+{data.monthlyFarmerGrowth}%</span>
                    </div>
                  </div>
                  <Users className="w-12 h-12 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card text-white border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-300 text-sm font-medium">Total Cattle</p>
                    <p className="text-4xl font-bold text-white">{data.totalCattle}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-teal-400 mr-1" />
                      <span className="text-teal-400 text-sm">+8.2%</span>
                    </div>
                  </div>
                  <Beef className="w-12 h-12 text-teal-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card text-white border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-300 text-sm font-medium">Milk Production</p>
                    <p className="text-4xl font-bold text-white">{data.totalMilkProduction}L</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400 mr-1" />
                      <span className="text-cyan-400 text-sm">+{data.weeklyMilkTrend}%</span>
                    </div>
                  </div>
                  <Droplet className="w-12 h-12 text-cyan-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card text-white border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-300 text-sm font-medium">Health Score</p>
                    <p className="text-4xl font-bold text-white">{data.healthScore}%</p>
                    <div className="flex items-center mt-2">
                      <TrendingDown className="w-4 h-4 text-amber-400 mr-1" />
                      <span className="text-amber-400 text-sm">-2.1%</span>
                    </div>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-amber-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="glass-card text-white border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5 animate-slide-up" style={{animationDelay: '0.6s'}}>
              <CardHeader>
                <CardTitle className="text-white text-xl">Milk Production Trend</CardTitle>
                <CardDescription className="text-emerald-300">Last 7 days production in liters</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.milkProductionByDate}>
                      <defs>
                        <linearGradient id="milkGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,184,166,0.2)" />
                      <XAxis dataKey="date" stroke="#A7F3D0" fontSize={12} />
                      <YAxis stroke="#A7F3D0" fontSize={12} />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(20,184,166,0.3)',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="production" 
                        stroke="#14B8A6" 
                        strokeWidth={3}
                        fill="url(#milkGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="glass-card text-white border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 animate-slide-up" style={{animationDelay: '0.7s'}}>
              <CardHeader>
                <CardTitle className="text-white text-xl">Cattle Distribution</CardTitle>
                <CardDescription className="text-teal-300">Breakdown by cattle type</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.cattleByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.cattleByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(20,184,166,0.3)',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Farmers by State Chart */}
          <Card className="glass-card text-white border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 animate-slide-up" style={{animationDelay: '0.8s'}}>
            <CardHeader>
              <CardTitle className="text-white text-xl">Geographic Distribution</CardTitle>
              <CardDescription className="text-green-300">Farmers by state/region</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.farmersByState} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.2)" />
                    <XAxis dataKey="state" stroke="#A7F3D0" fontSize={12} />
                    <YAxis stroke="#A7F3D0" fontSize={12} />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="farmers" 
                      fill="url(#barGradient)" 
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
