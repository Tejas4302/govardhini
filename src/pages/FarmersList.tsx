
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navigation user={JSON.parse(localStorage.getItem('govardhini_user') || '{}')} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Farmers Directory</h1>
          <Button onClick={() => navigate('/farmer-onboarding')} className="glass-button flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Farmer
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="glass-card text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">{stats.totalFarmers}</CardTitle>
                  <CardDescription className="text-sm text-gray-300">Total Farmers</CardDescription>
                </div>
                <Users className="w-6 h-6 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">{stats.activeFarmers}</CardTitle>
                  <CardDescription className="text-sm text-gray-300">Active Farmers</CardDescription>
                </div>
                <Users className="w-6 h-6 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">{stats.totalCattle}</CardTitle>
                  <CardDescription className="text-sm text-gray-300">Total Cattle</CardDescription>
                </div>
                <Heart className="w-6 h-6 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search farmers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input"
          />
        </div>

        {isLoading ? (
          <div className="text-center">Loading farmers...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFarmers.map(farmer => (
              <Card key={farmer.id} className="glass-card text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{farmer.full_name}</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-white/10 text-white"
                      onClick={() => navigate(`/farmer/${farmer.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-white/10 text-white"
                      onClick={() => navigate(`/farmer-onboarding?farmerId=${farmer.id}`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-red-500/20 text-red-500"
                      onClick={() => handleDeleteFarmer(farmer.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{farmer.phone_number}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{farmer.town_or_village}, {farmer.district}</span>
                    </div>
                  </div>
                  <Badge className="mt-2 w-fit bg-green-500 hover:bg-green-600 text-white">
                    Active
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmersList;
