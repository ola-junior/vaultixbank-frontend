import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  FaPiggyBank, FaChartLine, FaLock, FaArrowRight,
  FaCheckCircle, FaSpinner, FaWallet, FaHistory,
  FaUnlock, FaPlus, FaEye, FaEyeSlash, FaArrowLeft
} from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import api from '../services/api';

const Savings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [savings, setSavings] = useState([]);
  const [loadingSavings, setLoadingSavings] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, history

  const plans = [
    { 
      id: 'flex', 
      name: 'Flex Save', 
      rate: '8%', 
      minAmount: 1000, 
      color: '#6366f1', 
      description: 'Withdraw anytime', 
      lockPeriod: 'No lock',
      icon: FaUnlock 
    },
    { 
      id: 'fixed', 
      name: 'Fixed Save', 
      rate: '12%', 
      minAmount: 10000, 
      color: '#10b981', 
      description: 'Higher interest', 
      lockPeriod: '90 days',
      icon: FaLock 
    },
    { 
      id: 'goal', 
      name: 'Goal Save', 
      rate: '15%', 
      minAmount: 50000, 
      color: '#f59e0b', 
      description: 'Target savings', 
      lockPeriod: '180 days',
      icon: FaPiggyBank 
    },
  ];

  // Fetch savings on mount
  useEffect(() => {
    fetchSavings();
  }, []);

  const fetchSavings = async () => {
    setLoadingSavings(true);
    try {
      const res = await api.get('/savings');
      if (res.data.success) {
        setSavings(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch savings:', err);
    } finally {
      setLoadingSavings(false);
    }
  };

  // Calculate totals
  const totalLocked = savings
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);
  
  const totalInterestEarned = savings
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.interestEarned || 0), 0);
  
  const availableBalance = user?.balance || 0;
  const totalBalance = availableBalance + totalLocked;

  const handleCreateSavings = async () => {
    if (!selectedPlan) {
      toast.error('Please select a savings plan');
      return;
    }
    if (!amount || Number(amount) < selectedPlan.minAmount) {
      toast.error(`Minimum amount is ${formatCurrency(selectedPlan.minAmount)}`);
      return;
    }
    if (Number(amount) > availableBalance) {
      toast.error('Insufficient available balance');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post('/savings/create', {
        planId: selectedPlan.id,
        amount: Number(amount)
      });
      
      if (res.data.success) {
        // Update user balance
        updateUser({ ...user, balance: res.data.newBalance });
        
        // Refresh savings list
        await fetchSavings();
        
        toast.success(`✅ ${formatCurrency(amount)} locked in ${selectedPlan.name}!`);
        setAmount('');
        setSelectedPlan(null);
        setShowCreateModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create savings');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (savingsId) => {
    const saving = savings.find(s => s._id === savingsId);
    
    // Check if lock period has expired
    if (saving.lockPeriod > 0) {
      const maturityDate = new Date(saving.maturityDate);
      if (maturityDate > new Date()) {
        const daysLeft = Math.ceil((maturityDate - new Date()) / (1000 * 60 * 60 * 24));
        toast.error(`Cannot withdraw yet. ${daysLeft} days remaining until maturity.`);
        return;
      }
    }
    
    if (!window.confirm(`Withdraw ${formatCurrency(saving.amount)} + interest from ${saving.planName}?`)) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post(`/savings/withdraw/${savingsId}`);
      if (res.data.success) {
        updateUser({ ...user, balance: res.data.newBalance });
        await fetchSavings();
        toast.success(`✅ ${formatCurrency(res.data.totalWithdrawn)} returned to your balance!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw');
    } finally {
      setLoading(false);
    }
  };

  const getDaysLeft = (maturityDate) => {
    if (!maturityDate) return null;
    const days = Math.ceil((new Date(maturityDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            GWealth SafeBox
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Lock your funds and earn high interest
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg"
        >
          <FaPlus /> Create SafeBox
        </motion.button>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <FaWallet className="text-2xl opacity-80" />
            <button onClick={() => setShowBalance(!showBalance)} className="opacity-80">
              {showBalance ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <p className="text-white/70 text-sm">Total Balance</p>
          <p className="text-2xl font-bold">
            {showBalance ? formatCurrency(totalBalance) : '••••••'}
          </p>
        </motion.div>

        {/* Available Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-xl"
        >
          <FaWallet className="text-2xl mb-2 opacity-80" />
          <p className="text-white/70 text-sm">Available Balance</p>
          <p className="text-2xl font-bold">
            {showBalance ? formatCurrency(availableBalance) : '••••••'}
          </p>
        </motion.div>

        {/* Locked Savings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-xl"
        >
          <FaLock className="text-2xl mb-2 opacity-80" />
          <p className="text-white/70 text-sm">Locked in SafeBox</p>
          <p className="text-2xl font-bold">
            {showBalance ? formatCurrency(totalLocked) : '••••••'}
          </p>
          <p className="text-white/60 text-xs mt-1">
            Interest Earned: {showBalance ? formatCurrency(totalInterestEarned) : '••••'}
          </p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          My SafeBoxes
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          History
        </button>
      </div>

      {/* Active SafeBoxes */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {loadingSavings ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="animate-spin text-indigo-500 text-3xl" />
            </div>
          ) : savings.filter(s => s.status === 'active').length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <FaPiggyBank className="text-5xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Active SafeBox
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Create a SafeBox to start earning interest
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium"
              >
                Create SafeBox
              </motion.button>
            </div>
          ) : (
            savings.filter(s => s.status === 'active').map((saving) => {
              const plan = plans.find(p => p.id === saving.planId) || {};
              const daysLeft = getDaysLeft(saving.maturityDate);
              const canWithdraw = saving.lockPeriod === 0 || daysLeft === 0;
              
              return (
                <motion.div
                  key={saving._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: plan.color + '20' }}
                      >
                        {saving.lockPeriod === 0 ? (
                          <FaUnlock style={{ color: plan.color, fontSize: 20 }} />
                        ) : (
                          <FaLock style={{ color: plan.color, fontSize: 20 }} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          {saving.planName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Created {new Date(saving.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(saving.amount)}
                      </p>
                      <p className="text-sm" style={{ color: plan.color }}>
                        +{saving.interestRate}% p.a.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      {saving.lockPeriod > 0 ? (
                        <p className="text-sm text-gray-500">
                          {canWithdraw ? (
                            <span className="text-green-500">✓ Matured - Ready to withdraw</span>
                          ) : (
                            <span>⏰ {daysLeft} days until maturity</span>
                          )}
                        </p>
                      ) : (
                        <p className="text-sm text-green-500">✓ Available for withdrawal anytime</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Interest Earned: {formatCurrency(saving.interestEarned || 0)}
                      </p>
                    </div>
                    {canWithdraw && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleWithdraw(saving._id)}
                        disabled={loading}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg text-sm font-medium"
                      >
                        Withdraw
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {savings.filter(s => s.status !== 'active').length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <FaHistory className="text-5xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No past SafeBoxes</p>
            </div>
          ) : (
            savings.filter(s => s.status !== 'active').map((saving) => (
              <div key={saving._id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{saving.planName}</p>
                    <p className="text-sm text-gray-500">
                      Withdrawn on {new Date(saving.withdrawalDate).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(saving.amount)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create SafeBox Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedPlan(null);
                      setAmount('');
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <FaArrowLeft />
                  </button>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Create SafeBox
                  </h3>
                </div>

                {/* Step 1: Choose Plan */}
                {!selectedPlan ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Choose a savings plan
                    </p>
                    {plans.map((plan) => (
                      <motion.button
                        key={plan.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPlan(plan)}
                        className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-left hover:border-indigo-500 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: plan.color + '20' }}
                          >
                            <plan.icon style={{ color: plan.color, fontSize: 18 }} />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-white">{plan.name}</p>
                            <p className="text-xs text-gray-500">{plan.description}</p>
                          </div>
                          <p className="font-bold" style={{ color: plan.color }}>{plan.rate}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl" style={{ backgroundColor: selectedPlan.color + '10' }}>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedPlan.name}</p>
                      <p className="text-sm text-gray-500">Interest Rate: {selectedPlan.rate} p.a.</p>
                      <p className="text-sm text-gray-500">Lock Period: {selectedPlan.lockPeriod}</p>
                      <p className="text-sm text-gray-500">Min Amount: {formatCurrency(selectedPlan.minAmount)}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Amount to Lock (₦)
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={selectedPlan.minAmount}
                        max={availableBalance}
                        placeholder={`Min: ${formatCurrency(selectedPlan.minAmount)}`}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-lg font-semibold"
                        autoFocus
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Available: {formatCurrency(availableBalance)}
                      </p>
                    </div>

                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        ⚠️ This amount will be locked and cannot be used for payments until withdrawn.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedPlan(null);
                          setAmount('');
                        }}
                        className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
                      >
                        Back
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreateSavings}
                        disabled={loading}
                        className="flex-1 py-3 text-white font-bold rounded-xl disabled:opacity-50"
                        style={{ background: `linear-gradient(135deg, ${selectedPlan.color}, ${selectedPlan.color}dd)` }}
                      >
                        {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Lock Funds'}
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Savings;