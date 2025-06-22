
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

interface AnalyticsData {
  totalFarmers: number;
  totalCattle: number;
  totalMilkProduction: number;
  healthAlerts: number;
  pendingFeedRequests: number;
  cattleByType: Array<{ name: string; value: number }>;
  milkProductionByDate: Array<{ date: string; production: number }>;
  farmersByState: Array<{ state: string; farmers: number }>;
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
    farmersByState: []
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
              date: new Date(date).toLocaleDateString(), 
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
        farmersByState: farmersByState || []
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

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="glass-card p-8 max-w-md mx-auto">
              <div className="animate-pulse text-white">Loading analytics...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation user={user} />
      
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 animate-fade-in">Analytics Dashboard 📊</h1>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card className="glass-card text-white border-0 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <CardContent className="p-6 text-center">
                <p className="text-gray-300 text-sm">Total Farmers</p>
                <p className="text-3xl font-bold text-green-400">{data.totalFarmers}</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card text-white border-0 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-6 text-center">
                <p className="text-gray-300 text-sm">Total Cattle</p>
                <p className="text-3xl font-bold text-amber-400">{data.totalCattle}</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card text-white border-0 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <CardContent className="p-6 text-center">
                <p className="text-gray-300 text-sm">Total Milk (L)</p>
                <p className="text-3xl font-bold text-blue-400">{data.totalMilkProduction}</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card text-white border-0 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <CardContent className="p-6 text-center">
                <p className="text-gray-300 text-sm">Health Alerts</p>
                <p className="text-3xl font-bold text-red-400">{data.healthAlerts}</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card text-white border-0 animate-fade-in" style={{animationDelay: '0.5s'}}>
              <CardContent className="p-6 text-center">
                <p className="text-gray-300 text-sm">Pending Requests</p>
                <p className="text-3xl font-bold text-purple-400">{data.pendingFeedRequests}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="glass-card text-white border-0 animate-slide-up" style={{animationDelay: '0.6s'}}>
              <CardHeader>
                <CardTitle className="text-white">Cattle Distribution by Type 🐄</CardTitle>
                <CardDescription className="text-gray-300">Breakdown of cattle types</CardDescription>
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
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.cattleByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="glass-card text-white border-0 animate-slide-up" style={{animationDelay: '0.7s'}}>
              <CardHeader>
                <CardTitle className="text-white">Farmers by State 📍</CardTitle>
                <CardDescription className="text-gray-300">Geographic distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.farmersByState}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="state" stroke="#D1D5DB" />
                      <YAxis stroke="#D1D5DB" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="farmers" 
                        fill="url(#barGradient)" 
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Milk Production Trend */}
          <Card className="glass-card text-white border-0 animate-slide-up" style={{animationDelay: '0.8s'}}>
            <CardHeader>
              <CardTitle className="text-white">Milk Production Trend (Last 7 Days) 🥛</CardTitle>
              <CardDescription className="text-gray-300">Daily milk production in liters</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.milkProductionByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="#D1D5DB" />
                    <YAxis stroke="#D1D5DB" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="production" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#1D4ED8' }}
                    />
                  </LineChart>
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
