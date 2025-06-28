import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

const HealthCheck = () => {
  const [formData, setFormData] = useState({
    entryId: `HC${Date.now().toString().slice(-6)}`,
    cattleId: '',
    checkDate: new Date(),
    temperature: '',
    issue: '',
    issueType: '',
    recoveryStatus: '',
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
    const offlineData = JSON.parse(localStorage.getItem('offline_health') || '[]');
    offlineData.push({ ...data, id: Date.now().toString(), synced: false });
    localStorage.setItem('offline_health', JSON.stringify(offlineData));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cattleId || !formData.temperature) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
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
      const healthCheckData = {
        cattle_id: formData.cattleId,
        date: format(formData.checkDate, 'yyyy-MM-dd'),
        temperature: parseFloat(formData.temperature),
        issue: formData.issue || null,
        issue_type: formData.issueType || null,
        recovery_status: formData.recoveryStatus || null,
        added_by: user.id || 'offline-user'
      };

      const { error } = await supabase
        .from('health_checkups')
        .insert(healthCheckData);

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
            description: error.message || "Failed to save health check",
            variant: "destructive"
          });
        }
      } else {
        // Show alert if health issue detected
        if (parseFloat(formData.temperature) > 39.5 || formData.issue !== '') {
          toast({
            title: "Health Alert! 🚨",
            description: "Health issue detected - alert has been recorded",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Success! ✅",
            description: "Health check recorded successfully",
          });
        }
        
        // Reset form
        setFormData({
          entryId: `HC${Date.now().toString().slice(-6)}`,
          cattleId: '',
          checkDate: new Date(),
          temperature: '',
          issue: '',
          issueType: '',
          recoveryStatus: '',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900">
      <Navigation user={user} />
      
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-card border-0 animate-fade-in">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <span className="text-white text-3xl">🩺</span>
              </div>
              <CardTitle className="text-2xl font-bold text-white">Health Check</CardTitle>
              <CardDescription className="text-gray-300">Record cattle health monitoring</CardDescription>
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
                    <Label className="text-white">Check Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal glass-input text-white border-white/20 hover:bg-white/20",
                            !formData.checkDate && "text-gray-400"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.checkDate ? format(formData.checkDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white/10 backdrop-blur-lg border-white/20" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.checkDate}
                          onSelect={(date) => date && setFormData({ ...formData, checkDate: date })}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="temperature" className="text-white">Body Temperature (°C) *</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      placeholder="Enter temperature"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      min="35"
                      max="45"
                      className="glass-input text-white placeholder:text-gray-400 border-white/20"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="issueType" className="text-white">Issue Type (if any)</Label>
                  <Input
                    id="issueType"
                    placeholder="e.g., Respiratory, Digestive, Injury, Other"
                    value={formData.issueType}
                    onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                    className="glass-input text-white placeholder:text-gray-400 border-white/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="issue" className="text-white">Health Issue Description</Label>
                  <Textarea
                    id="issue"
                    placeholder="Describe any health issues observed (optional)"
                    value={formData.issue}
                    onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                    className="min-h-20 glass-input text-white placeholder:text-gray-400 border-white/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recoveryStatus" className="text-white">Recovery Status</Label>
                  <Input
                    id="recoveryStatus"
                    placeholder="e.g., Ongoing, Recovered"
                    value={formData.recoveryStatus}
                    onChange={(e) => setFormData({ ...formData, recoveryStatus: e.target.value })}
                    className="glass-input text-white placeholder:text-gray-400 border-white/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">Reported By</Label>
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
                    Back to Dashboard
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 glass-button text-white"
                    disabled={isLoading || cattleExists === false}
                  >
                    {isLoading ? 'Saving...' : 'Record Health Check 🩺'}
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

export default HealthCheck;
