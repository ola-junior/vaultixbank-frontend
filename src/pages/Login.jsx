import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase/config';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaTwitter, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login: backendLogin, loginWithGoogle, loginWithFacebook, loginWithTwitter } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [oauthLoading, setOauthLoading] = useState({ google: false, facebook: false, twitter: false });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) { toast.error('Please enter your email and password'); return; }
    
    setLoading(true);
    try {
      // 1. Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, formData.email.trim().toLowerCase(), formData.password);
      
      // 2. Check if email is verified
      if (!userCredential.user.emailVerified) {
        toast.error('Please verify your email before logging in.');
        if (window.confirm('Resend verification email?')) {
          const actionCodeSettings = { url: `${window.location.origin}/verify`, handleCodeInApp: true };
          await sendEmailVerification(userCredential.user, actionCodeSettings);
          toast.success('Verification email resent! Check your inbox.');
        }
        setLoading(false);
        return;
      }
      
      // 3. Email verified - login to backend
      const result = await backendLogin(formData.email, formData.password);
      if (result.success) navigate('/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many attempts. Try again later.');
      } else if (error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password');
      } else {
        toast.error(error.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setOauthLoading(prev => ({ ...prev, google: true }));
    try { const result = await loginWithGoogle(); if (result?.success) navigate('/dashboard'); } 
    catch { toast.error('Google login failed'); } 
    finally { setOauthLoading(prev => ({ ...prev, google: false })); }
  };

  const handleFacebookLogin = async () => {
    setOauthLoading(prev => ({ ...prev, facebook: true }));
    try { const result = await loginWithFacebook(); if (result?.success) navigate('/dashboard'); } 
    catch { toast.error('Facebook login failed'); } 
    finally { setOauthLoading(prev => ({ ...prev, facebook: false })); }
  };

  const handleTwitterLogin = async () => {
    setOauthLoading(prev => ({ ...prev, twitter: true }));
    try { const result = await loginWithTwitter(); if (result?.success) navigate('/dashboard'); } 
    catch { toast.error('Twitter login failed'); } 
    finally { setOauthLoading(prev => ({ ...prev, twitter: false })); }
  };

  const fillDemoCredentials = () => {
    setFormData({ email: 'demo@vaultix.com', password: 'demo123' });
    toast.success('Demo credentials filled!');
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-bold leading-tight mb-6 text-5xl">Welcome<br /><span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Back!</span></motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-white/60 text-lg mb-8">Access your account to manage your finances.</motion.p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-400">Don't have an account? <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Sign up</Link></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2"><FaEnvelope className="inline mr-2 text-indigo-500" />Email</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 dark:text-white" placeholder="Enter your email" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium"><FaLock className="inline mr-2 text-indigo-500" />Password</label>
                <Link to="/forgot-password" className="text-xs text-indigo-600 hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleChange} className="w-full px-4 py-3 pr-12 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 dark:text-white" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded text-indigo-600 mr-2" />
              <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">Remember me</label>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50">
              {loading ? <span className="flex items-center justify-center"><div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>Signing in...</span> : <><FaUser className="inline mr-2" />Sign In</>}
            </button>
          </form>

          <div className="relative my-8"><div className="absolute inset-0 flex items-center"><div className="w-full border-t"></div></div><div className="relative flex justify-center text-sm"><span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500">Or continue with</span></div></div>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={handleGoogleLogin} disabled={oauthLoading.google} className="flex items-center justify-center px-4 py-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">{oauthLoading.google ? <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full" /> : <FaGoogle className="text-red-500 text-xl" />}</button>
            <button onClick={handleFacebookLogin} disabled={oauthLoading.facebook} className="flex items-center justify-center px-4 py-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">{oauthLoading.facebook ? <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" /> : <FaFacebook className="text-blue-600 text-xl" />}</button>
            <button onClick={handleTwitterLogin} disabled={oauthLoading.twitter} className="flex items-center justify-center px-4 py-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">{oauthLoading.twitter ? <div className="animate-spin h-5 w-5 border-2 border-sky-500 border-t-transparent rounded-full" /> : <FaTwitter className="text-sky-500 text-xl" />}</button>
          </div>

          <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">Demo Credentials</p>
              <button onClick={fillDemoCredentials} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg">Fill Demo</button>
            </div>
            <p className="text-sm"><FaEnvelope className="inline mr-2 text-indigo-500 text-xs" />demo@vaultix.com</p>
            <p className="text-sm"><FaLock className="inline mr-2 text-indigo-500 text-xs" />demo123</p>
          </div>
        </div>
      </div>
      <style>{`.bg-grid-pattern{background-image:linear-gradient(rgba(255,255,255,0.03)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03)1px,transparent 1px);background-size:56px 56px}`}</style>
    </div>
  );
};

export default Login;