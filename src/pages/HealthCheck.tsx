
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';
import { Heart, Thermometer, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';

interface Cattle {
  cattle_id: string;
  farmer_name: string;
  breed: string;
}

const HealthCheck = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [healthData, setHealthData] = useState({
    cattleId: '',
    temperature: '',
    issueType: '',
    issue: '',
    recoveryStatus: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  useEffect(() => {
    fetchCattle();
  }, []);

  const fetchCattle = async () => {
    try {
      const { data, error } = await supabase
        .from('cattle_profiles')
        .select('cattle_id, farmer_name, breed')
        .order('farmer_name');

      if (error) throw error;
      setCattle(data || []);
    } catch (error) {
      console.error('Error fetching cattle:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cattle list",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!healthData.cattleId || !healthData.temperature) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('health_checkups')
        .insert({
          cattle_id: healthData.cattleId,
          temperature: parseFloat(healthData.temperature),
          issue_type: healthData.issueType || null,
          issue: healthData.issue || null,
          recovery_status: healthData.recoveryStatus || null,
          added_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Health Check Recorded",
        description: "Health checkup has been successfully recorded.",
      });

      // Reset form
      setHealthData({
        cattleId: '',
        temperature: '',
        issueType: '',
        issue: '',
        recoveryStatus: ''
      });

    } catch (error) {
      console.error('Error recording health check:', error);
      toast({
        title: "Error",
        description: "Failed to record health checkup",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
        <div className="max-w-2xl mx-auto">
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
            <h1 className="text-4xl font-bold text-white animate-fade-in">Health Check</h1>
          </div>
          
          <Card className="glass-card border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <Heart className="w-8 h-8 mr-3 text-emerald-400" />
                Record Health Checkup
              </CardTitle>
              <CardDescription className="text-emerald-300">Monitor cattle health and track any issues</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cattle" className="text-emerald-200 flex items-center gap-2">
                    <span className="text-2xl">🐄</span>
                    Select Cattle *
                  </Label>
                  <Select value={healthData.cattleId} onValueChange={(value) => setHealthData(prev => ({ ...prev, cattleId: value }))}>
                    <SelectTrigger className="glass-input border-emerald-500/30 text-white">
                      <SelectValue placeholder="Choose cattle for health check" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-emerald-500/30 bg-slate-800/90 backdrop-blur-xl">
                      {cattle.map((animal) => (
                        <SelectItem key={animal.cattle_id} value={animal.cattle_id} className="text-white hover:bg-emerald-500/20">
                          {animal.cattle_id} - {animal.farmer_name} ({animal.breed})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature" className="text-emerald-200 flex items-center gap-2">
                    <Thermometer className="w-4 h-4" />
                    Temperature (°C) *
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    placeholder="Enter temperature"
                    value={healthData.temperature}
                    onChange={(e) => setHealthData(prev => ({ ...prev, temperature: e.target.value }))}
                    className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueType" className="text-emerald-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Issue Type (if any)
                  </Label>
                  <Select value={healthData.issueType} onValueChange={(value) => setHealthData(prev => ({ ...prev, issueType: value }))}>
                    <SelectTrigger className="glass-input border-emerald-500/30 text-white">
                      <SelectValue placeholder="Select issue type (optional)" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-emerald-500/30 bg-slate-800/90 backdrop-blur-xl">
                      <SelectItem value="Digestive" className="text-white hover:bg-emerald-500/20">Digestive</SelectItem>
                      <SelectItem value="Respiratory" className="text-white hover:bg-emerald-500/20">Respiratory</SelectItem>
                      <SelectItem value="Reproductive" className="text-white hover:bg-emerald-500/20">Reproductive</SelectItem>
                      <SelectItem value="Skin" className="text-white hover:bg-emerald-500/20">Skin</SelectItem>
                      <SelectItem value="Injury" className="text-white hover:bg-emerald-500/20">Injury</SelectItem>
                      <SelectItem value="Other" className="text-white hover:bg-emerald-500/20">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issue" className="text-emerald-200">Issue Description</Label>
                  <Textarea
                    id="issue"
                    placeholder="Describe any health issues or concerns..."
                    value={healthData.issue}
                    onChange={(e) => setHealthData(prev => ({ ...prev, issue: e.target.value }))}
                    className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300 min-h-[100px]"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recoveryStatus" className="text-emerald-200 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Recovery Status
                  </Label>
                  <Select value={healthData.recoveryStatus} onValueChange={(value) => setHealthData(prev => ({ ...prev, recoveryStatus: value }))}>
                    <SelectTrigger className="glass-input border-emerald-500/30 text-white">
                      <SelectValue placeholder="Select recovery status (optional)" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-emerald-500/30 bg-slate-800/90 backdrop-blur-xl">
                      <SelectItem value="Recovered" className="text-white hover:bg-emerald-500/20">Recovered</SelectItem>
                      <SelectItem value="Recovering" className="text-white hover:bg-emerald-500/20">Recovering</SelectItem>
                      <SelectItem value="Under Treatment" className="text-white hover:bg-emerald-500/20">Under Treatment</SelectItem>
                      <SelectItem value="No Improvement" className="text-white hover:bg-emerald-500/20">No Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3"
                >
                  {isLoading ? 'Recording...' : 'Record Health Check'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HealthCheck;
