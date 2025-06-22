
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';

interface Farmer {
  id: string;
  full_name: string;
  phone_number: string;
  district: string;
  taluk: string;
  town_or_village: string;
}

const SearchFarmers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  const searchFarmers = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search term",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%,district.ilike.%${searchTerm}%,taluk.ilike.%${searchTerm}%,town_or_village.ilike.%${searchTerm}%`)
        .order('full_name');

      if (error) throw error;
      setFarmers(data || []);
    } catch (error) {
      console.error('Error searching farmers:', error);
      toast({
        title: "Error",
        description: "Failed to search farmers",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchFarmers();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation user={user} />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Search Farmers</CardTitle>
              <CardDescription className="text-gray-300">Find farmers by name, phone, location or other details</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Input
                  placeholder="Search by name, phone, district, taluk, or village..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button 
                  onClick={searchFarmers}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {farmers.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Search Results ({farmers.length})</h3>
                  {farmers.map((farmer) => (
                    <Card key={farmer.id} className="glass-card border-white/10 cursor-pointer hover:border-white/30 transition-all"
                          onClick={() => navigate(`/farmer/${farmer.id}`)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-semibold">{farmer.full_name}</h4>
                            <p className="text-gray-300 text-sm">{farmer.phone_number}</p>
                            <p className="text-gray-400 text-sm">
                              {farmer.town_or_village}, {farmer.taluk}, {farmer.district}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            View Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {farmers.length === 0 && searchTerm && !isLoading && (
                <div className="text-center text-gray-400 py-8">
                  No farmers found matching your search criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SearchFarmers;
