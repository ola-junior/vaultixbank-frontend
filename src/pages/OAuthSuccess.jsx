import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Authentication failed. Please try again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      toast.success('Successfully logged in!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      toast.error('No authentication token received');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        {searchParams.get('error') ? (
          <div className="text-red-500">
            <FaCheckCircle className="text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Authentication Failed</h2>
            <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
          </div>
        ) : (
          <>
            <FaSpinner className="text-6xl text-indigo-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Completing Login
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we log you in...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthSuccess;