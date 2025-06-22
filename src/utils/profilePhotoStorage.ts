
const PROFILE_PHOTO_KEY = 'govardhini_profile_photo';

export const saveProfilePhoto = (photoUrl: string, userId: string) => {
  const photoData = {
    url: photoUrl,
    userId: userId,
    timestamp: Date.now()
  };
  localStorage.setItem(PROFILE_PHOTO_KEY, JSON.stringify(photoData));
};

export const getProfilePhoto = (userId: string): string | null => {
  try {
    const stored = localStorage.getItem(PROFILE_PHOTO_KEY);
    if (!stored) return null;
    
    const photoData = JSON.parse(stored);
    // Return photo only if it belongs to the current user
    if (photoData.userId === userId) {
      return photoData.url;
    }
    return null;
  } catch (error) {
    console.error('Error getting profile photo:', error);
    return null;
  }
};

export const clearProfilePhoto = () => {
  localStorage.removeItem(PROFILE_PHOTO_KEY);
};
