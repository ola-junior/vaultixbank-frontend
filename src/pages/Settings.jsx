import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  FaUser, 
  FaBell, 
  FaLock, 
  FaGlobe, 
  FaMoon, 
  FaSun,
  FaLanguage,
  FaMoneyBillWave,
  FaShieldAlt,
  FaSave,
  FaToggleOn,
  FaToggleOff,
  FaCheckCircle
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    transactionAlerts: true,
    securityAlerts: true,
    marketingEmails: false,
    
    // Display Settings
    darkMode: localStorage.getItem('theme') === 'dark',
    compactView: false,
    currency: 'NGN',
    language: 'en',
    
    // Security Settings
    twoFactorAuth: false,
    biometricLogin: false,
    sessionTimeout: '30',
    
    // Transfer Limits
    dailyLimit: 1000000,
    singleTransferLimit: 500000
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDarkModeToggle = () => {
    const newMode = !settings.darkMode;
    setSettings(prev => ({ ...prev, darkMode: newMode }));
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSave = async (section) => {
    setLoading(true);
    try {
      // Save settings to backend
      await api.put('/user/settings', { section, settings });
      toast.success(`${section} settings saved successfully!`);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      id: 'notifications',
      title: 'Notifications',
      icon: FaBell,
      color: 'from-blue-500 to-cyan-500',
      items: [
        { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates via email' },
        { key: 'pushNotifications', label: 'Push Notifications', description: 'Get instant alerts on your device' },
        { key: 'transactionAlerts', label: 'Transaction Alerts', description: 'Get notified for every transaction' },
        { key: 'securityAlerts', label: 'Security Alerts', description: 'Important security notifications' },
        { key: 'marketingEmails', label: 'Marketing Emails', description: 'Offers, promotions, and news' }
      ]
    },
    {
      id: 'display',
      title: 'Display & Appearance',
      icon: FaGlobe,
      color: 'from-purple-500 to-pink-500',
      items: [
        { 
          key: 'darkMode', 
          label: 'Dark Mode', 
          description: 'Switch between light and dark theme',
          custom: true,
          action: handleDarkModeToggle
        },
        { key: 'compactView', label: 'Compact View', description: 'Reduce spacing between elements' },
        { 
          key: 'language', 
          label: 'Language', 
          description: 'Choose your preferred language',
          type: 'select',
          options: ['English', 'Français', 'Español', 'العربية']
        }
      ]
    },
    {
      id: 'security',
      title: 'Security',
      icon: FaShieldAlt,
      color: 'from-green-500 to-emerald-500',
      items: [
        { key: 'twoFactorAuth', label: 'Two-Factor Authentication', description: 'Add an extra layer of security' },
        { key: 'biometricLogin', label: 'Biometric Login', description: 'Use fingerprint or face ID' },
        { 
          key: 'sessionTimeout', 
          label: 'Session Timeout', 
          description: 'Auto logout after inactivity',
          type: 'select',
          options: ['15', '30', '60', '120']
        }
      ]
    },
    {
      id: 'limits',
      title: 'Transfer Limits',
      icon: FaMoneyBillWave,
      color: 'from-orange-500 to-red-500',
      items: [
        { 
          key: 'dailyLimit', 
          label: 'Daily Transfer Limit', 
          description: 'Maximum amount per day',
          type: 'number',
          suffix: '₦'
        },
        { 
          key: 'singleTransferLimit', 
          label: 'Single Transfer Limit', 
          description: 'Maximum per transaction',
          type: 'number',
          suffix: '₦'
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account preferences and security settings
        </p>
      </div>

      {/* Settings Sections */}
      {sections.map((section, index) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${section.color}`}>
                <section.icon className="text-white text-lg" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {section.title}
              </h2>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {section.items.map((item) => (
              <div key={item.key} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
                
                <div className="ml-4">
                  {item.custom ? (
                    <button
                      onClick={item.action}
                      className="relative"
                    >
                      {settings[item.key] ? (
                        <FaToggleOn className="text-3xl text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <FaToggleOff className="text-3xl text-gray-400" />
                      )}
                    </button>
                  ) : item.type === 'select' ? (
                    <select
                      value={settings[item.key]}
                      onChange={(e) => handleChange(item.key, e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      {item.options.map(opt => (
                        <option key={opt} value={opt.toLowerCase()}>{opt}</option>
                      ))}
                    </select>
                  ) : item.type === 'number' ? (
                    <div className="flex items-center gap-2">
                      {item.suffix && <span className="text-gray-500">{item.suffix}</span>}
                      <input
                        type="number"
                        value={settings[item.key]}
                        onChange={(e) => handleChange(item.key, e.target.value)}
                        className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleToggle(item.key)}
                      className="relative"
                    >
                      {settings[item.key] ? (
                        <FaToggleOn className="text-3xl text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <FaToggleOff className="text-3xl text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => handleSave(section.id)}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FaSave className="text-sm" />
              Save {section.title} Settings
            </button>
          </div>
        </motion.div>
      ))}

      {/* Account Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Account Actions
        </h3>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <p className="font-medium text-gray-900 dark:text-white">Download Account Statement</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Get a PDF of all your transactions</p>
          </button>
          <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <p className="font-medium text-gray-900 dark:text-white">Export Data</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Download your data in CSV format</p>
          </button>
          <button className="w-full text-left px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <p className="font-medium text-red-600 dark:text-red-400">Deactivate Account</p>
            <p className="text-sm text-red-500 dark:text-red-300">Temporarily disable your account</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;