import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { applyActionCode, checkActionCode, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../firebase/config';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  // Password reset states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const oobCode = searchParams.get('oobCode');
  const actionMode = searchParams.get('mode');

  useEffect(() => {
    if (oobCode) {
      setMode(actionMode || 'verifyEmail');
      if (actionMode === 'resetPassword') {
        verifyResetCode();
      } else {
        verifyEmail();
      }
    } else {
      setStatus('error');
      setMessage('No action code provided.');
    }
  }, [oobCode, actionMode]);

  const verifyResetCode = async () => {
    try {
      const email = await verifyPasswordResetCode(auth, oobCode);
      setUserEmail(email);
      setStatus('reset-ready');
    } catch (error) {
      console.error('Reset code error:', error);
      setStatus('error');
      if (error.code === 'auth/invalid-action-code') {
        setMessage('This reset link is invalid or has expired.');
      } else if (error.code === 'auth/expired-action-code') {
        setMessage('This reset link has expired. Please request a new one.');
      } else {
        setMessage('Failed to verify reset link.');
      }
    }
  };

  const verifyEmail = async () => {
    try {
      await checkActionCode(auth, oobCode);
      await applyActionCode(auth, oobCode);
      setStatus('success');
      setMessage('Your email has been verified successfully!');
      toast.success('Email verified! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      if (error.code === 'auth/invalid-action-code') {
        setMessage('This verification link is invalid or has expired.');
      } else if (error.code === 'auth/expired-action-code') {
        setMessage('This verification link has expired. Please request a new one.');
      } else {
        setMessage('Email verification failed.');
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStatus('reset-success');
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // Reset Password Form
  if (status === 'reset-ready') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="max-w-md w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
              <p className="text-gray-600 dark:text-gray-400">
                For: <span className="font-semibold">{userEmail}</span>
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaLock className="inline mr-2 text-indigo-500" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    placeholder="Enter new password"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaLock className="inline mr-2 text-indigo-500" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    placeholder="Confirm new password"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-500">
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all">
                {loading ? <span className="flex items-center justify-center"><FaSpinner className="animate-spin mr-2" />Resetting...</span> : 'Reset Password'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  // Reset Success
  if (status === 'reset-success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="max-w-md w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
            <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Your password has been successfully reset.</p>
            <p className="text-sm text-gray-500 mb-4">Redirecting to login...</p>
            <Link to="/login" className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold">Go to Login</Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Verification Success
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="max-w-md w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
            <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Verified!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
            <Link to="/login" className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold">Go to Login</Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Error
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="max-w-md w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
            <FaTimesCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
            <Link to="/login" className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold">Back to Login</Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          <FaSpinner className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verifying...</h2>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we process your request...</p>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailVerification;