import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  FaLock, 
  FaShieldAlt, 
  FaHistory, 
  FaMobileAlt,
  FaFingerprint,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaSignOutAlt
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PinSetupModal from '../components/Common/PinSetupModal';

const Security = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [sessions, setSessions] = useState([
    { device: 'Windows PC • Chrome', location: 'Lagos, Nigeria', lastActive: 'Current session', current: true },
    { device: 'iPhone 13 • Safari', location: 'Lagos, Nigeria', lastActive: '2 hours ago', current: false }
  ]);

  useEffect(() => {
    checkPinStatus();
    fetchSecurityInfo();
  }, []);

  const checkPinStatus = async () => {
    try {
      const response = await api.get('/user/has-pin');
      setHasPin(response.data.hasPin);
    } catch (error) {
      console.error('Error checking PIN status:', error);
    }
  };

  const fetchSecurityInfo = async () => {
    try {
      const response = await api.get('/user/security-info');
      // Update sessions from response
    } catch (error) {
      console.error('Error fetching security info:', error);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await api.put('/user/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSetupSuccess = () => {
    setHasPin(true);
    toast.success('Transaction PIN set successfully!');
  };

  const handleLogoutAllDevices = async () => {
    try {
      await api.post('/user/logout-all');
      toast.success('Logged out from all devices');
      logout();
    } catch (error) {
      toast.error('Failed to logout from all devices');
    }
  };

  const securityScore = () => {
    let score = 0;
    if (hasPin) score += 25;
    if (user?.isEmailVerified) score += 25;
    if (user?.phoneNumber) score += 25;
    // Add more checks
    return Math.min(score + 25, 100);
  };

  const score = securityScore();
  const scoreColor = score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Security Center
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your account security and privacy settings
          </p>
        </div>

        {/* Security Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Security Score</h2>
            <span className={`text-3xl font-bold ${scoreColor}`}>{score}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 mb-4">
            <div 
              className={`h-3 rounded-full ${scoreBg} transition-all duration-500`}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-white/80 text-sm">
            {score >= 75 ? '✅ Your account is well protected!' : 
             score >= 50 ? '⚠️ Your account needs some security improvements' : 
             '🔴 Your account is at risk. Please secure it immediately.'}
          </p>
        </motion.div>

        {/* Two-Factor Authentication */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <FaMobileAlt className="text-2xl text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Two-Factor Authentication
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Add an extra layer of security to your account by requiring a verification code
              </p>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Enable 2FA
              </button>
            </div>
            <FaExclamationTriangle className="text-yellow-500 text-xl" />
          </div>
        </motion.div>

        {/* Transaction PIN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <FaLock className="text-2xl text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Transaction PIN
                </h3>
                {hasPin && <FaCheckCircle className="text-green-500" />}
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Protect your transactions with a 4-digit PIN
              </p>
              {hasPin ? (
                <button 
                  onClick={() => setShowPinModal(true)}
                  className="px-4 py-2 border border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  Change PIN
                </button>
              ) : (
                <button 
                  onClick={() => setShowPinModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Set PIN
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <FaLock className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Change Password
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Update your account password
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FaSave />
              Update Password
            </button>
          </form>
        </motion.div>

        {/* Active Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <FaHistory className="text-2xl text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Active Sessions
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Devices currently logged into your account
                </p>
              </div>
            </div>
            <button
              onClick={handleLogoutAllDevices}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
            >
              <FaSignOutAlt />
              Logout All
            </button>
          </div>

          <div className="space-y-3">
            {sessions.map((session, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaMobileAlt className="text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {session.device}
                      {session.current && (
                        <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {session.location} • {session.lastActive}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaShieldAlt className="text-indigo-500" />
            Security Recommendations
          </h3>
          <ul className="space-y-3">
            {!hasPin && (
              <li className="flex items-start gap-3 text-yellow-600 dark:text-yellow-400">
                <FaExclamationTriangle className="mt-1" />
                <span>Set up a transaction PIN to protect your transfers</span>
              </li>
            )}
            <li className="flex items-start gap-3 text-green-600 dark:text-green-400">
              <FaCheckCircle className="mt-1" />
              <span>Use a strong, unique password that you don't use elsewhere</span>
            </li>
            <li className="flex items-start gap-3 text-green-600 dark:text-green-400">
              <FaCheckCircle className="mt-1" />
              <span>Never share your PIN or password with anyone</span>
            </li>
            <li className="flex items-start gap-3 text-green-600 dark:text-green-400">
              <FaCheckCircle className="mt-1" />
              <span>Always verify recipient details before sending money</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* PIN Setup Modal */}
      <PinSetupModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handlePinSetupSuccess}
      />
    </>
  );
};

export default Security;