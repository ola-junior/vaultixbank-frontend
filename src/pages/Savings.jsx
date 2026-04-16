import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  FaPiggyBank, FaChartLine, FaLock, FaArrowRight,
  FaCheckCircle, FaSpinner, FaWallet
} from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import api from '../services/api';

const Savings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);

  const plans = [
    { id: 'flex', name: 'Flex Save', rate: '8%', minAmount: 1000, color: '#6366f1', description: 'Withdraw anytime', lockPeriod: 'No lock' },
    { id: 'fixed', name: 'Fixed Save', rate: '12%', minAmount: 10000, color: '#10b981', description: 'Higher interest', lockPeriod: '90 days' },
    { id: 'goal', name: 'Goal Save', rate: '15%', minAmount: 50000, color: '#f59e0b', description: 'Target savings', lockPeriod: '180 days' },
  ];

// In Savings.jsx, update the handleCreateSavings function:

const handleCreateSavings = async () => {
  if (!selectedPlan) {
    toast.error('Please select a savings plan');
    return;
  }
  if (!amount || Number(amount) < selectedPlan.minAmount) {
    toast.error(`Minimum amount is ${formatCurrency(selectedPlan.minAmount)}`);
    return;
  }
  if (Number(amount) > (user?.balance || 0)) {
    toast.error('Insufficient balance');
    return;
  }
  
  // Create savings directly (no PIN modal needed for savings)
  setLoading(true);
  try {
    const res = await api.post('/savings/create', {
      planId: selectedPlan.id,
      amount: Number(amount)
    });
    if (res.data.success) {
      updateUser({ ...user, balance: res.data.newBalance });
      toast.success(`✅ ${formatCurrency(amount)} added to ${selectedPlan.name}!`);
      setAmount('');
      setSelectedPlan(null);
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to create savings');
  } finally {
    setLoading(false);
  }
};

  const handlePinVerified = async (pin) => {
    setShowPinModal(false);
    setLoading(true);
    try {
      const res = await api.post('/savings/create', {
        planId: selectedPlan.id,
        amount: Number(amount),
        pin
      });
      if (res.data.success) {
        updateUser({ ...user, balance: res.data.newBalance });
        toast.success('Savings created successfully!');
        setAmount('');
        setSelectedPlan(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create savings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          GWealth Savings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Grow your wealth with competitive interest rates
        </p>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <FaPiggyBank className="text-3xl" />
          <div>
            <p className="text-white/80 text-sm">Available Balance</p>
            <p className="text-3xl font-bold">{formatCurrency(user?.balance || 0)}</p>
          </div>
        </div>
        <p className="text-white/70 text-sm">Start saving today and earn up to 15% interest per annum</p>
      </motion.div>

      {/* Savings Plans */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Choose a Savings Plan</h2>
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
              style={{
                borderColor: selectedPlan?.id === plan.id ? plan.color : 'transparent'
              }}
            >
              {selectedPlan?.id === plan.id && (
                <FaCheckCircle className="absolute top-4 right-4 text-xl" style={{ color: plan.color }} />
              )}
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: plan.color + '20' }}
              >
                <FaChartLine style={{ color: plan.color, fontSize: 20 }} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
              <p className="text-2xl font-black mb-2" style={{ color: plan.color }}>{plan.rate}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{plan.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Min: {formatCurrency(plan.minAmount)}</span>
                <span className="flex items-center gap-1 text-gray-500">
                  <FaLock className="text-xs" /> {plan.lockPeriod}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Create Savings */}
      {selectedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">
            Create {selectedPlan.name}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount to Save (₦)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={selectedPlan.minAmount}
                max={user?.balance || 0}
                placeholder={`Min: ${formatCurrency(selectedPlan.minAmount)}`}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateSavings}
              disabled={loading}
              className="w-full py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${selectedPlan.color}, ${selectedPlan.color}dd)` }}
            >
              {loading ? <FaSpinner className="animate-spin" /> : (
                <>Create Savings <FaArrowRight /></>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Savings;