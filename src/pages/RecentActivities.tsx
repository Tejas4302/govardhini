
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Clock, Users, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Activity {
  id: string;
  type: string;
  description: string;
  date: string;
  user?: string;
}

const RecentActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      const activities: Activity[] = [];

      // Fetch recent farmers
      const { data: farmers } = await supabase
        .from('farmers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      farmers?.forEach(farmer => {
        activities.push({
          id: `farmer-${farmer.id}`,
          type: 'farmer',
          description: `New farmer registered: ${farmer.full_name}`,
          date: farmer.created_at,
        });
      });

      // Fetch recent cattle
      const { data: cattle } = await supabase
        .from('cattle_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      cattle?.forEach(animal => {
        activities.push({
          id: `cattle-${animal.id}`,
          type: 'cattle',
          description: `New cattle added: ${animal.cattle_id} (${animal.type})`,
          date: animal.created_at,
        });
      });

      // Fetch recent users
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      users?.forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: 'user',
          description: `New user registration: ${user.full_name} (${user.designation})`,
          date: user.created_at,
        });
      });

      // Sort all activities by date
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setActivities(activities.slice(0, 20));

    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch recent activities",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'farmer': return Users;
      case 'cattle': return () => <span className="text-xl">🐄</span>; // Cow icon instead of Beef
      case 'user': return User;
      default: return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'farmer': return 'from-emerald-500 to-green-600';
      case 'cattle': return 'from-amber-500 to-orange-600';
      case 'user': return 'from-teal-500 to-cyan-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-teal-900">
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
            <h1 className="text-4xl font-bold text-white animate-fade-in">Recent Activities</h1>
          </div>
          
          <Card className="agricultural-glass border-emerald-500/20 backdrop-blur-md animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <Clock className="w-8 h-8 mr-3 text-emerald-400" />
                System Activities
              </CardTitle>
              <CardDescription className="text-emerald-300">Latest system activities and updates</CardDescription>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="text-center text-white py-8">
                  <div className="animate-pulse">Loading activities...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity, index) => {
                    const IconComponent = getActivityIcon(activity.type);
                    return (
                      <Card key={activity.id} className="agricultural-glass border-emerald-500/10 backdrop-blur-md hover:border-emerald-400/30 transition-all animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 bg-gradient-to-r ${getActivityColor(activity.type)} rounded-xl flex items-center justify-center shadow-lg`}>
                              {typeof IconComponent === 'function' && IconComponent.name === '' ? 
                                <IconComponent /> : 
                                <IconComponent className="w-6 h-6 text-white" />
                              }
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium">{activity.description}</p>
                              <p className="text-emerald-400 text-sm">
                                {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString()}
                              </p>
                            </div>
                            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                              {activity.type.toUpperCase()}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;
