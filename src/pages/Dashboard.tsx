
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';

interface UserData {
  email: string;
  role: string;
  name: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('govardhini_user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  if (!user) return null;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'office_staff': return 'bg-blue-100 text-blue-800';
      case 'field_officer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuickActions = () => {
    const baseActions = [
      { title: 'Farmer Registration', desc: 'Register new farmers', icon: '👨‍🌾', path: '/farmer-onboarding' },
      { title: 'Cattle Onboarding', desc: 'Add new cattle', icon: '🐄', path: '/cattle-onboarding' },
      { title: 'Health Check', desc: 'Record cattle health', icon: '❤️', path: '/health-check' },
      { title: 'Milk Production', desc: 'Log milk production', icon: '🥛', path: '/milk-logging' },
    ];

    if (user.role === 'admin' || user.role === 'office_staff') {
      baseActions.push(
        { title: 'Feed Requests', desc: 'Manage feed requests', icon: '🌾', path: '/feed-requests' },
        { title: 'Analytics', desc: 'View reports & charts', icon: '📊', path: '/analytics' }
      );
    }

    return baseActions;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-orange-50">
      <Navigation user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome back, {user.name}!
              </h1>
              <div className="flex items-center gap-3">
                <Badge className={getRoleBadgeColor(user.role)}>
                  {user.role.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-gray-600">• Today's Dashboard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Farmers</p>
                  <p className="text-3xl font-bold">248</p>
                </div>
                <div className="text-4xl">👨‍🌾</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100">Total Cattle</p>
                  <p className="text-3xl font-bold">892</p>
                </div>
                <div className="text-4xl">🐄</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Today's Milk (L)</p>
                  <p className="text-3xl font-bold">2,847</p>
                </div>
                <div className="text-4xl">🥛</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">Health Alerts</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <div className="text-4xl">🚨</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Quick Actions</CardTitle>
            <CardDescription>Common tasks for your role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getQuickActions().map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center space-y-3 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                  onClick={() => navigate(action.path)}
                >
                  <div className="text-3xl">{action.icon}</div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-800">{action.title}</p>
                    <p className="text-sm text-gray-600">{action.desc}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
