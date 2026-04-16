import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaHeart, FaChild, FaGraduationCap, FaAppleAlt,
  FaArrowRight, FaSpinner, FaCheckCircle
} from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import api from '../services/api';

const Play4AChild = () => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedCause, setSelectedCause] = useState(null);

  const causes = [
    { id: 'education', name: 'Education', icon: FaGraduationCap, color: '#8b5cf6', description: 'Sponsor a child\'s education' },
    { id: 'health', name: 'Healthcare', icon: FaHeart, color: '#ef4444', description: 'Provide medical care' },
    { id: 'nutrition', name: 'Nutrition', icon: FaAppleAlt, color: '#10b981', description: 'Fight child hunger' },
    { id: 'general', name: 'General Support', icon: FaChild, color: '#f59e0b', description: 'Support where needed most' },
  ];

  const quickAmounts = [5000, 10000, 25000, 50000, 100000];

  const handleDonate = async () => {
    if (!amount || Number(amount) < 1000) {
      toast.error('Minimum donation is ₦1,000');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/donations/play4achild', {
        amount: Number(amount),
        cause: selectedCause?.id || 'general'
      });
      if (res.data.success) {
        toast.success('Thank you for your donation! ❤️');
        setAmount('');
        setSelectedCause(null);
      }
    } catch (err) {
      toast.error('Donation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Play4AChild
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Make a difference in a child's life today
        </p>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <FaHeart className="text-3xl" />
          <div>
            <p className="text-white/80 text-sm">Your Impact</p>
            <p className="text-xl font-bold">5,000+ Children Supported</p>
          </div>
        </div>
        <p className="text-white/70 text-sm">100% of your donation goes directly to helping children</p>
      </motion.div>

      {/* Causes */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Choose a Cause</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {causes.map((cause) => (
            <motion.button
              key={cause.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCause(cause)}
              className={`relative p-4 rounded-xl text-center transition-all ${
                selectedCause?.id === cause.id
                  ? 'bg-white dark:bg-gray-800 shadow-lg border-2'
                  : 'bg-white dark:bg-gray-800 shadow border border-gray-100 dark:border-gray-700'
              }`}
              style={{ borderColor: selectedCause?.id === cause.id ? cause.color : 'transparent' }}
            >
              {selectedCause?.id === cause.id && (
                <FaCheckCircle className="absolute top-2 right-2 text-xs" style={{ color: cause.color }} />
              )}
              <cause.icon className="text-2xl mx-auto mb-2" style={{ color: cause.color }} />
              <p className="font-medium text-gray-900 dark:text-white text-sm">{cause.name}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Donation Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
      >
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Make a Donation</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (₦)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1000"
              placeholder="Enter amount"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white text-lg font-semibold"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt.toString())}
                className={`py-2 border rounded-xl text-sm font-semibold transition-all ${
                  amount === amt.toString()
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-700'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                }`}
              >
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleDonate}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
          >
            {loading ? <FaSpinner className="animate-spin" /> : (
              <>Donate Now <FaHeart className="animate-pulse" /></>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Play4AChild;