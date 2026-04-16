import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  FaHandHoldingUsd, FaCheckCircle, FaArrowRight,
  FaSpinner, FaShieldAlt, FaClock
} from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import api from '../services/api';

const Loans = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);

  const plans = [
    { id: 'quick', name: 'Quick Loan', maxAmount: 100000, rate: '5%', tenure: '30 days', color: '#6366f1', description: 'Instant approval' },
    { id: 'personal', name: 'Personal Loan', maxAmount: 500000, rate: '3%', tenure: '90 days', color: '#10b981', description: 'Low interest' },
    { id: 'business', name: 'Business Loan', maxAmount: 2000000, rate: '2.5%', tenure: '180 days', color: '#f59e0b', description: 'For entrepreneurs' },
  ];

  const calculateRepayment = (amt, rate, tenure) => {
    const interest = (amt * parseFloat(rate)) / 100;
    return amt + interest;
  };

  // In Loans.jsx, update the handleApply function:

const handleApply = async () => {
  if (!selectedPlan) {
    toast.error('Please select a loan plan');
    return;
  }
  if (!amount || Number(amount) < 5000) {
    toast.error('Minimum loan amount is ₦5,000');
    return;
  }
  if (Number(amount) > selectedPlan.maxAmount) {
    toast.error(`Maximum loan amount is ${formatCurrency(selectedPlan.maxAmount)}`);
    return;
  }

  setLoading(true);
  try {
    const res = await api.post('/loans/apply', {
      planId: selectedPlan.id,
      amount: Number(amount)
    });
    if (res.data.success) {
      const newBalance = (user?.balance || 0) + Number(amount);
      updateUser({ ...user, balance: newBalance });
      toast.success(`✅ Loan approved! ${formatCurrency(amount)} added to your account!`);
      setAmount('');
      setSelectedPlan(null);
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Loan application failed');
  } finally {
    setLoading(false);
  }
};

  const handlePinVerified = async (pin) => {
    setShowPinModal(false);
    setLoading(true);
    try {
      const res = await api.post('/loans/apply', {
        planId: selectedPlan.id,
        amount: Number(amount),
        pin
      });
      if (res.data.success) {
        updateUser({ ...user, balance: user.balance + Number(amount) });
        toast.success('Loan approved and disbursed!');
        setAmount('');
        setSelectedPlan(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Loan application failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Quick Loans
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Get instant loans with flexible repayment options
        </p>
      </div>

      {/* Eligibility Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <FaHandHoldingUsd className="text-3xl" />
          <div>
            <p className="text-white/80 text-sm">Loan Eligibility</p>
            <p className="text-3xl font-bold">₦2,000,000</p>
          </div>
        </div>
        <p className="text-white/70 text-sm">You're eligible for up to ₦2M based on your transaction history</p>
      </motion.div>

      {/* Loan Plans */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Choose a Loan Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <motion.button
              key={plan.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlan(plan)}
              className={`relative p-6 rounded-2xl text-left transition-all ${
                selectedPlan?.id === plan.id
                  ? 'bg-white dark:bg-gray-800 shadow-xl border-2'
                  : 'bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700'
              }`}
              style={{ borderColor: selectedPlan?.id === plan.id ? plan.color : 'transparent' }}
            >
              {selectedPlan?.id === plan.id && (
                <FaCheckCircle className="absolute top-4 right-4 text-xl" style={{ color: plan.color }} />
              )}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
              <p className="text-2xl font-black mb-2" style={{ color: plan.color }}>{plan.rate}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{plan.description}</p>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Up to {formatCurrency(plan.maxAmount)}</span>
                <span className="flex items-center gap-1 text-gray-500">
                  <FaClock className="text-xs" /> {plan.tenure}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Apply Form */}
      {selectedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">
            Apply for {selectedPlan.name}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Loan Amount (₦)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={5000}
                max={selectedPlan.maxAmount}
                placeholder={`Min: ₦5,000 - Max: ${formatCurrency(selectedPlan.maxAmount)}`}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {amount && Number(amount) >= 5000 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Repayment Details</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount to Repay:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(calculateRepayment(Number(amount), selectedPlan.rate, 30))}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-500">Due Date:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleApply}
              disabled={loading}
              className="w-full py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${selectedPlan.color}, ${selectedPlan.color}dd)` }}
            >
              {loading ? <FaSpinner className="animate-spin" /> : (
                <>Apply Now <FaArrowRight /></>
              )}
            </motion.button>

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <FaShieldAlt className="text-green-500" />
              <span>Your information is secure and protected</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Loans;