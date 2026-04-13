import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCamera, 
  FaSave,
  FaWallet,
  FaCheckCircle,
  FaEdit,
  FaTimes,
  FaCopy,
  FaShieldAlt,
  FaKey,
  FaUpload
} from 'react-icons/fa';
import { getProfileImageUrl, getUserInitials } from '../utils/imageUrl';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
  });

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

    // Show local preview immediately
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

      // Save to backend
      await api.put('/user/profile', { profilePicture: data.secure_url });

      // ✅ Force update user context + localStorage
      const updatedUser = {
        ...user,
        profilePicture: data.secure_url,
        _profileUpdated: Date.now(),
      };
      updateUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setPreviewUrl(null); // clear local preview — use Cloudinary URL now

      toast.success('Profile picture updated!');

      // Refresh from server to confirm
      setTimeout(async () => {
        try {
          const meRes = await api.get('/auth/me');
          if (meRes.data.success) {
            updateUser(meRes.data.user);
            localStorage.setItem('user', JSON.stringify(meRes.data.user));
          }
        } catch (_) {}
      }, 800);

    } catch (error) {
      console.error('Upload error:', error);
      setPreviewUrl(null);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setImageLoading(false);
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

  // Determine which image to show: local preview > Cloudinary > initials
  const displayImageUrl = previewUrl || getProfileImageUrl(user?.profilePicture);

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-0">
      
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Banner */}
        <div className="h-36 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 relative">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-10 w-20 h-20 bg-white rounded-full blur-2xl" />
            <div className="absolute bottom-2 right-20 w-16 h-16 bg-white rounded-full blur-xl" />
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-14 sm:-mt-16 gap-4">
            {/* Avatar with upload */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900 flex items-center justify-center overflow-hidden shadow-xl">
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
                  className={`text-4xl font-bold text-indigo-600 dark:text-indigo-300 items-center justify-center ${displayImageUrl ? 'hidden' : 'flex'}`}
                >
                  {getUserInitials(userName)}
                </span>
              </div>

              {/* Upload overlay button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={imageLoading}
                className="absolute bottom-1 right-1 w-9 h-9 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-60 border-2 border-white"
                title="Change photo"
              >
                {imageLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

            {/* User info */}
            <div className="flex-1 text-center sm:text-left sm:pb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{userName}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">
                  #{userAccountNumber}
                </p>
                {user?.accountNumber && (
                  <button
                    onClick={copyAccountNumber}
                    className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Copy account number"
                  >
                    <FaCopy className="text-sm" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Member since {formatDate(userCreatedAt)}
              </p>
            </div>

            {/* Edit button */}
            <div className="sm:pb-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors text-sm font-medium shadow-md"
                >
                  <FaEdit /> Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  <FaTimes /> Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Account Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
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
            className={`bg-gradient-to-br ${card.bg} rounded-xl p-5 shadow-md border ${card.border}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 ${card.iconBg} rounded-lg`}>
                <card.icon className={card.iconColor} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
            </div>
            <p className={`font-bold ${card.isLarge ? 'text-2xl' : 'text-xl'} ${card.valueColor} flex items-center gap-2`}>
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
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Personal Information</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed transition-colors"
                  placeholder="Your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  value={userEmail}
                  disabled
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed transition-colors"
                  placeholder="08012345678"
                />
              </div>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Number</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">#</span>
                <input
                  type="text"
                  value={userAccountNumber}
                  disabled
                  className="w-full pl-8 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-mono cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={copyAccountNumber}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  <FaCopy className="text-sm" />
                </button>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-3.5 text-gray-400 text-sm" />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                rows="3"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed resize-none transition-colors"
                placeholder="Your address"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <><FaSave /> Save Changes</>
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
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Security Settings</h2>
        <div className="space-y-3">
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
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <item.icon className="text-indigo-600 dark:text-indigo-400 text-sm" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
              <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${item.btnStyle}`}>
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