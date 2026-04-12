/**
 * Get the full URL for a profile picture
 * @param {string} profilePicture - The profile picture filename
 * @returns {string|null} - Full URL or null for default avatar
 */
export const getProfileImageUrl = (profilePicture) => {
  if (!profilePicture || profilePicture === 'default-avatar.png') {
    return null;
  }
  
  // Remove '/api' from the end if present
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  return `${API_BASE}/uploads/profiles/${profilePicture}`;
};

/**
 * Get user initials for avatar fallback
 * @param {string} name - User's full name
 * @returns {string} - Initials (max 2 characters)
 */
export const getUserInitials = (name) => {
  if (!name) return 'U';
  const names = name.trim().split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return names[0][0].toUpperCase();
};

/**
 * Get first name only
 * @param {string} name - User's full name
 * @returns {string} - First name
 */
export const getFirstName = (name) => {
  if (!name) return 'User';
  return name.trim().split(' ')[0];
};