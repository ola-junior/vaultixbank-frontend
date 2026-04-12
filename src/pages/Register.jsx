import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { wakeUpBackend, retryRequest } from '../services/api';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaPhone, 
  FaEye, 
  FaEyeSlash, 
  FaCheckCircle,
  FaShieldAlt,
  FaBolt,
  FaGift,
  FaGoogle,
  FaFacebook,
  FaTwitter,
  FaTimes
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithFacebook, loginWithTwitter, resendVerification } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [oauthLoading, setOauthLoading] = useState({ google: false, facebook: false, twitter: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.phoneNumber && !/^[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the Terms of Service';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    
    // Show loading toast
    const loadingToast = toast.loading('Creating your account...');
    
    try {
      // Wake up backend first (Render cold start)
      await wakeUpBackend();
      
      // Use retry wrapper for registration
      const result = await retryRequest(
        () => api.post('/auth/register', {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phoneNumber: formData.phoneNumber ? formData.phoneNumber.replace(/\s/g, '') : undefined,
        }),
        3, // max retries
        2000 // initial delay
      );
      
      toast.dismiss(loadingToast);
      
      if (result.success) {
        const response = result.response;
        
        setRegisteredEmail(formData.email);
        setVerificationUrl(response.data?.verificationUrl || '');
        setRegistrationComplete(true);
        
        // Clear form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phoneNumber: '',
        });
        setAgreeToTerms(false);
        
        toast.success(response.data?.message || 'Registration successful! Please check your email.');
      } else {
        const error = result.error;
        
        if (error?.response?.status === 400) {
          const message = error.response.data?.message;
          if (message?.includes('already exists')) {
            toast.error('Email already registered. Please login instead.');
            setTimeout(() => {
              if (window.confirm('Would you like to go to the login page?')) {
                navigate('/login');
              }
            }, 1000);
          } else {
            toast.error(message || 'Registration failed.');
          }
        } else if (error?.code === 'ECONNABORTED') {
          toast.error('Server is taking too long. Please try again in a moment.');
        } else {
          toast.error('Registration failed. Please try again.');
        }
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    try {
      const result = await resendVerification(registeredEmail);
      if (result?.success) {
        toast.success('Verification email resent successfully!');
      } else {
        toast.error('Failed to resend verification email.');
      }
    } catch (error) {
      toast.error('Failed to resend verification email.');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setOauthLoading(prev => ({ ...prev, google: true }));
    try {
      const result = await loginWithGoogle();
      if (result?.success) {
        toast.success('Account created with Google!');
        navigate('/dashboard');
      } else {
        toast.error('Google sign-up failed. Please try again.');
      }
    } catch (error) {
      toast.error('Google sign-up failed. Please try again.');
    } finally {
      setOauthLoading(prev => ({ ...prev, google: false }));
    }
  };

  const handleFacebookSignUp = async () => {
    setOauthLoading(prev => ({ ...prev, facebook: true }));
    try {
      const result = await loginWithFacebook();
      if (result?.success) {
        toast.success('Account created with Facebook!');
        navigate('/dashboard');
      } else {
        toast.error('Facebook sign-up failed. Please try again.');
      }
    } catch (error) {
      toast.error('Facebook sign-up failed. Please try again.');
    } finally {
      setOauthLoading(prev => ({ ...prev, facebook: false }));
    }
  };

  const handleTwitterSignUp = async () => {
    setOauthLoading(prev => ({ ...prev, twitter: true }));
    try {
      const result = await loginWithTwitter();
      if (result?.success) {
        toast.success('Account created with Twitter!');
        navigate('/dashboard');
      } else {
        toast.error('Twitter sign-up failed. Please try again.');
      }
    } catch (error) {
      toast.error('Twitter sign-up failed. Please try again.');
    } finally {
      setOauthLoading(prev => ({ ...prev, twitter: false }));
    }
  };

  // Success Screen
  if (registrationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
        <div className="max-w-md w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6">
              <FaCheckCircle className="w-20 h-20 text-green-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Verify Your Email
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We've sent a verification link to:
            </p>
            
            <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-6">
              {registeredEmail}
            </p>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Please check your inbox and click the verification link to activate your account.
            </p>

            {verificationUrl && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-2 font-semibold">
                  Click below if email not received:
                </p>
                <a 
                  href={verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 dark:text-indigo-400 break-all hover:underline"
                >
                  Open Verification Link
                </a>
              </div>
            )}

            <div className="space-y-3">
              <button 
                onClick={handleResendVerification} 
                disabled={resendingEmail}
                className="w-full px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 disabled:opacity-50"
              >
                {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
              </button>
              
              <Link 
                to="/login"
                className="block w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Go to Login
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Registration Form
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full opacity-30 blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500 rounded-full opacity-30 blur-3xl"
        />
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 mb-8 w-fit border border-white/10"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-xs">✦</div>
            <span className="text-xs font-medium text-white/80">Vaultix — Est. 2026</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-bold leading-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}
          >
            Bank Smarter.<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Live Better.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 text-lg leading-relaxed mb-8"
          >
            Join thousands of smart customers getting exclusive benefits, 
            instant transfers, and financial freedom — all in one place.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 mb-8"
          >
            {[
              { icon: FaShieldAlt, title: 'Bank-Grade Security', desc: '256-bit SSL encryption', color: 'from-indigo-500 to-indigo-600' },
              { icon: FaBolt, title: 'Instant Transfers', desc: 'Send and receive in seconds', color: 'from-purple-500 to-purple-600' },
              { icon: FaGift, title: 'Member Rewards', desc: 'Earn cashback on transactions', color: 'from-pink-500 to-pink-600' }
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex items-center gap-4 border border-white/10 hover:border-indigo-400/30 transition-all duration-300 hover:translate-x-2">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white`}>
                  <item.icon className="text-lg" />
                </div>
                <div>
                  <p className="text-white/90 font-semibold">{item.title}</p>
                  <p className="text-white/40 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-4"
          >
            <div className="flex -space-x-2">
              {[11, 32, 54, 9].map((img, i) => (
                <img key={i} src={`https://i.pravatar.cc/100?img=${img}`} className="w-10 h-10 rounded-full border-2 border-white/20 object-cover" alt="" />
              ))}
            </div>
            <div>
              <div className="text-yellow-400 text-xs tracking-widest">★★★★★</div>
              <p className="text-white/50 text-sm">Loved by <span className="text-white/80 font-medium">1M+</span> customers</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Create Your Account
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaUser className="inline mr-2 text-indigo-500" />
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } dark:text-white`}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <FaTimes className="text-xs" />{errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaEnvelope className="inline mr-2 text-indigo-500" />
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } dark:text-white`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <FaTimes className="text-xs" />{errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaPhone className="inline mr-2 text-indigo-500" />
                  Phone Number <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition ${
                    errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } dark:text-white`}
                  placeholder="08012345678"
                  autoComplete="tel"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <FaTimes className="text-xs" />{errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaLock className="inline mr-2 text-indigo-500" />
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition ${
                      errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } dark:text-white`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <FaTimes className="text-xs" />{errors.password}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaLock className="inline mr-2 text-indigo-500" />
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } dark:text-white`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <FaTimes className="text-xs" />{errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 mr-3 rounded text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                />
                <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</a>
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>
              {errors.terms && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <FaTimes className="text-xs" />{errors.terms}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Creating Account...
                  </span>
                ) : (
                  <>
                    <FaUser className="inline mr-2" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            {/* Social Sign Up */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={oauthLoading.google}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {oauthLoading.google ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent" />
                ) : (
                  <FaGoogle className="text-red-500 text-xl" />
                )}
              </button>
              <button
                type="button"
                onClick={handleFacebookSignUp}
                disabled={oauthLoading.facebook}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {oauthLoading.facebook ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                ) : (
                  <FaFacebook className="text-blue-600 text-xl" />
                )}
              </button>
              <button
                type="button"
                onClick={handleTwitterSignUp}
                disabled={oauthLoading.twitter}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {oauthLoading.twitter ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-sky-500 border-t-transparent" />
                ) : (
                  <FaTwitter className="text-sky-500 text-xl" />
                )}
              </button>
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
              By signing up, you agree to receive occasional emails about new features and deals.
            </p>
          </motion.div>
        </div>
      </div>

      <style>{`
        .bg-grid-pattern {
          background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 56px 56px;
        }
      `}</style>
    </div>
  );
};

export default Register;