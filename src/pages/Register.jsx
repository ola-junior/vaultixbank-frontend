import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/config';
import api from '../services/api';
import { 
  FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash, FaCheckCircle,
  FaShieldAlt, FaBolt, FaGift, FaGoogle, FaFacebook, FaTwitter, FaTimes
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithFacebook, loginWithTwitter } = useAuth();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [oauthLoading, setOauthLoading] = useState({ google: false, facebook: false, twitter: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    else if (formData.name.length < 3) newErrors.name = 'Name must be at least 3 characters';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (formData.phoneNumber && !/^[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    if (!agreeToTerms) newErrors.terms = 'You must agree to the Terms of Service';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) { toast.error('Please fix the errors in the form'); return; }
    
    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, formData.email.trim().toLowerCase(), formData.password
      );
      await updateProfile(userCredential.user, { displayName: formData.name.trim() });
      
      const actionCodeSettings = { url: `${window.location.origin}/verify`, handleCodeInApp: true };
      await sendEmailVerification(userCredential.user, actionCodeSettings);
      
      await api.post('/auth/register', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phoneNumber: formData.phoneNumber ? formData.phoneNumber.replace(/\s/g, '') : undefined,
        firebaseUid: userCredential.user.uid
      });
      
      setRegisteredEmail(formData.email);
      setRegistrationComplete(true);
      setFormData({ name: '', email: '', password: '', confirmPassword: '', phoneNumber: '' });
      setAgreeToTerms(false);
      toast.success('Registration successful! Please check your email to verify your account.');
      
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already registered. Please login instead.');
        setTimeout(() => { if (window.confirm('Go to login page?')) navigate('/login'); }, 1000);
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak. Use at least 6 characters.');
      } else {
        toast.error(error.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setOauthLoading(prev => ({ ...prev, google: true }));
    try { const result = await loginWithGoogle(); if (result?.success) navigate('/dashboard'); } 
    catch { toast.error('Google sign-up failed.'); } 
    finally { setOauthLoading(prev => ({ ...prev, google: false })); }
  };

  const handleFacebookSignUp = async () => {
    setOauthLoading(prev => ({ ...prev, facebook: true }));
    try { const result = await loginWithFacebook(); if (result?.success) navigate('/dashboard'); } 
    catch { toast.error('Facebook sign-up failed.'); } 
    finally { setOauthLoading(prev => ({ ...prev, facebook: false })); }
  };

  const handleTwitterSignUp = async () => {
    setOauthLoading(prev => ({ ...prev, twitter: true }));
    try { const result = await loginWithTwitter(); if (result?.success) navigate('/dashboard'); } 
    catch { toast.error('Twitter sign-up failed.'); } 
    finally { setOauthLoading(prev => ({ ...prev, twitter: false })); }
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
        <div className="max-w-md w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6"><FaCheckCircle className="w-20 h-20 text-green-500" /></div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Verify Your Email</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">We've sent a verification link to:</p>
            <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-6">{registeredEmail}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Please check your inbox and click the link to activate your account.</p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-6">📧 <strong>Important:</strong> Please check your spam/junk folder if you don't see the email in your inbox.</p>
            <Link to="/login" className="block w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg">Go to Login</Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity }} className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500 rounded-full opacity-30 blur-3xl" />
        <motion.div animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }} transition={{ duration: 15, repeat: Infinity }} className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-500 rounded-full opacity-30 blur-3xl" />
        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 18, repeat: Infinity }} className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 mb-8 w-fit">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs">✦</div>
            <span className="text-xs font-medium text-white/80">Vaultix — Est. 2026</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="font-bold leading-tight mb-6" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}>
            Bank Smarter.<br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Live Better.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-white/60 text-lg leading-relaxed mb-8">
            Join thousands of smart customers getting exclusive benefits, instant transfers, and financial freedom — all in one place.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex items-center gap-4 border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:translate-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white"><FaShieldAlt className="text-lg" /></div>
              <div><p className="text-white/90 font-semibold">Bank-Grade Security</p><p className="text-white/40 text-sm">256-bit SSL encryption on every transaction</p></div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex items-center gap-4 border border-white/10 hover:border-pink-400/30 transition-all duration-300 hover:translate-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white"><FaBolt className="text-lg" /></div>
              <div><p className="text-white/90 font-semibold">Instant Transfers</p><p className="text-white/40 text-sm">Send and receive money in seconds</p></div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex items-center gap-4 border border-white/10 hover:border-blue-400/30 transition-all duration-300 hover:translate-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white"><FaGift className="text-lg" /></div>
              <div><p className="text-white/90 font-semibold">Member Rewards</p><p className="text-white/40 text-sm">Earn cashback on every transaction</p></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <img src="https://i.pravatar.cc/100?img=11" className="w-10 h-10 rounded-full border-2 border-white/20 object-cover" alt="" />
              <img src="https://i.pravatar.cc/100?img=32" className="w-10 h-10 rounded-full border-2 border-white/20 object-cover" alt="" />
              <img src="https://i.pravatar.cc/100?img=54" className="w-10 h-10 rounded-full border-2 border-white/20 object-cover" alt="" />
              <img src="https://i.pravatar.cc/100?img=9" className="w-10 h-10 rounded-full border-2 border-white/20 object-cover" alt="" />
            </div>
            <div>
              <div className="text-yellow-400 text-xs tracking-widest">★★★★★</div>
              <p className="text-white/50 text-sm">Loved by <span className="text-white/80 font-medium">1M+</span> customers</p>
            </div>
          </motion.div>

          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-20 right-8 bg-white/10 backdrop-blur-lg rounded-2xl px-4 py-3 hidden xl:block">
            <div className="flex items-center gap-3"><span className="text-2xl">⚡</span><div><p className="text-white text-xs font-medium">Flash Offer</p><p className="text-white/40 text-[10px]">₦5,000 bonus</p></div></div>
          </motion.div>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 2 }} className="absolute bottom-20 right-8 bg-white/10 backdrop-blur-lg rounded-2xl px-4 py-3 hidden xl:block">
            <div className="flex items-center gap-3"><span className="text-2xl">🎁</span><div><p className="text-white text-xs font-medium">Free Transfer</p><p className="text-white/40 text-[10px]">First 3 months</p></div></div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Your Account</h1>
              <p className="text-gray-600 dark:text-gray-400">Already have an account? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Sign in</Link></p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><FaUser className="inline mr-2 text-indigo-500" />Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:text-white`} placeholder="Enter your full name" />
                {errors.name && <p className="mt-1 text-xs text-red-600"><FaTimes className="inline mr-1" />{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><FaEnvelope className="inline mr-2 text-indigo-500" />Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:text-white`} placeholder="you@example.com" />
                {errors.email && <p className="mt-1 text-xs text-red-600"><FaTimes className="inline mr-1" />{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><FaPhone className="inline mr-2 text-indigo-500" />Phone Number (Optional)</label>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:text-white`} placeholder="08012345678" />
                {errors.phoneNumber && <p className="mt-1 text-xs text-red-600"><FaTimes className="inline mr-1" />{errors.phoneNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><FaLock className="inline mr-2 text-indigo-500" />Password *</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className={`w-full px-4 py-3 pr-12 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:text-white`} placeholder="Create a password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500 dark:text-gray-400">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600"><FaTimes className="inline mr-1" />{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><FaLock className="inline mr-2 text-indigo-500" />Confirm Password *</label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`w-full px-4 py-3 pr-12 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:text-white`} placeholder="Confirm your password" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-500 dark:text-gray-400">{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600"><FaTimes className="inline mr-1" />{errors.confirmPassword}</p>}
              </div>
              <div className="flex items-start">
                <input type="checkbox" id="terms" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} className="mt-1 mr-3 rounded text-indigo-600" />
                <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">I agree to the <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</a></label>
              </div>
              {errors.terms && <p className="text-xs text-red-600"><FaTimes className="inline mr-1" />{errors.terms}</p>}
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="relative my-8"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-600"></div></div><div className="relative flex justify-center text-sm"><span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or sign up with</span></div></div>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={handleGoogleSignUp} disabled={oauthLoading.google} className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">{oauthLoading.google ? <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full" /> : <FaGoogle className="text-red-500 text-xl" />}</button>
              <button onClick={handleFacebookSignUp} disabled={oauthLoading.facebook} className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">{oauthLoading.facebook ? <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" /> : <FaFacebook className="text-blue-600 text-xl" />}</button>
              <button onClick={handleTwitterSignUp} disabled={oauthLoading.twitter} className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">{oauthLoading.twitter ? <div className="animate-spin h-5 w-5 border-2 border-sky-500 border-t-transparent rounded-full" /> : <FaTwitter className="text-sky-500 text-xl" />}</button>
            </div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">By signing up, you agree to receive occasional emails about new features and deals.</p>
          </motion.div>
        </div>
      </div>
      <style>{`.bg-grid-pattern{background-image:linear-gradient(rgba(255,255,255,0.03)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03)1px,transparent 1px);background-size:56px 56px}`}</style>
    </div>
  );
};

export default Register;