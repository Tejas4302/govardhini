
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Plus, Phone, MapPin, Users, Eye, Trash2, Edit, AlertTriangle, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

interface Farmer {
  id: string;
  created_at: string;
  full_name: string;
  phone_number: string;
  state: string;
  district: string;
  taluk: string;
  town_or_village: string;
  pincode: string;
  aadhaar_number: string | null;
  added_by: string;
}

interface Stats {
  totalFarmers: number;
  activeFarmers: number;
  totalCattle: number;
}

const FarmersList = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFarmers, setFilteredFarmers] = useState<Farmer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalFarmers: 0,
    activeFarmers: 0,
    totalCattle: 0
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchFarmers();
    fetchFarmersStats();
  }, []);

  useEffect(() => {
    const results = farmers.filter(farmer =>
      farmer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.phone_number.includes(searchQuery)
    );
    setFilteredFarmers(results);
  }, [searchQuery, farmers]);

  const fetchFarmers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching farmers:', error);
        toast({
          title: "Error",
          description: "Failed to load farmers.",
          variant: "destructive",
        });
      } else {
        setFarmers(data || []);
        setFilteredFarmers(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Failed to load farmers.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFarmersStats = async () => {
    try {
      const [farmersResult, cattleResult, milkResult] = await Promise.all([
        supabase.from('farmers').select('id'),
        supabase.from('cattle_profiles').select('farmer_id'),
        supabase.from('milk_production').select('cattle_id', { count: 'exact' })
      ]);

      setStats({
        totalFarmers: farmersResult.data?.length || 0,
        totalCattle: cattleResult.data?.length || 0,
        activeFarmers: new Set(cattleResult.data?.map(c => c.farmer_id).filter(Boolean)).size || 0
      });
    } catch (error) {
      console.error('Error fetching farmers stats:', error);
    }
  };

  const handleDeleteFarmer = async (farmerId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this farmer?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('farmers')
        .delete()
        .eq('id', farmerId);

      if (error) {
        console.error("Error deleting farmer:", error);
        toast({
          title: "Error",
          description: "Failed to delete farmer.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Farmer deleted successfully.",
        });
        fetchFarmers(); // Refresh the list
        fetchFarmersStats(); // Refresh stats
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "Failed to delete farmer.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-teal-900">
      <Navigation user={JSON.parse(localStorage.getItem('govardhini_user') || '{}')} />
      
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white animate-fade-in">Farmers Directory</h1>
            <Button onClick={() => navigate('/farmer-onboarding')} className="grass-green hover:bg-emerald-700 text-white font-semibold px-6 animate-fade-in">
              <Plus className="w-5 h-5 mr-2" />
              Add Farmer
            </Button>
          </div>

          {/* Enhanced Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="glass-card text-white border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-green-500/10 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-300 text-sm font-medium">Total Farmers</p>
                    <p className="text-4xl font-bold text-white">{stats.totalFarmers}</p>
                    <div className="flex items-center mt-2">
                      <Users className="w-4 h-4 text-emerald-400 mr-1" />
                      <span className="text-emerald-400 text-sm">Registered</span>
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
                    <p className="text-teal-300 text-sm font-medium">Active Farmers</p>
                    <p className="text-4xl font-bold text-white">{stats.activeFarmers}</p>
                    <div className="flex items-center mt-2">
                      <Heart className="w-4 h-4 text-teal-400 mr-1" />
                      <span className="text-teal-400 text-sm">With Cattle</span>
                    </div>
                  </div>
                  <Heart className="w-12 h-12 text-teal-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card text-white border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-300 text-sm font-medium">Total Cattle</p>
                    <p className="text-4xl font-bold text-white">{stats.totalCattle}</p>
                    <div className="flex items-center mt-2">
                      <AlertTriangle className="w-4 h-4 text-cyan-400 mr-1" />
                      <span className="text-cyan-400 text-sm">Managed</span>
                    </div>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-cyan-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Section */}
          <Card className="glass-card border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5 mb-8 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <Search className="w-8 h-8 mr-3 text-emerald-400" />
                Find Farmers
              </CardTitle>
              <CardDescription className="text-emerald-300">Search by name or phone number</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="Search farmers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300"
              />
            </CardContent>
          </Card>

          {/* Farmers Grid */}
          {isLoading ? (
            <div className="text-center text-white py-8">
              <div className="animate-pulse">Loading farmers...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFarmers.map((farmer, index) => (
                <Card key={farmer.id} className="glass-card text-white border-emerald-500/20 hover:border-emerald-400/50 transition-all hover:bg-emerald-500/10 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl">👨‍🌾</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-white">{farmer.full_name}</CardTitle>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-emerald-500/20 text-emerald-300 hover:text-white"
                        onClick={() => navigate(`/farmer/${farmer.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-emerald-500/20 text-emerald-300 hover:text-white"
                        onClick={() => navigate(`/farmer-onboarding?farmerId=${farmer.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-red-500/20 text-red-400 hover:text-red-300"
                        onClick={() => handleDeleteFarmer(farmer.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-emerald-300 text-sm">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{farmer.phone_number}</span>
                      </div>
                      <div className="flex items-center text-emerald-400 text-sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{farmer.town_or_village}, {farmer.district}</span>
                      </div>
                    </div>
                    <Badge className="mt-3 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                      Active
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmersList;
