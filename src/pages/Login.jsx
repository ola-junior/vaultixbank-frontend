import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaShieldAlt,
  FaChartLine,
  FaGlobe,
  FaGoogle,
  FaFacebook,
  FaTwitter,
  FaUser
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [oauthLoading, setOauthLoading] = useState({ google: false, facebook: false, twitter: false });
  const { login, loginWithGoogle, loginWithFacebook, loginWithTwitter } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please enter your email and password');
      return;
    }
    
    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    setOauthLoading(prev => ({ ...prev, google: true }));
    try {
      const result = await loginWithGoogle();
      if (result?.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Google login failed. Please try again.');
    } finally {
      setOauthLoading(prev => ({ ...prev, google: false }));
    }
  };

  const handleFacebookLogin = async () => {
    setOauthLoading(prev => ({ ...prev, facebook: true }));
    try {
      const result = await loginWithFacebook();
      if (result?.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Facebook login failed. Please try again.');
    } finally {
      setOauthLoading(prev => ({ ...prev, facebook: false }));
    }
  };

  const handleTwitterLogin = async () => {
    setOauthLoading(prev => ({ ...prev, twitter: true }));
    try {
      const result = await loginWithTwitter();
      if (result?.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Twitter login failed. Please try again.');
    } finally {
      setOauthLoading(prev => ({ ...prev, twitter: false }));
    }
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: 'john@example.com',
      password: 'password123',
    });
    toast.success('Demo credentials filled!');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full opacity-30 blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500 rounded-full opacity-30 blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500 rounded-full opacity-20 blur-3xl"
        />

        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 mb-8 w-fit"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-xs">✦</div>
            <span className="text-xs font-medium text-white/80">Vaultix — Secure Banking</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-bold leading-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}
          >
            Welcome<br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Back!
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 text-lg leading-relaxed mb-8"
          >
            Access your account to manage your finances, send money instantly, 
            and track all your transactions in one place.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 mb-8"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex items-center gap-4 border border-white/10 hover:border-blue-400/30 transition-all duration-300 hover:translate-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                <FaShieldAlt className="text-lg" />
              </div>
              <div>
                <p className="text-white/90 font-semibold">Secure Login</p>
                <p className="text-white/40 text-sm">Protected by 256-bit encryption</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex items-center gap-4 border border-white/10 hover:border-cyan-400/30 transition-all duration-300 hover:translate-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white">
                <FaChartLine className="text-lg" />
              </div>
              <div>
                <p className="text-white/90 font-semibold">Real-time Updates</p>
                <p className="text-white/40 text-sm">Track your balance and transactions</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex items-center gap-4 border border-white/10 hover:border-indigo-400/30 transition-all duration-300 hover:translate-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white">
                <FaGlobe className="text-lg" />
              </div>
              <div>
                <p className="text-white/90 font-semibold">24/7 Access</p>
                <p className="text-white/40 text-sm">Bank anytime, anywhere</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-4"
          >
            <div className="flex -space-x-2">
              <img src="https://i.pravatar.cc/100?img=11" className="w-10 h-10 rounded-full border-2 border-white/20 object-cover" alt="" />
              <img src="https://i.pravatar.cc/100?img=32" className="w-10 h-10 rounded-full border-2 border-white/20 object-cover" alt="" />
              <img src="https://i.pravatar.cc/100?img=54" className="w-10 h-10 rounded-full border-2 border-white/20 object-cover" alt="" />
              <img src="https://i.pravatar.cc/100?img=9" className="w-10 h-10 rounded-full border-2 border-white/20 object-cover" alt="" />
            </div>
            <div>
              <div className="text-yellow-400 text-xs tracking-widest">★★★★★</div>
              <p className="text-white/50 text-sm">Trusted by <span className="text-white/80 font-medium">1M+</span> users</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                  Sign up
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaEnvelope className="inline mr-2 text-indigo-500" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition dark:text-white"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    <FaLock className="inline mr-2 text-indigo-500" />
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition dark:text-white"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 mr-2"
                />
                <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">Remember me</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    <FaUser className="inline mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Social Login */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleGoogleLogin}
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
                onClick={handleFacebookLogin}
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
                onClick={handleTwitterLogin}
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

            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Demo Credentials
                </p>
                <button
                  onClick={fillDemoCredentials}
                  className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Fill Demo
                </button>
              </div>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p className="flex items-center">
                  <FaEnvelope className="text-indigo-500 mr-2 text-xs" />
                  Email: john@example.com
                </p>
                <p className="flex items-center">
                  <FaLock className="text-indigo-500 mr-2 text-xs" />
                  Password: password123
                </p>
              </div>
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
              By signing in, you agree to our{' '}
              <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</a>
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

export default Login;