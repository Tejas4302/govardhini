
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { User as UserIcon, Phone as PhoneIcon, Image as ImageIcon, Edit as EditIcon } from 'lucide-react';

interface UserData {
  id: string;
  email?: string;
  phone?: string;
  role: string;
  name: string;
}

const Profile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('govardhini_user');
    if (!userData) {
      navigate('/auth');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData({
      fullName: parsedUser.name,
      phoneNumber: parsedUser.phone || ''
    });
  }, [navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Try to update the users table (which matches the current structure)
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName,
          phone_number: formData.phoneNumber
        })
        .eq('id', user.id);

      if (error) {
        console.error('Update error:', error);
        
        // Show appropriate error message based on error type
        if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
          toast({
            title: "Network Error",
            description: "Unable to connect. Please check your internet connection and try again.",
            variant: "destructive"
          });
        } else if (error.code === '42P01') {
          toast({
            title: "Database Error",
            description: "Profile table not found. Please contact support.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: error.message || "Failed to update profile",
            variant: "destructive"
          });
        }
        return;
      }

      // Update localStorage
      const updatedUser = {
        ...user,
        name: formData.fullName,
        phone: formData.phoneNumber
      };
      localStorage.setItem('govardhini_user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Network Error",
        description: "Connection failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation user={user} />
      
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 animate-fade-in">Profile Settings</h1>
          
          <Card className="glass-card border-0 text-white animate-slide-up">
            <CardHeader className="text-center pb-6">
              <div className="relative mx-auto w-32 h-32 mb-4">
                <Avatar className="w-32 h-32 border-4 border-white/20">
                  <AvatarImage src={profileImage} alt="Profile" />
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-2xl">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 glass-button border-0 p-2 h-10 w-10"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              <CardTitle className="text-2xl font-bold text-white">{user.name}</CardTitle>
              <p className="text-gray-300">{user.role.replace('_', ' ').toUpperCase()}</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-200 flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="glass-input text-white placeholder:text-gray-400"
                      disabled={isLoading}
                    />
                  ) : (
                    <div className="glass-input p-3 text-white rounded-md">
                      {user.name}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-gray-200 flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4" />
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="glass-input text-white placeholder:text-gray-400"
                      disabled={isLoading}
                    />
                  ) : (
                    <div className="glass-input p-3 text-white rounded-md">
                      {user.phone || 'Not set'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200">Role</Label>
                  <div className="glass-input p-3 text-gray-400 rounded-md bg-gray-700/30">
                    {user.role.replace('_', ' ').toUpperCase()} (Cannot be changed)
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="glass-button flex-1 text-white border-0"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          fullName: user.name,
                          phoneNumber: user.phone || ''
                        });
                      }}
                      disabled={isLoading}
                      className="glass-card border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="glass-button flex-1 text-white border-0 flex items-center gap-2"
                  >
                    <EditIcon className="w-4 h-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
