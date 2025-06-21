
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
  villageDistribution: Array<{ village: string; farmers: number }>;
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
    villageDistribution: []
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
        supabase.from('cattle').select('id', { count: 'exact' }),
        supabase.from('milk_production').select('milk_produced'),
        supabase.from('health_checks').select('id', { count: 'exact' }).eq('alert_sent', true),
        supabase.from('feed_requests').select('id', { count: 'exact' }).eq('status', 'pending')
      ]);

      // Calculate total milk production
      const totalMilk = milkResult.data?.reduce((sum, record) => sum + (record.milk_produced || 0), 0) || 0;

      // Fetch cattle by type
      const { data: cattleByType } = await supabase
        .from('cattle')
        .select('cattle_type')
        .then(result => {
          const counts = result.data?.reduce((acc: any, cattle) => {
            acc[cattle.cattle_type] = (acc[cattle.cattle_type] || 0) + 1;
            return acc;
          }, {}) || {};
          
          return {
            data: Object.entries(counts).map(([name, value]) => ({ name, value }))
          };
        });

      // Fetch village distribution
      const { data: villageData } = await supabase
        .from('farmers')
        .select('village')
        .then(result => {
          const counts = result.data?.reduce((acc: any, farmer) => {
            const village = farmer.village.replace('_', ' ').toUpperCase();
            acc[village] = (acc[village] || 0) + 1;
            return acc;
          }, {}) || {};
          
          return {
            data: Object.entries(counts).map(([village, farmers]) => ({ village, farmers }))
          };
        });

      // Fetch recent milk production (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: milkByDate } = await supabase
        .from('milk_production')
        .select('production_date, milk_produced')
        .gte('production_date', sevenDaysAgo.toISOString().split('T')[0])
        .then(result => {
          const dateGroups = result.data?.reduce((acc: any, record) => {
            const date = record.production_date;
            acc[date] = (acc[date] || 0) + (record.milk_produced || 0);
            return acc;
          }, {}) || {};
          
          return {
            data: Object.entries(dateGroups).map(([date, production]) => ({ 
              date: new Date(date).toLocaleDateString(), 
              production 
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
        villageDistribution: villageData || []
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-orange-50">
        <Navigation user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-orange-50">
      <Navigation user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Analytics Dashboard</h1>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-green-100">Total Farmers</p>
                  <p className="text-3xl font-bold">{data.totalFarmers}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-amber-100">Total Cattle</p>
                  <p className="text-3xl font-bold">{data.totalCattle}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-blue-100">Total Milk (L)</p>
                  <p className="text-3xl font-bold">{data.totalMilkProduction}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-red-100">Health Alerts</p>
                  <p className="text-3xl font-bold">{data.healthAlerts}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-purple-100">Pending Requests</p>
                  <p className="text-3xl font-bold">{data.pendingFeedRequests}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white/90 backdrop-blur shadow-xl border-0">
              <CardHeader>
                <CardTitle>Cattle Distribution by Type</CardTitle>
                <CardDescription>Breakdown of cattle types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
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
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur shadow-xl border-0">
              <CardHeader>
                <CardTitle>Village Distribution</CardTitle>
                <CardDescription>Farmers by village</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.villageDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="village" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="farmers" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Milk Production Trend */}
          <Card className="bg-white/90 backdrop-blur shadow-xl border-0">
            <CardHeader>
              <CardTitle>Milk Production Trend (Last 7 Days)</CardTitle>
              <CardDescription>Daily milk production in liters</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.milkProductionByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="production" fill="#82ca9d" name="Milk Production (L)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
