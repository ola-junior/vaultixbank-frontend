import React, { useState, useRef, useEffect } from 'react';
import { FaLock, FaTimes } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PinSetupModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const confirmInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPin('');
      setConfirmPin('');
      setError('');
      setTimeout(() => {
        inputRefs[0]?.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handlePinChange = (index, value, isConfirm = false) => {
    if (!/^\d*$/.test(value)) return;
    
    const currentPin = isConfirm ? confirmPin : pin;
    const newPin = currentPin.substring(0, index) + value + currentPin.substring(index + 1);
    
    if (isConfirm) {
      setConfirmPin(newPin);
    } else {
      setPin(newPin);
    }
    
    if (value && index < 3) {
      const refs = isConfirm ? confirmInputRefs : inputRefs;
      refs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (e, index, isConfirm = false) => {
    if (e.key === 'Backspace') {
      const currentPin = isConfirm ? confirmPin : pin;
      if (!currentPin[index] && index > 0) {
        const refs = isConfirm ? confirmInputRefs : inputRefs;
        refs[index - 1]?.current?.focus();
      }
    }
  };

  const handleContinue = () => {
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }
    
    // Prevent weak PINs
    const weakPins = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '4321'];
    if (weakPins.includes(pin)) {
      setError('Please choose a more secure PIN');
      return;
    }
    
    setError('');
    setStep(2);
    setTimeout(() => {
      confirmInputRefs[0]?.current?.focus();
    }, 100);
  };

  const handleSubmit = async () => {
    if (confirmPin.length !== 4) {
      setError('Please confirm your 4-digit PIN');
      return;
    }
    
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/user/set-pin', { 
        pin, 
        confirmPin 
      });
      
      if (response.data.success) {
        toast.success('Transaction PIN set successfully!');
        onSuccess();
        onClose();
      } else {
        setError(response.data.message || 'Failed to set PIN');
      }
    } catch (error) {
      console.error('Set PIN error:', error);
      
      if (error.response) {
        // Server responded with error
        setError(error.response.data?.message || 'Failed to set PIN');
      } else if (error.request) {
        // No response received
        setError('Network error. Please check your connection.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
    setConfirmPin('');
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
            {step === 1 ? 'Set Transaction PIN' : 'Confirm PIN'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {step === 1 
              ? 'Create a 4-digit PIN for transactions' 
              : 'Re-enter your PIN to confirm'}
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          {(step === 1 ? inputRefs : confirmInputRefs).map((ref, index) => (
            <input
              key={index}
              ref={ref}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={(step === 1 ? pin : confirmPin)[index] || ''}
              onChange={(e) => handlePinChange(index, e.target.value, step === 2)}
              onKeyDown={(e) => handleKeyDown(e, index, step === 2)}
              className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white outline-none transition-all"
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          {step === 2 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={step === 1 ? handleContinue : handleSubmit}
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mx-auto" />
            ) : (
              step === 1 ? 'Continue' : 'Set PIN'
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          This PIN will be required for all transactions
        </p>
      </div>
    </div>
  );
};

export default PinSetupModal;