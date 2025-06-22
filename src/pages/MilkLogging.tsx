import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

const MilkLogging = () => {
  const [formData, setFormData] = useState({
    entryId: `MP${Date.now().toString().slice(-6)}`,
    cattleId: '',
    productionDate: new Date(),
    quantityLitres: '',
    shift: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [validatingCattle, setValidatingCattle] = useState(false);
  const [cattleExists, setCattleExists] = useState<boolean | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  const validateCattleId = async (cattleId: string) => {
    if (!cattleId.trim()) {
      setCattleExists(null);
      return;
    }

    setValidatingCattle(true);
    try {
      const { data, error } = await supabase
        .from('cattle_profiles')
        .select('cattle_id')
        .eq('cattle_id', cattleId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error validating cattle:', error);
        setCattleExists(null);
      } else {
        setCattleExists(!!data);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setCattleExists(null);
    } finally {
      setValidatingCattle(false);
    }
  };

  const saveOffline = (data: any) => {
    const offlineData = JSON.parse(localStorage.getItem('offline_milk') || '[]');
    offlineData.push({ ...data, id: Date.now().toString(), synced: false });
    localStorage.setItem('offline_milk', JSON.stringify(offlineData));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cattleId || !formData.quantityLitres) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(formData.quantityLitres) < 0) {
      toast({
        title: "Error",
        description: "Milk production cannot be negative",
        variant: "destructive"
      });
      return;
    }

    if (cattleExists === false) {
      toast({
        title: "Cattle Not Found",
        description: "The cattle ID you entered doesn't exist. Please register the cattle first or check the ID.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from('milk_production').insert({
        cattle_id: formData.cattleId,
        date: format(formData.productionDate, 'yyyy-MM-dd'),
        quantity_litres: parseFloat(formData.quantityLitres),
        shift: formData.shift || null,
        recorded_by: user.id || 'offline-user'
      });

      if (error) {
        console.error('Database error:', error);
        
        // Check if it's a foreign key constraint error
        if (error.code === '23503' && error.message.includes('cattle_id_fkey')) {
          toast({
            title: "Cattle Not Found",
            description: "The cattle ID doesn't exist. Please register the cattle first.",
            variant: "destructive"
          });
          return;
        }
        
        // Check if it's a network/connection error
        if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
          saveOffline(formData);
          toast({
            title: "Saved Offline 📱",
            description: "No internet connection. Data saved locally and will sync when online.",
            variant: "default"
          });
        } else {
          toast({
            title: "Database Error",
            description: error.message || "Failed to save milk production",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Success! ✅",
          description: `Milk production of ${formData.quantityLitres}L recorded successfully`,
        });
        
        // Reset form
        setFormData({
          entryId: `MP${Date.now().toString().slice(-6)}`,
          cattleId: '',
          productionDate: new Date(),
          quantityLitres: '',
          shift: '',
        });
        setCattleExists(null);
      }

    } catch (error) {
      console.error('Unexpected error:', error);
      saveOffline(formData);
      toast({
        title: "Network Error 📱",
        description: "Connection failed. Data saved locally and will sync when online.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCattleIdChange = (value: string) => {
    setFormData({ ...formData, cattleId: value });
    
    // Debounce validation
    const timeoutId = setTimeout(() => {
      validateCattleId(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation user={user} />
      
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-card border-0 animate-fade-in">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <span className="text-white text-3xl">🥛</span>
              </div>
              <CardTitle className="text-2xl font-bold text-white">Milk Production Logging</CardTitle>
              <CardDescription className="text-gray-300">Record daily milk production</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entryId" className="text-white">Entry ID</Label>
                    <Input
                      id="entryId"
                      value={formData.entryId}
                      className="glass-input text-white placeholder:text-gray-400 border-white/20"
                      readOnly
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cattleId" className="text-white">
                      Cattle ID *
                      {validatingCattle && <span className="text-blue-400 ml-2">Validating...</span>}
                      {cattleExists === true && <span className="text-green-400 ml-2">✓ Found</span>}
                      {cattleExists === false && <span className="text-red-400 ml-2">✗ Not found</span>}
                    </Label>
                    <Input
                      id="cattleId"
                      placeholder="Enter cattle ID"
                      value={formData.cattleId}
                      onChange={(e) => handleCattleIdChange(e.target.value)}
                      className={cn(
                        "glass-input text-white placeholder:text-gray-400 border-white/20",
                        cattleExists === false && "border-red-500"
                      )}
                    />
                    {cattleExists === false && (
                      <p className="text-red-400 text-sm">
                        Cattle not found. <Button 
                          type="button" 
                          variant="link" 
                          className="text-blue-400 p-0 h-auto"
                          onClick={() => navigate('/cattle-onboarding')}
                        >
                          Register cattle first
                        </Button>
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Production Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal glass-input text-white border-white/20 hover:bg-white/20",
                            !formData.productionDate && "text-gray-400"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.productionDate ? format(formData.productionDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white/10 backdrop-blur-lg border-white/20" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.productionDate}
                          onSelect={(date) => date && setFormData({ ...formData, productionDate: date })}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantityLitres" className="text-white">Milk Produced (Liters) *</Label>
                    <Input
                      id="quantityLitres"
                      type="number"
                      step="0.1"
                      placeholder="Enter milk production"
                      value={formData.quantityLitres}
                      onChange={(e) => setFormData({ ...formData, quantityLitres: e.target.value })}
                      min="0"
                      max="100"
                      className="glass-input text-white placeholder:text-gray-400 border-white/20"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shift" className="text-white">Shift (Optional)</Label>
                  <Input
                    id="shift"
                    placeholder="e.g., Morning, Evening"
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="glass-input text-white placeholder:text-gray-400 border-white/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">Recorded By</Label>
                  <Input 
                    value={user.name || 'Current User'} 
                    readOnly 
                    className="glass-input text-white placeholder:text-gray-400 border-white/20 opacity-70" 
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 glass-input text-white border-white/20 hover:bg-white/20"
                    onClick={() => navigate('/dashboard')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 glass-button text-white"
                    disabled={isLoading || cattleExists === false}
                  >
                    {isLoading ? 'Logging...' : 'Log Milk Production 🥛'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MilkLogging;
