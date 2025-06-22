
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Phone, ArrowLeft } from 'lucide-react';

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
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button and Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mr-4 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-500/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-white animate-fade-in">Search Farmers</h1>
          </div>
          
          <Card className="glass-card border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <Search className="w-8 h-8 mr-3 text-emerald-400" />
                Find Farmers
              </CardTitle>
              <CardDescription className="text-emerald-300">Search by name, phone, location or other details</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Input
                  placeholder="Search by name, phone, district, taluk, or village..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 glass-input border-emerald-500/30 text-white placeholder:text-emerald-300"
                />
                <Button 
                  onClick={searchFarmers}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold px-8"
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {farmers.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Search Results ({farmers.length})</h3>
                  {farmers.map((farmer) => (
                    <Card key={farmer.id} className="glass-card border-emerald-500/20 cursor-pointer hover:border-emerald-400/50 transition-all hover:bg-emerald-500/10 animate-slide-up"
                          onClick={() => navigate(`/farmer/${farmer.id}`)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white text-xl">👨‍🌾</span>
                            </div>
                            <div>
                              <h4 className="text-white font-semibold text-lg">{farmer.full_name}</h4>
                              <div className="flex items-center text-emerald-300 text-sm mt-1">
                                <Phone className="w-4 h-4 mr-1" />
                                {farmer.phone_number}
                              </div>
                              <div className="flex items-center text-emerald-400 text-sm mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                {farmer.town_or_village}, {farmer.taluk}, {farmer.district}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/20 hover:border-emerald-400"
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
                <div className="text-center text-emerald-400 py-8">
                  <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No farmers found matching your search criteria.</p>
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
