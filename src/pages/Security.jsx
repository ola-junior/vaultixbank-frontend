import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  FaLock, 
  FaShieldAlt, 
  FaHistory, 
  FaMobileAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaSignOutAlt,
  FaQrcode,
  FaKey,
  FaWindows,
  FaApple
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Security = () => {
  const { user, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [twoFactorData, setTwoFactorData] = useState({ qrCode: '', secret: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [enabling2FA, setEnabling2FA] = useState(false);
  const [verifying2FA, setVerifying2FA] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [pinForm, setPinForm] = useState({ currentPin: '', newPin: '', confirmPin: '' });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    checkPinStatus();
    fetchSecurityInfo();
    fetchActiveSessions();
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
      setTwoFactorEnabled(response.data.twoFactorEnabled || false);
    } catch (error) {
      console.error('Error fetching security info:', error);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const response = await api.get('/user/sessions');
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([
        { 
          device: 'Windows PC • Chrome', 
          location: 'Lagos, Nigeria', 
          lastActive: 'Current session', 
          current: true,
          icon: FaWindows
        },
        { 
          device: 'iPhone 13 • Safari', 
          location: 'Lagos, Nigeria', 
          lastActive: '2 hours ago', 
          current: false,
          icon: FaApple
        }
      ]);
    }
  };

  // 2FA Functions
  const enable2FA = async () => {
    setEnabling2FA(true);
    try {
      const response = await api.post('/user/2fa/enable');
      setTwoFactorData({
        qrCode: response.data.qrCode,
        secret: response.data.secret
      });
      setShow2FAModal(true);
    } catch (error) {
      toast.error('Failed to setup 2FA. Please try again.');
      console.error('2FA setup error:', error);
    } finally {
      setEnabling2FA(false);
    }
  };

  const verifyAndEnable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setVerifying2FA(true);
    try {
      await api.post('/user/2fa/verify', {
        token: verificationCode,
        secret: twoFactorData.secret
      });
      
      const updatedUser = { ...user, twoFactorEnabled: true };
      updateUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setTwoFactorEnabled(true);
      setShow2FAModal(false);
      setVerificationCode('');
      toast.success('Two-factor authentication enabled successfully!');
    } catch (error) {
      toast.error('Invalid verification code. Please try again.');
      console.error('2FA verification error:', error);
    } finally {
      setVerifying2FA(false);
    }
  };

  const disable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }
    
    try {
      await api.post('/user/2fa/disable');
      
      const updatedUser = { ...user, twoFactorEnabled: false };
      updateUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setTwoFactorEnabled(false);
      toast.success('Two-factor authentication disabled');
    } catch (error) {
      toast.error('Failed to disable 2FA. Please try again.');
      console.error('2FA disable error:', error);
    }
  };

  // PIN Functions
  const handlePinSetup = async (e) => {
    e.preventDefault();
    
    if (hasPin) {
      if (!pinForm.currentPin) {
        toast.error('Current PIN is required');
        return;
      }
    }
    
    if (pinForm.newPin !== pinForm.confirmPin) {
      toast.error('PINs do not match');
      return;
    }
    
    if (pinForm.newPin.length !== 4 || !/^\d+$/.test(pinForm.newPin)) {
      toast.error('PIN must be 4 digits');
      return;
    }
    
    const weakPins = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '4321'];
    if (weakPins.includes(pinForm.newPin)) {
      toast.error('Please choose a more secure PIN');
      return;
    }
    
    setLoading(true);
    try {
      if (hasPin) {
        await api.put('/user/change-pin', {
          currentPin: pinForm.currentPin,
          newPin: pinForm.newPin,
          confirmNewPin: pinForm.confirmPin
        });
        toast.success('PIN changed successfully!');
      } else {
        await api.post('/user/set-pin', {
          pin: pinForm.newPin,
          confirmPin: pinForm.confirmPin
        });
        toast.success('PIN set successfully!');
      }
      
      setHasPin(true);
      setShowPinModal(false);
      setPinForm({ currentPin: '', newPin: '', confirmPin: '' });
      await checkPinStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update PIN');
      console.error('PIN error:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Password Functions
  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  // ✅ FIXED: Password Submit Function with confirmNewPassword
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
    
    const hasUpperCase = /[A-Z]/.test(passwordForm.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordForm.newPassword);
    const hasNumbers = /\d/.test(passwordForm.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      toast.error('Password must contain uppercase, lowercase, number, and special character');
      return;
    }
    
    setLoading(true);
    try {
      await api.put('/user/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmPassword  // ✅ ADDED
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
      console.error('Password change error:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!window.confirm('This will log you out from all other devices. Continue?')) {
      return;
    }
    
    try {
      await api.post('/user/logout-all');
      toast.success('Logged out from all devices');
      logout();
    } catch (error) {
      toast.error('Failed to logout from all devices');
    }
  };

  const handleLogoutSession = async (sessionId) => {
    try {
      await api.delete(`/user/sessions/${sessionId}`);
      toast.success('Device logged out successfully');
      fetchActiveSessions();
    } catch (error) {
      toast.error('Failed to logout device');
    }
  };

  const calculateSecurityScore = () => {
    let score = 0;
    if (hasPin) score += 25;
    if (twoFactorEnabled) score += 25;
    if (user?.isEmailVerified) score += 25;
    if (user?.phoneNumber) score += 15;
    if (user?.passwordUpdatedAt) score += 10;
    return Math.min(score, 100);
  };

  const securityScore = calculateSecurityScore();
  const scoreColor = securityScore >= 75 ? 'text-green-600' : securityScore >= 50 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = securityScore >= 75 ? 'bg-green-500' : securityScore >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-0">
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
            <span className={`text-3xl font-bold ${scoreColor}`}>{securityScore}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 mb-4">
            <div 
              className={`h-3 rounded-full ${scoreBg} transition-all duration-500`}
              style={{ width: `${securityScore}%` }}
            />
          </div>
          <p className="text-white/80 text-sm">
            {securityScore >= 75 ? '✅ Your account is well protected!' : 
             securityScore >= 50 ? '⚠️ Your account needs some security improvements' : 
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
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Two-Factor Authentication
                </h3>
                {twoFactorEnabled && (
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
                    Enabled
                  </span>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Add an extra layer of security to your account by requiring a verification code from your phone
              </p>
              <button 
                onClick={twoFactorEnabled ? disable2FA : enable2FA}
                disabled={enabling2FA}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  twoFactorEnabled 
                    ? 'border border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {enabling2FA ? 'Setting up...' : twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </button>
            </div>
            {!twoFactorEnabled && (
              <FaExclamationTriangle className="text-yellow-500 text-xl" />
            )}
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
              <button 
                onClick={() => setShowPinModal(true)}
                className="px-4 py-2 border border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                {hasPin ? 'Change PIN' : 'Set PIN'}
              </button>
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
              <FaKey className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Change Password
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Update your account password regularly
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
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
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
              {loading ? 'Updating...' : 'Update Password'}
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
                  {session.icon && <session.icon className="text-gray-500 text-xl" />}
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
                {!session.current && (
                  <button
                    onClick={() => handleLogoutSession(session.id)}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Logout
                  </button>
                )}
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
                <FaExclamationTriangle className="mt-1 flex-shrink-0" />
                <span>Set up a transaction PIN to protect your transfers</span>
              </li>
            )}
            {!twoFactorEnabled && (
              <li className="flex items-start gap-3 text-yellow-600 dark:text-yellow-400">
                <FaExclamationTriangle className="mt-1 flex-shrink-0" />
                <span>Enable two-factor authentication for enhanced security</span>
              </li>
            )}
            <li className="flex items-start gap-3 text-green-600 dark:text-green-400">
              <FaCheckCircle className="mt-1 flex-shrink-0" />
              <span>Use a strong, unique password that you don't use elsewhere</span>
            </li>
            <li className="flex items-start gap-3 text-green-600 dark:text-green-400">
              <FaCheckCircle className="mt-1 flex-shrink-0" />
              <span>Never share your PIN or password with anyone</span>
            </li>
            <li className="flex items-start gap-3 text-green-600 dark:text-green-400">
              <FaCheckCircle className="mt-1 flex-shrink-0" />
              <span>Always verify recipient details before sending money</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* PIN Setup Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {hasPin ? 'Change Transaction PIN' : 'Set Transaction PIN'}
            </h3>
            
            <form onSubmit={handlePinSetup} className="space-y-4">
              {hasPin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current PIN
                  </label>
                  <input
                    type="password"
                    maxLength="4"
                    value={pinForm.currentPin}
                    onChange={(e) => setPinForm({...pinForm, currentPin: e.target.value.replace(/\D/g, '')})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-2xl tracking-widest"
                    placeholder="••••"
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New PIN
                </label>
                <input
                  type="password"
                  maxLength="4"
                  value={pinForm.newPin}
                  onChange={(e) => setPinForm({...pinForm, newPin: e.target.value.replace(/\D/g, '')})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-2xl tracking-widest"
                  placeholder="••••"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New PIN
                </label>
                <input
                  type="password"
                  maxLength="4"
                  value={pinForm.confirmPin}
                  onChange={(e) => setPinForm({...pinForm, confirmPin: e.target.value.replace(/\D/g, '')})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-2xl tracking-widest"
                  placeholder="••••"
                  required
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : hasPin ? 'Change PIN' : 'Set PIN'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setPinForm({ currentPin: '', newPin: '', confirmPin: '' });
                  }}
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <FaQrcode className="text-indigo-600 dark:text-indigo-400 text-xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Setup Two-Factor Authentication
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  1. Scan this QR code with Google Authenticator or Authy
                </p>
                {twoFactorData.qrCode && (
                  <div className="bg-white p-4 rounded-lg flex justify-center">
                    <img 
                      src={twoFactorData.qrCode} 
                      alt="2FA QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  2. Or enter this code manually:
                </p>
                <code className="block p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center font-mono text-sm break-all">
                  {twoFactorData.secret}
                </code>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  3. Enter verification code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength="6"
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-2xl tracking-widest bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  onClick={verifyAndEnable2FA}
                  disabled={verifying2FA}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {verifying2FA ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    'Verify & Enable'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShow2FAModal(false);
                    setVerificationCode('');
                  }}
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Security;