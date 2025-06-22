
const getProfilePhotoKey = (userId: string) => `govardhini_profile_photo_${userId}`;

export const saveProfilePhoto = (photoUrl: string, userId: string) => {
  const photoData = {
    url: photoUrl,
    userId: userId,
    timestamp: Date.now()
  };
  localStorage.setItem(getProfilePhotoKey(userId), JSON.stringify(photoData));
  
  // Also update the user object in localStorage immediately
  const userData = localStorage.getItem('govardhini_user');
  if (userData) {
    const user = JSON.parse(userData);
    user.profileImage = photoUrl;
    localStorage.setItem('govardhini_user', JSON.stringify(user));
  }
};

export const getProfilePhoto = (userId: string): string | null => {
  try {
    const stored = localStorage.getItem(getProfilePhotoKey(userId));
    if (!stored) {
      // Fallback: check if photo is in user object
      const userData = localStorage.getItem('govardhini_user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.profileImage || null;
      }
      return null;
    }
    
    const photoData = JSON.parse(stored);
    return photoData.url;
  } catch (error) {
    console.error('Error getting profile photo:', error);
    return null;
  }
};

export const clearProfilePhoto = (userId: string) => {
  localStorage.removeItem(getProfilePhotoKey(userId));
  
  // Also clear from user object
  const userData = localStorage.getItem('govardhini_user');
  if (userData) {
    const user = JSON.parse(userData);
    delete user.profileImage;
    localStorage.setItem('govardhini_user', JSON.stringify(user));
  }
};

export const clearAllProfilePhotos = () => {
  // Clear all profile photos (for complete logout)
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('govardhini_profile_photo_')) {
      localStorage.removeItem(key);
    }
  });
};

export const initializeProfilePhoto = (userId: string) => {
  // When user logs in, restore their profile photo to user object if it exists
  const storedPhoto = getProfilePhoto(userId);
  if (storedPhoto) {
    const userData = localStorage.getItem('govardhini_user');
    if (userData) {
      const user = JSON.parse(userData);
      if (!user.profileImage || user.profileImage !== storedPhoto) {
        user.profileImage = storedPhoto;
        localStorage.setItem('govardhini_user', JSON.stringify(user));
      }
    }
  }
};
