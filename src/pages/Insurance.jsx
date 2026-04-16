import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaShieldAlt, FaHeartbeat, FaCar, FaHome, FaPlane,
  FaCheckCircle, FaArrowRight, FaSpinner
} from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import api from '../services/api';

const Insurance = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const plans = [
    { id: 'health', name: 'Health Insurance', icon: FaHeartbeat, color: '#ef4444', price: 15000, description: 'Comprehensive health coverage' },
    { id: 'auto', name: 'Auto Insurance', icon: FaCar, color: '#3b82f6', price: 25000, description: 'Vehicle protection plan' },
    { id: 'home', name: 'Home Insurance', icon: FaHome, color: '#10b981', price: 20000, description: 'Property & contents cover' },
    { id: 'travel', name: 'Travel Insurance', icon: FaPlane, color: '#8b5cf6', price: 10000, description: 'Trip protection' },
  ];

  const handleGetQuote = async () => {
    if (!selectedPlan) {
      toast.error('Please select an insurance plan');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/insurance/quote', {
        planId: selectedPlan.id,
        ...formData
      });
      toast.success(`Quote generated! Premium: ${formatCurrency(res.data.premium)}`);
    } catch (err) {
      toast.error('Failed to get quote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Insurance
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Protect what matters most with comprehensive coverage
        </p>
      </div>

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <FaShieldAlt className="text-3xl" />
          <div>
            <p className="text-white/80 text-sm">Get Protected Today</p>
            <p className="text-xl font-bold">Insurance starting from ₦10,000/year</p>
          </div>
        </div>
        <p className="text-white/70 text-sm">Quick claims • 24/7 support • Instant coverage</p>
      </motion.div>

      {/* Insurance Plans */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Choose Insurance Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <motion.button
              key={plan.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlan(plan)}
              className={`relative p-5 rounded-2xl text-left transition-all ${
                selectedPlan?.id === plan.id
                  ? 'bg-white dark:bg-gray-800 shadow-xl border-2'
                  : 'bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700'
              }`}
              style={{ borderColor: selectedPlan?.id === plan.id ? plan.color : 'transparent' }}
            >
              {selectedPlan?.id === plan.id && (
                <FaCheckCircle className="absolute top-3 right-3" style={{ color: plan.color }} />
              )}
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: plan.color + '20' }}
              >
                <plan.icon style={{ color: plan.color, fontSize: 18 }} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{plan.description}</p>
              <p className="text-lg font-bold" style={{ color: plan.color }}>
                {formatCurrency(plan.price)}<span className="text-xs font-normal">/year</span>
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quote Form */}
      {selectedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">
            Get {selectedPlan.name} Quote
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleGetQuote}
              disabled={loading}
              className="w-full py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${selectedPlan.color}, ${selectedPlan.color}dd)` }}
            >
              {loading ? <FaSpinner className="animate-spin" /> : (
                <>Get Quote <FaArrowRight /></>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Insurance;