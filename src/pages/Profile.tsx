import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getProfilePhoto, saveProfilePhoto, clearProfilePhoto, initializeProfilePhoto } from '@/utils/profilePhotoStorage';
import ProfileCard from '@/components/ProfileCard';
import PasswordCard from '@/components/PasswordCard';
import DeleteAccountCard from '@/components/DeleteAccountCard';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [formData, setFormData] = useState({ fullName: '', phoneNumber: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const navigate = useNavigate();
  const { toast } = useToast();

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
    initializeProfilePhoto(parsedUser.id);
    const persistentPhoto = getProfilePhoto(parsedUser.id);
    setProfileImage(persistentPhoto || parsedUser.profileImage || '');
  }, [navigate]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageDataUrl = reader.result;
        setProfileImage(imageDataUrl);
        if (user) {
          saveProfilePhoto(imageDataUrl, user.id);
          setUser(prev => prev ? { ...prev, profileImage: imageDataUrl } : null);
          toast({ title: 'Success', description: 'Profile photo updated successfully' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ full_name: formData.fullName, phone_number: formData.phoneNumber })
        .eq('id', user.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }

      const updatedUser = {
        ...user,
        name: formData.fullName,
        phone: formData.phoneNumber,
        profileImage
      };
      localStorage.setItem('govardhini_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      toast({ title: 'Success', description: 'Profile updated successfully' });
    } catch (err) {
      toast({ title: 'Network Error', description: 'Connection failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast({ title: 'Error', description: 'Please fill in all password fields', variant: 'destructive' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters long', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
      toast({ title: 'Success', description: 'Password updated successfully' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update password. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmation !== 'DELETE') {
      toast({ title: 'Error', description: "Please type 'DELETE' to confirm account deletion", variant: 'destructive' });
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase.from('users').delete().eq('id', user.id);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      localStorage.removeItem('govardhini_user');
      clearProfilePhoto(user.id);
      toast({ title: 'Account Deleted', description: 'Your account has been permanently deleted' });
      navigate('/auth');
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete account. Please try again.', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

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
          {user ? (
            <>
              <ProfileCard
                user={user}
                formData={formData}
                isEditing={isEditing}
                isLoading={isLoading}
                profileImage={profileImage}
                handleImageUpload={handleImageUpload}
                handleSave={handleSave}
                setIsEditing={setIsEditing}
                setFormData={setFormData}
                setProfileImage={setProfileImage}
              />
              <PasswordCard
                passwordData={passwordData}
                setPasswordData={setPasswordData}
                handlePasswordChange={handlePasswordChange}
                isChangingPassword={isChangingPassword}
                setIsChangingPassword={setIsChangingPassword}
                isLoading={isLoading}
              />
              <DeleteAccountCard
                user={user}
                isDeleting={isDeleting}
                deleteConfirmation={deleteConfirmation}
                setDeleteConfirmation={setDeleteConfirmation}
                showDeleteSection={showDeleteSection}
                setShowDeleteSection={setShowDeleteSection}
                handleDeleteAccount={handleDeleteAccount}
              />
            </>
          ) : (
            <div className="text-white text-center mt-20 text-xl">
              Loading user profile...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
