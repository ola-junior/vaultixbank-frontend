import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfileImageUrl, getUserInitials, getFirstName } from '../../utils/imageUrl';
import { 
  FaHome, 
  FaExchangeAlt, 
  FaPaperPlane, 
  FaUser, 
  FaChartBar,
  FaTimes,
  FaCreditCard,
  FaWallet,
  FaCog,
  FaSignOutAlt,
  FaShieldAlt
} from 'react-icons/fa';
import { FaBell } from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

 const menuItems = [
  { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
  { path: '/transactions', icon: FaExchangeAlt, label: 'Transactions' },
  { path: '/transfer', icon: FaPaperPlane, label: 'Transfer' },
   { path: '/notifications', icon: FaBell, label: 'Notifications' },
  { path: '/profile', icon: FaUser, label: 'Profile' },
  { path: '/analytics', icon: FaChartBar, label: 'Analytics' },
];

const bottomMenuItems = [
  { path: '/settings', icon: FaCog, label: 'Settings' },
  { path: '/security', icon: FaShieldAlt, label: 'Security' },
];

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-72 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Bank Branding Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg blur-md opacity-50"></div>
              <div className="relative w-8 h-8 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <FaCreditCard className="text-white text-sm" />
              </div>
            </div>
            <div>
             <a href="."> <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Vaultix
              </span></a>
              <span className="ml-1 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Bank
              </span>
            </div>
          </div>
          
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden ml-auto p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="h-[calc(100%-8rem)] px-3 py-4 overflow-y-auto">
          {/* Main Menu */}
          <div className="mb-6">
            <p className="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Main Menu
            </p>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${
                      ({ isActive }) => isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
                    }`} />
                    <span>{item.label}</span>
                    {item.path === '/analytics' && (
                      <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                        NEW
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Menu */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Settings
            </p>
            <ul className="space-y-1">
              {bottomMenuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
              
              {/* Logout Button */}
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-3 text-sm font-medium text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                >
                  <FaSignOutAlt className="w-5 h-5 mr-3" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full blur-md opacity-40"></div>
              <div className="relative w-11 h-11 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg border-2 border-white dark:border-gray-700">
                {getProfileImageUrl(user?.profilePicture) ? (
                  <img 
                    src={getProfileImageUrl(user.profilePicture)}
                    alt={user?.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold">{getUserInitials(user?.name)}</span>
                )}
              </div>
              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-700"></span>
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {getFirstName(user?.name)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <FaWallet className="text-indigo-500 text-[10px]" />
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {user?.accountNumber ? `****${user.accountNumber.slice(-4)}` : 'No account'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;