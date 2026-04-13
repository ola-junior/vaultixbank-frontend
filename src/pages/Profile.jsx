import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCamera, FaSave,
  FaWallet, FaCheckCircle, FaEdit, FaTimes, FaCopy,
  FaShieldAlt, FaKey, FaImage
} from 'react-icons/fa';
import { getProfileImageUrl, getUserInitials } from '../utils/imageUrl';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
  });

  // Default banner or user's custom banner
  const defaultBanner = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=300&fit=crop';
  
  // Get current banner with proper initialization
  const getCurrentBanner = () => {
    if (bannerPreview) return bannerPreview;
    if (user?.bannerImage) return user.bannerImage;
    return defaultBanner;
  };

  // Reset previews when user data changes
  useEffect(() => {
    setPreviewUrl(null);
    setBannerPreview(null);
  }, [user?.profilePicture, user?.bannerImage]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/user/profile', formData);
      const updated = { ...user, ...response.data.data };
      updateUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setImageLoading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('upload_preset', 'vaultix_profiles');
      uploadData.append('cloud_name', 'dlfo69li4');

      const response = await fetch('https://api.cloudinary.com/v1_1/dlfo69li4/image/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await response.json();
      if (!data.secure_url) throw new Error(data.error?.message || 'Upload failed');

      await api.put('/user/profile', { profilePicture: data.secure_url });

      const updatedUser = { ...user, profilePicture: data.secure_url };
      updateUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setPreviewUrl(null);

      toast.success('Profile picture updated!');
    } catch (error) {
      console.error('Upload error:', error);
      setPreviewUrl(null);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Banner image should be less than 10MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setBannerPreview(localPreview);
    setBannerLoading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('upload_preset', 'vaultix_profiles');
      uploadData.append('cloud_name', 'dlfo69li4');

      const response = await fetch('https://api.cloudinary.com/v1_1/dlfo69li4/image/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await response.json();
      if (!data.secure_url) throw new Error(data.error?.message || 'Upload failed');

      await api.put('/user/profile', { bannerImage: data.secure_url });

      const updatedUser = { ...user, bannerImage: data.secure_url };
      updateUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setBannerPreview(null);

      toast.success('Banner updated successfully!');
    } catch (error) {
      console.error('Banner upload error:', error);
      setBannerPreview(null);
      toast.error('Failed to upload banner. Please try again.');
    } finally {
      setBannerLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
      address: user?.address || '',
    });
  };

  const copyAccountNumber = async () => {
    if (!user?.accountNumber) return;
    try {
      await navigator.clipboard.writeText(user.accountNumber);
      toast.success('Account number copied!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const userBalance = user?.balance ?? 0;
  const userAccountNumber = user?.accountNumber || 'N/A';
  const userEmail = user?.email || 'N/A';
  const userName = user?.name || 'User';
  const userCreatedAt = user?.createdAt || null;

  const displayImageUrl = previewUrl || getProfileImageUrl(user?.profilePicture);
  const displayBannerUrl = getCurrentBanner();

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-0">
      
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Banner Section - FIXED OVERLAY */}
        <div className="relative h-32 sm:h-36 md:h-44">
          <img
            key={displayBannerUrl}
            src={displayBannerUrl}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
          
          {/* FIX: Lighter gradient that doesn't cover text on any screen */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
          
          {/* Banner upload button - stays visible but doesn't interfere with text */}
          <button
            onClick={() => bannerInputRef.current?.click()}
            disabled={bannerLoading}
            className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border border-white/20 z-10"
          >
            {bannerLoading ? (
              <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaImage className="text-xs" />
            )}
            <span className="hidden sm:inline">Change Cover</span>
            <span className="sm:hidden">Cover</span>
          </button>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            disabled={bannerLoading}
            className="hidden"
          />
        </div>

        {/* Profile Info Section - FIXED LAYOUT FOR ALL SCREENS */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 sm:-mt-14 md:-mt-16 gap-3 sm:gap-4">
            
            {/* Avatar with upload */}
            <div className="relative flex-shrink-0 z-10">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-3 sm:border-4 border-white dark:border-gray-800 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900 flex items-center justify-center overflow-hidden shadow-xl">
                {displayImageUrl ? (
                  <img
                    key={displayImageUrl}
                    src={displayImageUrl}
                    alt={userName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span
                  className={`text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-300 items-center justify-center ${displayImageUrl ? 'hidden' : 'flex'}`}
                >
                  {getUserInitials(userName)}
                </span>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={imageLoading}
                className="absolute bottom-0 sm:bottom-1 right-0 sm:right-1 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-60 border-2 border-white"
                title="Change photo"
              >
                {imageLoading ? (
                  <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaCamera className="text-white text-xs" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={imageLoading}
                className="hidden"
              />
            </div>

            {/* User info - FIXED: Better contrast and responsive spacing */}
            <div className="flex-1 text-center sm:text-left sm:pb-2 mt-2 sm:mt-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
                {userName}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 mt-1">
                <p className="text-gray-600 dark:text-gray-400 font-mono text-xs sm:text-sm">
                  #{userAccountNumber}
                </p>
                {user?.accountNumber && (
                  <button
                    onClick={copyAccountNumber}
                    className="p-1 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Copy account number"
                  >
                    <FaCopy className="text-xs sm:text-sm" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 sm:mt-1">
                Member since {formatDate(userCreatedAt)}
              </p>
            </div>

            {/* Edit button */}
            <div className="sm:pb-2 mt-2 sm:mt-0">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors text-xs sm:text-sm font-medium shadow-md"
                >
                  <FaEdit className="text-xs sm:text-sm" /> 
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm font-medium"
                >
                  <FaTimes className="text-xs sm:text-sm" /> 
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Account Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
      >
        {[
          {
            icon: FaWallet,
            label: 'Available Balance',
            value: formatCurrency(userBalance),
            bg: 'from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20',
            border: 'border-indigo-100 dark:border-indigo-800',
            iconBg: 'bg-indigo-100 dark:bg-indigo-900/50',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
            valueColor: 'text-gray-900 dark:text-white',
            isLarge: true,
          },
          {
            icon: FaCheckCircle,
            label: 'Account Status',
            value: 'Active',
            valueExtra: true,
            bg: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
            border: 'border-green-100 dark:border-green-800',
            iconBg: 'bg-green-100 dark:bg-green-900/50',
            iconColor: 'text-green-600 dark:text-green-400',
            valueColor: 'text-green-600 dark:text-green-400',
          },
          {
            icon: FaUser,
            label: 'Account Type',
            value: 'Premium Savings',
            bg: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
            border: 'border-purple-100 dark:border-purple-800',
            iconBg: 'bg-purple-100 dark:bg-purple-900/50',
            iconColor: 'text-purple-600 dark:text-purple-400',
            valueColor: 'text-gray-900 dark:text-white',
          },
        ].map((card, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${card.bg} rounded-xl p-4 sm:p-5 shadow-md border ${card.border}`}
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className={`p-1.5 sm:p-2 ${card.iconBg} rounded-lg`}>
                <card.icon className={`${card.iconColor} text-sm sm:text-base`} />
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
            </div>
            <p className={`font-bold ${card.isLarge ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'} ${card.valueColor} flex items-center gap-2`}>
              {card.valueExtra && (
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
              {card.value}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Personal Info Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6"
      >
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Personal Information</h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                <input
                  type="email"
                  value={userEmail}
                  disabled
                  className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm sm:text-base"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Phone Number</label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                  placeholder="08012345678"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Account Number</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm sm:text-base">#</span>
                <input
                  type="text"
                  value={userAccountNumber}
                  disabled
                  className="w-full pl-7 sm:pl-8 pr-10 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-mono cursor-not-allowed text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={copyAccountNumber}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  <FaCopy className="text-xs sm:text-sm" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Address</label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400 text-xs sm:text-sm" />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                rows="3"
                className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed resize-none transition-colors text-sm sm:text-base"
                placeholder="Your address"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <><FaSave className="text-sm sm:text-base" /> Save Changes</>
                )}
              </button>
            </div>
          )}
        </form>
      </motion.div>

      {/* Security Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6"
      >
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5">Security Settings</h2>
        <div className="space-y-2 sm:space-y-3">
          {[
            {
              icon: FaShieldAlt,
              title: 'Two-Factor Authentication',
              desc: 'Add an extra layer of security to your account',
              btnLabel: 'Enable',
              btnStyle: 'border border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
            },
            {
              icon: FaKey,
              title: 'Change Password',
              desc: 'Update your password regularly for better security',
              btnLabel: 'Update',
              btnStyle: 'border border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
            },
          ].map((item, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                  <item.icon className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
              <button className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${item.btnStyle}`}>
                {item.btnLabel}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;