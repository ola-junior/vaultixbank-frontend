import React, { useState, useRef, useEffect } from 'react';
import { FaLock, FaTimes } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PinVerificationModal = ({ isOpen, onClose, onVerify, title = 'Enter Transaction PIN' }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setAttempts(0);
      setTimeout(() => {
        inputRefs[0]?.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handlePinChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPin = pin.substring(0, index) + value + pin.substring(index + 1);
    setPin(newPin);
    
    if (value && index < 3) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
    
    // Submit on Enter if PIN is complete
    if (e.key === 'Enter' && pin.length === 4 && !loading) {
      handleVerify();
    }
  };

  const handleVerify = async () => {
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/user/verify-pin', { pin });
      
      if (response.data.success) {
        onVerify(pin);
        onClose();
      } else {
        setError(response.data.message || 'Invalid PIN');
        setAttempts(prev => prev + 1);
        setPin('');
        inputRefs[0]?.current?.focus();
      }
    } catch (error) {
      console.error('Verify PIN error:', error);
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (error.response) {
        const errorData = error.response.data;
        
        if (errorData?.needsSetup) {
          toast.error('Please set your transaction PIN first');
          onClose();
          return;
        }
        
        setError(errorData?.message || 'Invalid PIN');
      } else if (error.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An error occurred. Please try again.');
      }
      
      setPin('');
      inputRefs[0]?.current?.focus();
      
      // Too many attempts warning
      if (newAttempts >= 3) {
        toast.error('Multiple failed attempts. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <FaTimes />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaLock className="text-white text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Enter your 4-digit transaction PIN
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          {inputRefs.map((ref, index) => (
            <input
              key={index}
              ref={ref}
              type="password"
              inputMode="numeric"
              maxLength="1"
              value={pin[index] || ''}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white outline-none transition-all"
              autoComplete="off"
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <button
          onClick={handleVerify}
          disabled={loading || pin.length !== 4}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mx-auto" />
          ) : (
            'Verify'
          )}
        </button>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          Forgot PIN? You can reset it in Security Settings
        </p>
      </div>
    </div>
  );
};

export default PinVerificationModal;