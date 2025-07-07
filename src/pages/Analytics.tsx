
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Users, Milk, Activity } from 'lucide-react';

const Analytics = () => {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalCattle: 0,
    totalMilkProduction: 0,
    totalHealthChecks: 0
  });
  
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch basic stats
      const [farmersResponse, cattleResponse, milkResponse, healthResponse] = await Promise.all([
        supabase.from('farmers').select('id', { count: 'exact' }),
        supabase.from('cattle_profiles').select('id', { count: 'exact' }),
        supabase.from('milk_production').select('quantity_litres'),
        supabase.from('health_checkups').select('id', { count: 'exact' })
      ]);

      setStats({
        totalFarmers: farmersResponse.count || 0,
        totalCattle: cattleResponse.count || 0,
        totalMilkProduction: milkResponse.data?.reduce((sum, record) => sum + record.quantity_litres, 0) || 0,
        totalHealthChecks: healthResponse.count || 0
      });

      // Set chart data
      setChartData([
        { name: 'Farmers', value: farmersResponse.count || 0, color: '#10b981' },
        { name: 'Cattle', value: cattleResponse.count || 0, color: '#059669' },
        { name: 'Health Checks', value: healthResponse.count || 0, color: '#047857' }
      ]);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#10b981', '#059669', '#047857', '#065f46'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-teal-900">
      <Navigation user={user} />
      
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-48 h-48 md:w-96 md:h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mr-4 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-500/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold text-white animate-fade-in">Analytics Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="agricultural-glass border-emerald-500/20 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-200">Total Farmers</CardTitle>
              <Users className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalFarmers}</div>
              <p className="text-xs text-emerald-300">Registered farmers</p>
            </CardContent>
          </Card>

          <Card className="agricultural-glass border-emerald-500/20 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-200">Total Cattle</CardTitle>
              <Activity className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalCattle}</div>
              <p className="text-xs text-emerald-300">Registered cattle</p>
            </CardContent>
          </Card>

          <Card className="agricultural-glass border-emerald-500/20 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-200">Milk Production</CardTitle>
              <Milk className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalMilkProduction.toFixed(1)}L</div>
              <p className="text-xs text-emerald-300">Total recorded</p>
            </CardContent>
          </Card>

          <Card className="agricultural-glass border-emerald-500/20 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-200">Health Checks</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalHealthChecks}</div>
              <p className="text-xs text-emerald-300">Completed checkups</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="agricultural-glass border-emerald-500/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">System Overview</CardTitle>
              <CardDescription className="text-emerald-300">Distribution of registered entities</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="agricultural-glass border-emerald-500/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Statistics Overview</CardTitle>
              <CardDescription className="text-emerald-300">Key metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#d1fae5" />
                  <YAxis stroke="#d1fae5" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="value" fill="#10b981" />
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
