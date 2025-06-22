
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
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

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
        saveOffline(formData);
        toast({
          title: "Saved Offline 📱",
          description: "No internet connection. Data saved locally and will sync when online.",
          variant: "default"
        });
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

    } catch (error) {
      console.error('Error:', error);
      saveOffline(formData);
      toast({
        title: "Saved Offline 📱",
        description: "Data saved locally. Will sync when connection is restored.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-orange-50">
      <Navigation user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/90 backdrop-blur shadow-xl border-0">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-3xl">🩺</span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Health Check</CardTitle>
              <CardDescription>Record cattle health monitoring</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entryId">Entry ID</Label>
                    <Input
                      id="entryId"
                      value={formData.entryId}
                      className="bg-gray-50"
                      readOnly
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cattleId">Cattle ID *</Label>
                    <Input
                      id="cattleId"
                      placeholder="Enter cattle ID"
                      value={formData.cattleId}
                      onChange={(e) => setFormData({ ...formData, cattleId: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Check Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.checkDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.checkDate ? format(formData.checkDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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
                    <Label htmlFor="temperature">Body Temperature (°C) *</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      placeholder="Enter temperature"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      min="35"
                      max="45"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="issueType">Issue Type (if any)</Label>
                  <Input
                    id="issueType"
                    placeholder="e.g., Respiratory, Digestive, Injury, Other"
                    value={formData.issueType}
                    onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="issue">Health Issue Description</Label>
                  <Textarea
                    id="issue"
                    placeholder="Describe any health issues observed (optional)"
                    value={formData.issue}
                    onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                    className="min-h-20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recoveryStatus">Recovery Status</Label>
                  <Input
                    id="recoveryStatus"
                    placeholder="e.g., Ongoing, Recovered"
                    value={formData.recoveryStatus}
                    onChange={(e) => setFormData({ ...formData, recoveryStatus: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Reported By</Label>
                  <Input value={user.name || 'Current User'} readOnly className="bg-gray-50" />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/dashboard')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                    disabled={isLoading}
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
