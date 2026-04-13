import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { signInWithGoogle, signInWithFacebook, signInWithTwitter, signOutFromFirebase } from '../firebase/config';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        validateToken();
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const validateToken = async () => {
    try {
      const response = await api.get('/auth/me');
      const validatedUser = response.data.user;
      setUser(validatedUser);
      localStorage.setItem('user', JSON.stringify(validatedUser));
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      toast.success(response.data.message || 'Registration successful! Please check your email.');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Firebase OAuth Handlers
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        const firebaseUser = result.user;
        
        // Sync user with backend
        try {
          await api.post('/auth/sync-user', {
            email: firebaseUser.email,
            firebaseUid: firebaseUser.uid,
            name: firebaseUser.displayName,
            profilePicture: firebaseUser.photoURL,
            provider: 'google'
          });
        } catch (syncError) {
          console.warn('User sync warning:', syncError.message);
        }
        
        // Send to backend to create/get user
        const response = await api.post('/auth/oauth-login', {
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          profilePicture: firebaseUser.photoURL,
          provider: 'google',
          providerId: firebaseUser.uid
        });
        
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        toast.success('Logged in with Google!');
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      toast.error('Google login failed');
      return { success: false };
    }
  };

  const loginWithFacebook = async () => {
    try {
      const result = await signInWithFacebook();
      if (result.success) {
        const firebaseUser = result.user;
        
        // Sync user with backend
        try {
          await api.post('/auth/sync-user', {
            email: firebaseUser.email,
            firebaseUid: firebaseUser.uid,
            name: firebaseUser.displayName,
            profilePicture: firebaseUser.photoURL,
            provider: 'facebook'
          });
        } catch (syncError) {
          console.warn('User sync warning:', syncError.message);
        }
        
        const response = await api.post('/auth/oauth-login', {
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          profilePicture: firebaseUser.photoURL,
          provider: 'facebook',
          providerId: firebaseUser.uid
        });
        
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        toast.success('Logged in with Facebook!');
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      toast.error('Facebook login failed');
      return { success: false };
    }
  };

  const loginWithTwitter = async () => {
    try {
      const result = await signInWithTwitter();
      if (result.success) {
        const firebaseUser = result.user;
        
        // Sync user with backend
        try {
          await api.post('/auth/sync-user', {
            email: firebaseUser.email || `${firebaseUser.displayName}@twitter.com`,
            firebaseUid: firebaseUser.uid,
            name: firebaseUser.displayName,
            profilePicture: firebaseUser.photoURL,
            provider: 'twitter'
          });
        } catch (syncError) {
          console.warn('User sync warning:', syncError.message);
        }
        
        const response = await api.post('/auth/oauth-login', {
          email: firebaseUser.email || `${firebaseUser.displayName}@twitter.com`,
          name: firebaseUser.displayName,
          profilePicture: firebaseUser.photoURL,
          provider: 'twitter',
          providerId: firebaseUser.uid
        });
        
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        toast.success('Logged in with Twitter!');
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      toast.error('Twitter login failed');
      return { success: false };
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      
      if (response.data.success) {
        const { token: authToken, user } = response.data;
        
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        toast.success('Email verified successfully!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Email verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      toast.success(response.data.message || 'Verification email resent!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    await signOutFromFirebase();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const refreshedUser = response.data.user;
      setUser(refreshedUser);
      localStorage.setItem('user', JSON.stringify(refreshedUser));
      return { success: true, user: refreshedUser };
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    login,
    register,
    loginWithGoogle,
    loginWithFacebook,
    loginWithTwitter,
    verifyEmail,
    resendVerification,
    logout,
    updateUser,
    refreshUser,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};