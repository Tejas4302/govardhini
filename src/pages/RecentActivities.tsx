
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

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
      case 'farmer': return '👨‍🌾';
      case 'cattle': return '🐄';
      case 'user': return '👤';
      default: return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'farmer': return 'from-green-500 to-emerald-600';
      case 'cattle': return 'from-amber-500 to-orange-600';
      case 'user': return 'from-purple-500 to-indigo-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation user={user} />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Recent Activities</CardTitle>
              <CardDescription className="text-gray-300">Latest system activities and updates</CardDescription>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="text-center text-white">Loading activities...</div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <Card key={activity.id} className="glass-card border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${getActivityColor(activity.type)} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{activity.description}</p>
                            <p className="text-gray-400 text-sm">
                              {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString()}
                            </p>
                          </div>
                          <Badge className="bg-white/20 text-white border-0">
                            {activity.type.toUpperCase()}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
