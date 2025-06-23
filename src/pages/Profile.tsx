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
import { User as UserIcon, Phone as PhoneIcon, Image as ImageIcon, Edit as EditIcon, Lock as LockIcon, Trash2 as TrashIcon } from 'lucide-react';
import { profilePhotoService } from '@/services/profilePhotoService';

interface UserData {
  id: string;
  email?: string;
  phone?: string;
  role: string;
  name: string;
  profileImage?: string;
}

const Profile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteSection, setShowDeleteSection] = useState(false);

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
    
    // Load profile photo from Supabase
    loadProfilePhoto(parsedUser.id);
  }, [navigate]);

  const loadProfilePhoto = async (userId: string) => {
    try {
      const photoUrl = await profilePhotoService.getProfilePhotoUrl(userId);
      if (photoUrl) {
        setProfileImage(photoUrl);
        // Update user object with the loaded photo
        if (user) {
          const updatedUser = { ...user, profileImage: photoUrl };
          localStorage.setItem('govardhini_user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Error loading profile photo:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      setIsUploadingPhoto(true);
      
      try {
        const result = await profilePhotoService.uploadProfilePhoto(file, user.id);
        
        if (result.success && result.url) {
          setProfileImage(result.url);
          
          // Update local user state
          const updatedUser = { ...user, profileImage: result.url };
          localStorage.setItem('govardhini_user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          
          toast({
            title: "Success",
            description: "Profile photo updated successfully"
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to upload profile photo",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error uploading photo:', error);
        toast({
          title: "Error",
          description: "Failed to upload profile photo",
          variant: "destructive"
        });
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName,
          phone_number: formData.phoneNumber
        })
        .eq('id', user.id);

      if (error) {
        console.error('Update error:', error);
        
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

      const updatedUser = {
        ...user,
        name: formData.fullName,
        phone: formData.phoneNumber,
        profileImage: profileImage
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

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        console.error('Password update error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to update password",
          variant: "destructive"
        });
        return;
      }

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
      
      toast({
        title: "Success",
        description: "Password updated successfully"
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    if (deleteConfirmation !== 'DELETE') {
      toast({
        title: "Error",
        description: "Please type 'DELETE' to confirm account deletion",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    try {
      // Delete profile photo first
      await profilePhotoService.deleteProfilePhoto(user.id);
      
      // Delete user from the users table
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (error) {
        console.error('Delete error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete account",
          variant: "destructive"
        });
        return;
      }

      localStorage.removeItem('govardhini_user');
      
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted",
      });
      
      navigate('/auth');

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900">
      <Navigation user={user} />
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-white mb-8 animate-fade-in">Profile Settings</h1>
          
          <Card className="glass-card border-0 text-white animate-slide-up">
            <CardHeader className="text-center pb-6">
              <div className="relative mx-auto w-32 h-32 mb-4">
                <Avatar className="w-32 h-32 border-4 border-white/20">
                  <AvatarImage src={profileImage} alt="Profile" />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white text-2xl">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 glass-button border-0 p-2 h-10 w-10"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={isUploadingPhoto}
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
              {isUploadingPhoto && (
                <p className="text-sm text-gray-400">Uploading photo...</p>
              )}
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

          <Card className="glass-card border-0 text-white animate-slide-up">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <LockIcon className="w-5 h-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isChangingPassword ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-gray-200">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="glass-input text-white placeholder:text-gray-400"
                      placeholder="Enter new password"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-200">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="glass-input text-white placeholder:text-gray-400"
                      placeholder="Confirm new password"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handlePasswordChange}
                      disabled={isLoading}
                      className="glass-button flex-1 text-white border-0"
                    >
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                      disabled={isLoading}
                      className="glass-card border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-gray-300">Update your account password</p>
                  <Button
                    onClick={() => setIsChangingPassword(true)}
                    className="glass-button text-white border-0 flex items-center gap-2"
                  >
                    <LockIcon className="w-4 h-4" />
                    Change Password
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-0 text-white animate-slide-up border-red-500/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-400 flex items-center gap-2">
                <TrashIcon className="w-5 h-5" />
                Delete Account
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {showDeleteSection ? (
                <div className="space-y-4">
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <h3 className="text-red-400 font-semibold mb-2">⚠️ Warning</h3>
                    <p className="text-red-300 text-sm">
                      This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deleteConfirmation" className="text-gray-200">
                      Type <span className="font-bold text-red-400">DELETE</span> to confirm
                    </Label>
                    <Input
                      id="deleteConfirmation"
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      className="glass-input text-white placeholder:text-gray-400 border-red-500/30"
                      placeholder="Type DELETE to confirm"
                      disabled={isDeleting}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                      className="bg-red-600 hover:bg-red-700 text-white border-0 flex-1"
                    >
                      {isDeleting ? 'Deleting Account...' : 'Delete My Account'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteSection(false);
                        setDeleteConfirmation('');
                      }}
                      disabled={isDeleting}
                      className="glass-card border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-300">Permanently delete your account</p>
                    <p className="text-sm text-red-400">This action cannot be undone</p>
                  </div>
                  <Button
                    onClick={() => setShowDeleteSection(true)}
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-700/20 hover:border-red-500 flex items-center gap-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
