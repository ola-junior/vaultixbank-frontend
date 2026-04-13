import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  FaUser, 
  FaSignOutAlt, 
  FaCog, 
  FaBell, 
  FaMoon, 
  FaSun,
  FaBars,
  FaShieldAlt,
  FaChevronDown
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfileImageUrl, getUserInitials } from '../../utils/imageUrl';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [imgError, setImgError] = useState(false);

  // Reset image error when user profilePicture changes
  useEffect(() => {
    setImgError(false);
  }, [user?.profilePicture]);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    fetchUnreadCount();
    fetchRecentNotifications();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch { /* silently fail */ }
  };

  const fetchRecentNotifications = async () => {
    try {
      const response = await api.get('/notifications?limit=5');
      setRecentNotifications(response.data.data || []);
    } catch { /* silently fail */ }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = () => {
    setShowNotifications(false);
    navigate('/notifications');
  };

  const getNotificationIcon = (type) => {
    const icons = { transaction: '💰', deposit: '📥', withdrawal: '📤', security: '🔒', login: '🔑', profile: '👤', system: '📢', promotion: '🎁' };
    return icons[type] || '🔔';
  };

  const formatNotificationTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  const profileImageUrl = getProfileImageUrl(user?.profilePicture);
  const showImage = profileImageUrl && !imgError;

  return (
    <nav className="fixed top-0 z-40 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaBars className="h-5 w-5" />
            </button>
            <Link to="/dashboard" className="flex items-center ml-2 lg:ml-0 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-9 h-9 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Vaultix</span>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Dark Mode */}
            <button
              onClick={() => setDarkMode(p => !p)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <FaSun className="h-5 w-5 text-amber-500" /> : <FaMoon className="h-5 w-5 text-indigo-600" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
              >
                <FaBell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-40 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {recentNotifications.length === 0 ? (
                          <div className="px-4 py-8 text-center">
                            <FaBell className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications yet</p>
                          </div>
                        ) : (
                          recentNotifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => { setShowNotifications(false); navigate('/notifications'); }}
                              className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 ${!n.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                            >
                              <div className="flex gap-3">
                                <span className="text-xl">{getNotificationIcon(n.type)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{n.title}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{n.message}</p>
                                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{formatNotificationTime(n.createdAt)}</p>
                                </div>
                                {!n.isRead && <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2" />}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      {recentNotifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                          <button onClick={handleNotificationClick} className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium py-1">
                            View All Notifications
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {/* ✅ Avatar with key to force re-render on URL change */}
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md overflow-hidden">
                  {showImage ? (
                    <img
                      key={user?.profilePicture}
                      src={profileImageUrl}
                      alt={user?.name}
                      className="w-full h-full rounded-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <span className="text-xs font-bold">{getUserInitials(user?.name)}</span>
                  )}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <FaChevronDown className={`hidden md:block text-xs text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-40 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
                        {/* ✅ Mini avatar in dropdown also updates */}
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center overflow-hidden">
                            {showImage ? (
                              <img key={user?.profilePicture} src={profileImageUrl} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                            ) : (
                              <span className="text-white text-xs font-bold">{getUserInitials(user?.name)}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{user?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        {[
                          { to: '/profile', icon: FaUser, label: 'Profile' },
                          { to: '/settings', icon: FaCog, label: 'Settings' },
                          { to: '/security', icon: FaShieldAlt, label: 'Security' },
                        ].map(item => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <item.icon className="mr-3 text-gray-400" />
                            {item.label}
                          </Link>
                        ))}
                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <FaSignOutAlt className="mr-3" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;