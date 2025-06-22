
const getProfilePhotoKey = (userId: string) => `govardhini_profile_photo_${userId}`;

export const saveProfilePhoto = (photoUrl: string, userId: string) => {
  const photoData = {
    url: photoUrl,
    userId: userId,
    timestamp: Date.now()
  };
  localStorage.setItem(getProfilePhotoKey(userId), JSON.stringify(photoData));
};

export const getProfilePhoto = (userId: string): string | null => {
  try {
    const stored = localStorage.getItem(getProfilePhotoKey(userId));
    if (!stored) return null;
    
    const photoData = JSON.parse(stored);
    return photoData.url;
  } catch (error) {
    console.error('Error getting profile photo:', error);
    return null;
  }
};

export const clearProfilePhoto = (userId: string) => {
  localStorage.removeItem(getProfilePhotoKey(userId));
};

export const clearAllProfilePhotos = () => {
  // Clear all profile photos (for complete logout)
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('govardhini_profile_photo_')) {
      localStorage.removeItem(key);
    }
  });
};
