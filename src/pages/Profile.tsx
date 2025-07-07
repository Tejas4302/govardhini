
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Camera } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState({
    fullName: '',
    phoneNumber: '',
    designation: '',
    profileImageUrl: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  useEffect(() => {
    if (user.id) {
      setProfile({
        fullName: user.name || '',
        phoneNumber: user.phone || '',
        designation: user.designation || '',
        profileImageUrl: user.profile_image_url || ''
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.fullName,
          designation: profile.designation
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local storage
      const updatedUser = {
        ...user,
        name: profile.fullName,
        designation: profile.designation
      };
      localStorage.setItem('govardhini_user', JSON.stringify(updatedUser));

      toast({
        title: "Success! ✅",
        description: "Profile updated successfully.",
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-teal-900">
      <Navigation user={user} />
      
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-48 h-48 md:w-96 md:h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mr-4 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-500/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-white animate-fade-in">Profile</h1>
          </div>

          <Card className="agricultural-glass border-emerald-500/20 backdrop-blur-md animate-fade-in">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.profileImageUrl} />
                    <AvatarFallback className="bg-emerald-500 text-white text-xl">
                      {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 border-emerald-400/30 bg-emerald-500/20 hover:bg-emerald-500/30"
                    onClick={() => {/* TODO: Implement image upload */}}
                  >
                    <Camera className="w-4 h-4 text-emerald-400" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white">{profile.fullName || 'User Profile'}</CardTitle>
              <CardDescription className="text-emerald-300">{profile.designation}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-emerald-200">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profile.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300/70"
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-emerald-200">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={profile.phoneNumber}
                      className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300/70 opacity-60"
                      disabled={true}
                    />
                    <p className="text-xs text-emerald-300/70">Phone number cannot be changed</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="designation" className="text-emerald-200">Designation</Label>
                  <Input
                    id="designation"
                    value={profile.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    className="glass-input border-emerald-500/30 text-white placeholder:text-emerald-300/70"
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="flex gap-4 pt-6">
                  {!isEditing ? (
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/20 hover:border-emerald-400"
                        onClick={() => setIsEditing(false)}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Updating...' : 'Save Changes'}
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
