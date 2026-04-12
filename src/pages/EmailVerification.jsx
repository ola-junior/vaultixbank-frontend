import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { auth } from '../firebase/config';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const oobCode = searchParams.get('oobCode');
    const mode = searchParams.get('mode');
    
    if (oobCode && (mode === 'verifyEmail' || !mode)) {
      verifyEmail(oobCode);
    } else if (oobCode) {
      verifyEmail(oobCode);
    } else {
      setStatus('waiting');
      setMessage('Waiting for verification...');
    }
  }, [searchParams]);

  const verifyEmail = async (code) => {
    try {
      // Check if code is valid
      await checkActionCode(auth, code);
      
      // Apply verification
      await applyActionCode(auth, code);
      
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
        setMessage('Email verification failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center"
        >
          {status === 'verifying' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6">
                <FaSpinner className="w-20 h-20 text-indigo-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verifying Your Email
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6">
                <FaCheckCircle className="w-20 h-20 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Email Verified! ✅
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              <Link 
                to="/login"
                className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 shadow-lg"
              >
                Go to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6">
                <FaTimesCircle className="w-20 h-20 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              <Link 
                to="/login"
                className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 shadow-lg"
              >
                Back to Login
              </Link>
            </>
          )}

          {status === 'waiting' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6">
                <FaSpinner className="w-20 h-20 text-indigo-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Ready to Verify
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Click the verification link in your email to verify your account.
              </p>
              <Link 
                to="/login"
                className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 shadow-lg"
              >
                Go to Login
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EmailVerification;