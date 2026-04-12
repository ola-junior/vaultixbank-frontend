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
    const loadingToast = toast.loading('Creating your account...');
    
    try {
      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email.trim().toLowerCase(), 
        formData.password
      );
      
      // 2. Update profile with name
      await updateProfile(userCredential.user, { displayName: formData.name.trim() });
      
      // 3. Send verification email with custom redirect
      const actionCodeSettings = {
        url: `${window.location.origin}/verify`,
        handleCodeInApp: true
      };
      await sendEmailVerification(userCredential.user, actionCodeSettings);
      
      // 4. Create user in backend database
      await api.post('/auth/register', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phoneNumber: formData.phoneNumber ? formData.phoneNumber.replace(/\s/g, '') : undefined,
        firebaseUid: userCredential.user.uid
      });
      
      toast.dismiss(loadingToast);
      setRegisteredEmail(formData.email);
      setRegistrationComplete(true);
      setFormData({ name: '', email: '', password: '', confirmPassword: '', phoneNumber: '' });
      setAgreeToTerms(false);
      toast.success('Registration successful! Please check your email to verify your account.');
      
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Registration error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already registered. Please login instead.');
        setTimeout(() => { if (window.confirm('Go to login page?')) navigate('/login'); }, 1000);
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak. Use at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address.');
      } else {
        toast.error(error.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setOauthLoading(prev => ({ ...prev, google: true }));
    try {
      const result = await loginWithGoogle();
      if (result?.success) { toast.success('Account created with Google!'); navigate('/dashboard'); }
      else toast.error('Google sign-up failed.');
    } catch { toast.error('Google sign-up failed.');
    } finally { setOauthLoading(prev => ({ ...prev, google: false })); }
  };

  const handleFacebookSignUp = async () => {
    setOauthLoading(prev => ({ ...prev, facebook: true }));
    try {
      const result = await loginWithFacebook();
      if (result?.success) { toast.success('Account created with Facebook!'); navigate('/dashboard'); }
      else toast.error('Facebook sign-up failed.');
    } catch { toast.error('Facebook sign-up failed.');
    } finally { setOauthLoading(prev => ({ ...prev, facebook: false })); }
  };

  const handleTwitterSignUp = async () => {
    setOauthLoading(prev => ({ ...prev, twitter: true }));
    try {
      const result = await loginWithTwitter();
      if (result?.success) { toast.success('Account created with Twitter!'); navigate('/dashboard'); }
      else toast.error('Twitter sign-up failed.');
    } catch { toast.error('Twitter sign-up failed.');
    } finally { setOauthLoading(prev => ({ ...prev, twitter: false })); }
  };

  // Success Screen
  if (registrationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="max-w-md w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6"><FaCheckCircle className="w-20 h-20 text-green-500" /></div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Verify Your Email</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">We've sent a verification link to:</p>
            <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-6">{registeredEmail}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Please check your inbox and click the link to activate your account.</p>
            <Link to="/login" className="block w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 shadow-lg">Go to Login</Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Registration Form
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-bold leading-tight mb-6 text-5xl">
            Bank Smarter.<br /><span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Live Better.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-white/60 text-lg mb-8">
            Join thousands getting exclusive benefits and financial freedom.
          </motion.p>
          <div className="space-y-4">
            {[{ icon: FaShieldAlt, title: 'Bank-Grade Security', desc: '256-bit SSL encryption' }, { icon: FaBolt, title: 'Instant Transfers', desc: 'Send and receive in seconds' }, { icon: FaGift, title: 'Member Rewards', desc: 'Earn cashback on transactions' }].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex items-center gap-4 border border-white/10 hover:translate-x-2 transition-all">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center"><item.icon className="text-lg" /></div>
                <div><p className="text-white/90 font-semibold">{item.title}</p><p className="text-white/40 text-sm">{item.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Your Account</h1>
            <p className="text-gray-600 dark:text-gray-400">Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2"><FaUser className="inline mr-2 text-indigo-500" />Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'} dark:text-white`} placeholder="Enter your full name" />
              {errors.name && <p className="mt-1 text-xs text-red-600"><FaTimes className="inline mr-1" />{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2"><FaEnvelope className="inline mr-2 text-indigo-500" />Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'} dark:text-white`} placeholder="you@example.com" />
              {errors.email && <p className="mt-1 text-xs text-red-600"><FaTimes className="inline mr-1" />{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2"><FaPhone className="inline mr-2 text-indigo-500" />Phone (Optional)</label>
              <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} dark:text-white`} placeholder="08012345678" />
              {errors.phoneNumber && <p className="mt-1 text-xs text-red-600"><FaTimes className="inline mr-1" />{errors.phoneNumber}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2"><FaLock className="inline mr-2 text-indigo-500" />Password *</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className={`w-full px-4 py-3 pr-12 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none ${errors.password ? 'border-red-500' : 'border-gray-300'} dark:text-white`} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600"><FaTimes className="inline mr-1" />{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2"><FaLock className="inline mr-2 text-indigo-500" />Confirm Password *</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`w-full px-4 py-3 pr-12 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} dark:text-white`} placeholder="••••••••" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-500">{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600"><FaTimes className="inline mr-1" />{errors.confirmPassword}</p>}
            </div>
            <div className="flex items-start">
              <input type="checkbox" id="terms" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} className="mt-1 mr-3 rounded text-indigo-600" />
              <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">I agree to the <a href="#" className="text-indigo-600 hover:underline">Terms</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a> *</label>
            </div>
            {errors.terms && <p className="text-xs text-red-600"><FaTimes className="inline mr-1" />{errors.terms}</p>}
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50">
              {loading ? <span className="flex items-center justify-center"><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>Creating...</span> : <>Create Account</>}
            </button>
          </form>

          <div className="relative my-8"><div className="absolute inset-0 flex items-center"><div className="w-full border-t"></div></div><div className="relative flex justify-center text-sm"><span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500">Or sign up with</span></div></div>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={handleGoogleSignUp} disabled={oauthLoading.google} className="flex items-center justify-center px-4 py-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">{oauthLoading.google ? <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full" /> : <FaGoogle className="text-red-500 text-xl" />}</button>
            <button onClick={handleFacebookSignUp} disabled={oauthLoading.facebook} className="flex items-center justify-center px-4 py-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">{oauthLoading.facebook ? <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" /> : <FaFacebook className="text-blue-600 text-xl" />}</button>
            <button onClick={handleTwitterSignUp} disabled={oauthLoading.twitter} className="flex items-center justify-center px-4 py-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">{oauthLoading.twitter ? <div className="animate-spin h-5 w-5 border-2 border-sky-500 border-t-transparent rounded-full" /> : <FaTwitter className="text-sky-500 text-xl" />}</button>
          </div>
        </div>
      </div>
      <style>{`.bg-grid-pattern{background-image:linear-gradient(rgba(255,255,255,0.03)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03)1px,transparent 1px);background-size:56px 56px}`}</style>
    </div>
  );
};

export default Register;