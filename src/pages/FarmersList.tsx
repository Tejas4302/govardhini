import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Farmer {
  id: string;
  full_name: string;
  phone_number: string;
  district: string;
  taluk: string;
  town_or_village: string;
  cattle_count?: number;
}

const FarmersList = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [filteredFarmers, setFilteredFarmers] = useState<Farmer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');
  
  // Fixed admin check to handle object structure and also check user.role
  const isAdmin = user.designation?.value?.toLowerCase() === 'admin' || 
                  user.designation?.value?.toLowerCase() === 'office_staff' ||
                  user.role?.toLowerCase() === 'admin' ||
                  user.designation?.toLowerCase() === 'admin' ||
                  user.designation?.toLowerCase() === 'office_staff';

  useEffect(() => {
    fetchFarmers();
  }, []);

  useEffect(() => {
    const filtered = farmers.filter(farmer =>
      farmer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.phone_number.includes(searchTerm) ||
      farmer.district.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFarmers(filtered);
  }, [searchTerm, farmers]);

  const fetchFarmers = async () => {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select(`
          *,
          cattle_profiles(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const farmersWithCattleCount = data?.map(farmer => ({
        ...farmer,
        cattle_count: farmer.cattle_profiles?.[0]?.count || 0
      })) || [];

      setFarmers(farmersWithCattleCount);
    } catch (error) {
      console.error('Error fetching farmers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch farmers",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFarmer = async (farmerId: string, farmerName: string) => {
    setDeletingId(farmerId);
    try {
      // Get cattle IDs first
      const { data: cattleData } = await supabase
        .from('cattle_profiles')
        .select('cattle_id')
        .eq('farmer_id', farmerId);

      const cattleIds = cattleData?.map(c => c.cattle_id) || [];

      // Delete related records first (cascade deletion)
      await Promise.all([
        supabase.from('milk_production').delete().in('cattle_id', cattleIds),
        supabase.from('health_checkups').delete().in('cattle_id', cattleIds),
        supabase.from('feed_requests').delete().in('cattle_id', cattleIds),
        supabase.from('sms_notifications').delete().eq('farmer_id', farmerId),
        supabase.from('cattle_profiles').delete().eq('farmer_id', farmerId)
      ]);

      // Finally delete the farmer
      const { error } = await supabase
        .from('farmers')
        .delete()
        .eq('id', farmerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${farmerName} and all related records have been deleted successfully`,
      });

      // Refresh the farmers list
      fetchFarmers();
    } catch (error) {
      console.error('Error deleting farmer:', error);
      toast({
        title: "Error",
        description: "Failed to delete farmer",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation user={user} />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-4">Farmers Directory</h1>
            <div className="flex gap-4 items-center">
              <Input
                placeholder="Search farmers by name, phone, or district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md glass-input text-white placeholder:text-gray-400 border-white/20"
              />
              <Button
                onClick={() => navigate('/farmer-onboarding')}
                className="bg-gradient-to-r from-green-500 to-emerald-600"
              >
                Add New Farmer 👨‍🌾
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center text-white">Loading farmers...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFarmers.map((farmer) => (
                <Card key={farmer.id} className="glass-card border-0 hover:border-white/40 transition-all">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{farmer.full_name}</CardTitle>
                    <CardDescription className="text-gray-300">
                      📱 {farmer.phone_number}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>📍 {farmer.town_or_village}, {farmer.taluk}</p>
                      <p>🏛️ {farmer.district}</p>
                      <p>🐄 {farmer.cattle_count || 0} cattle</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => navigate(`/farmer/${farmer.id}`)}
                        className="flex-1 glass-button"
                      >
                        View Profile
                      </Button>
                      {isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-card border-red-500/20">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Delete Farmer</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-300">
                                This will permanently delete {farmer.full_name} and all associated records including {farmer.cattle_count || 0} cattle profiles, milk production records, health checkups, and SMS notifications.
                                <br /><br />
                                This action cannot be undone. Are you sure?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="glass-button">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteFarmer(farmer.id, farmer.full_name)}
                                disabled={deletingId === farmer.id}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deletingId === farmer.id ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredFarmers.length === 0 && !isLoading && (
                <Card className="glass-card border-0 col-span-full">
                  <CardContent className="text-center py-8">
                    <p className="text-gray-300 mb-4">
                      {searchTerm ? 'No farmers found matching your search' : 'No farmers registered yet'}
                    </p>
                    {!searchTerm && (
                      <Button
                        onClick={() => navigate('/farmer-onboarding')}
                        className="bg-gradient-to-r from-green-500 to-emerald-600"
                      >
                        Register First Farmer 👨‍🌾
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmersList;
