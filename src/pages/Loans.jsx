import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  FaHandHoldingUsd, FaCheckCircle, FaArrowRight,
  FaSpinner, FaShieldAlt, FaClock, FaHistory,
  FaMoneyBillWave, FaCalendarAlt, FaPercentage,
  FaExclamationTriangle, FaArrowLeft, FaWallet,
  FaCreditCard, FaChartLine
} from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import api from '../services/api';

const Loans = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [activeLoans, setActiveLoans] = useState([]);
  const [loanHistory, setLoanHistory] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // active, history, eligibility
  const [eligibility, setEligibility] = useState(null);

  const plans = [
    { 
      id: 'quick', 
      name: 'Quick Loan', 
      maxAmount: 100000, 
      rate: 5, 
      tenure: 30, 
      color: '#6366f1', 
      description: 'Instant approval for urgent needs',
      processingFee: 0,
      requirements: ['Active account', 'Minimum 1 transaction']
    },
    { 
      id: 'personal', 
      name: 'Personal Loan', 
      maxAmount: 500000, 
      rate: 3, 
      tenure: 90, 
      color: '#10b981', 
      description: 'Low interest for personal expenses',
      processingFee: 1000,
      requirements: ['Account older than 30 days', 'Minimum 5 transactions']
    },
    { 
      id: 'business', 
      name: 'Business Loan', 
      maxAmount: 2000000, 
      rate: 2.5, 
      tenure: 180, 
      color: '#f59e0b', 
      description: 'Grow your business with flexible terms',
      processingFee: 5000,
      requirements: ['Account older than 90 days', 'Monthly turnover > ₦100,000']
    },
  ];

  // Fetch loans and eligibility on mount
  useEffect(() => {
    fetchLoans();
    fetchEligibility();
  }, []);

  const fetchLoans = async () => {
    setLoadingLoans(true);
    try {
      const res = await api.get('/loans');
      if (res.data.success) {
        const loans = res.data.data || [];
        setActiveLoans(loans.filter(l => l.status === 'active'));
        setLoanHistory(loans.filter(l => l.status !== 'active'));
      }
    } catch (err) {
      console.error('Failed to fetch loans:', err);
    } finally {
      setLoadingLoans(false);
    }
  };

  const fetchEligibility = async () => {
    try {
      const res = await api.get('/loans/eligibility');
      if (res.data.success) {
        setEligibility(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch eligibility:', err);
    }
  };

  const calculateRepayment = (amt, rate, tenure) => {
    const monthlyRate = rate / 100;
    const interest = amt * monthlyRate;
    return {
      totalRepayable: amt + interest,
      monthlyPayment: (amt + interest) / (tenure / 30),
      interestAmount: interest
    };
  };

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

    // Check if user meets requirements
    if (selectedPlan.id === 'personal' && eligibility?.accountAgeDays < 30) {
      toast.error('Your account must be at least 30 days old for a Personal Loan');
      return;
    }
    if (selectedPlan.id === 'business' && eligibility?.accountAgeDays < 90) {
      toast.error('Your account must be at least 90 days old for a Business Loan');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/loans/apply', {
        planId: selectedPlan.id,
        amount: Number(amount)
      });
      
      if (res.data.success) {
        await refreshUser();
        await fetchLoans();
        await fetchEligibility();
        
        toast.success(`✅ Loan approved! ${formatCurrency(amount)} added to your account!`);
        setAmount('');
        setSelectedPlan(null);
        setShowApplyModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Loan application failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRepay = async (loanId, amount) => {
    if (!window.confirm(`Repay ${formatCurrency(amount)} towards this loan?`)) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post(`/loans/repay/${loanId}`, { amount });
      if (res.data.success) {
        await refreshUser();
        await fetchLoans();
        toast.success('Payment successful!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Repayment failed');
    } finally {
      setLoading(false);
    }
  };

  const getDaysLeft = (dueDate) => {
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getLoanStatusBadge = (loan) => {
    const daysLeft = getDaysLeft(loan.dueDate);
    if (loan.status === 'paid') {
      return { text: 'Paid', color: 'bg-green-500' };
    }
    if (daysLeft <= 0) {
      return { text: 'Overdue', color: 'bg-red-500' };
    }
    if (daysLeft <= 7) {
      return { text: 'Due Soon', color: 'bg-yellow-500' };
    }
    return { text: 'Active', color: 'bg-blue-500' };
  };

  const totalActiveLoanAmount = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalOutstanding = activeLoans.reduce((sum, loan) => sum + (loan.totalRepayable - loan.amountRepaid), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Loan Center
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Quick loans with flexible repayment options
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowApplyModal(true)}
          disabled={activeLoans.length >= 2}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaHandHoldingUsd /> Apply for Loan
        </motion.button>
      </div>

      {/* Loan Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Loans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-xl"
        >
          <FaCreditCard className="text-2xl mb-2 opacity-80" />
          <p className="text-white/70 text-sm">Active Loans</p>
          <p className="text-2xl font-bold">{activeLoans.length}</p>
          <p className="text-white/60 text-xs mt-1">
            Total: {formatCurrency(totalActiveLoanAmount)}
          </p>
        </motion.div>

        {/* Outstanding Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-5 text-white shadow-xl"
        >
          <FaMoneyBillWave className="text-2xl mb-2 opacity-80" />
          <p className="text-white/70 text-sm">Outstanding Balance</p>
          <p className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</p>
          <p className="text-white/60 text-xs mt-1">Due for repayment</p>
        </motion.div>

        {/* Available Credit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-xl"
        >
          <FaChartLine className="text-2xl mb-2 opacity-80" />
          <p className="text-white/70 text-sm">Available Credit</p>
          <p className="text-2xl font-bold">
            {formatCurrency(eligibility?.maxEligible || 100000)}
          </p>
          <p className="text-white/60 text-xs mt-1">
            {activeLoans.length}/2 active loans
          </p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'active'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Active Loans {activeLoans.length > 0 && `(${activeLoans.length})`}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Loan History
        </button>
      </div>

      {/* Active Loans */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {loadingLoans ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="animate-spin text-indigo-500 text-3xl" />
            </div>
          ) : activeLoans.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <FaHandHoldingUsd className="text-5xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Active Loans
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                You don't have any active loans at the moment
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowApplyModal(true)}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium"
              >
                Apply for a Loan
              </motion.button>
            </div>
          ) : (
            activeLoans.map((loan) => {
              const plan = plans.find(p => p.id === loan.planId) || {};
              const daysLeft = getDaysLeft(loan.dueDate);
              const statusBadge = getLoanStatusBadge(loan);
              const progress = (loan.amountRepaid / loan.totalRepayable) * 100;
              
              return (
                <motion.div
                  key={loan._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: plan.color + '20' }}
                      >
                        <FaHandHoldingUsd style={{ color: plan.color, fontSize: 20 }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          {loan.planName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Approved {new Date(loan.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusBadge.color}`}>
                      {statusBadge.text}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Loan Amount</p>
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(loan.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Interest Rate</p>
                      <p className="font-bold" style={{ color: plan.color }}>{loan.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Amount Repaid</p>
                      <p className="font-bold text-green-600">{formatCurrency(loan.amountRepaid || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Outstanding</p>
                      <p className="font-bold text-orange-600">
                        {formatCurrency(loan.totalRepayable - (loan.amountRepaid || 0))}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Repayment Progress</span>
                      <span className="text-gray-700 dark:text-gray-300">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <FaCalendarAlt className="text-xs" />
                        <span>Due: {new Date(loan.dueDate).toLocaleDateString()}</span>
                      </div>
                      {daysLeft > 0 && daysLeft <= 7 && (
                        <span className="text-xs text-yellow-600 flex items-center gap-1">
                          <FaExclamationTriangle /> {daysLeft} days left
                        </span>
                      )}
                      {daysLeft <= 0 && loan.status === 'active' && (
                        <span className="text-xs text-red-600 flex items-center gap-1">
                          <FaExclamationTriangle /> Overdue
                        </span>
                      )}
                    </div>
                    {loan.status === 'active' && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRepay(loan._id, loan.totalRepayable - loan.amountRepaid)}
                        disabled={loading}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg text-sm font-medium"
                      >
                        Make Payment
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Loan History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {loanHistory.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <FaHistory className="text-5xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No loan history</p>
            </div>
          ) : (
            loanHistory.map((loan) => (
              <div key={loan._id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{loan.planName}</p>
                    <p className="text-sm text-gray-500">
                      {loan.status === 'paid' ? 'Repaid on' : 'Closed on'} {new Date(loan.repaymentDate || loan.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(loan.amount)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      loan.status === 'paid' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {loan.status === 'paid' ? '✓ Paid' : loan.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Apply Loan Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowApplyModal(false);
                setSelectedPlan(null);
                setAmount('');
              }}
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
                      setShowApplyModal(false);
                      setSelectedPlan(null);
                      setAmount('');
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <FaArrowLeft />
                  </button>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Apply for a Loan
                  </h3>
                </div>

                {!selectedPlan ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Choose a loan plan
                    </p>
                    {plans.map((plan) => {
                      const isEligible = 
                        plan.id === 'quick' ? true :
                        plan.id === 'personal' ? (eligibility?.accountAgeDays || 0) >= 30 :
                        plan.id === 'business' ? (eligibility?.accountAgeDays || 0) >= 90 : false;
                      
                      return (
                        <motion.button
                          key={plan.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedPlan(plan)}
                          disabled={!isEligible}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
                            isEligible
                              ? 'border-gray-200 dark:border-gray-700 hover:border-indigo-500'
                              : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: plan.color + '20' }}
                            >
                              <FaHandHoldingUsd style={{ color: plan.color, fontSize: 18 }} />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 dark:text-white">{plan.name}</p>
                              <p className="text-xs text-gray-500">{plan.description}</p>
                            </div>
                            <p className="font-bold" style={{ color: plan.color }}>{plan.rate}%</p>
                          </div>
                          {!isEligible && (
                            <p className="text-xs text-red-500 mt-2">
                              ⚠️ Not eligible yet. Account must be {plan.id === 'personal' ? '30' : '90'} days old.
                            </p>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl" style={{ backgroundColor: selectedPlan.color + '10' }}>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedPlan.name}</p>
                      <p className="text-sm text-gray-500">Interest Rate: {selectedPlan.rate}%</p>
                      <p className="text-sm text-gray-500">Tenure: {selectedPlan.tenure} days</p>
                      <p className="text-sm text-gray-500">Max Amount: {formatCurrency(selectedPlan.maxAmount)}</p>
                      {selectedPlan.processingFee > 0 && (
                        <p className="text-sm text-gray-500">Processing Fee: {formatCurrency(selectedPlan.processingFee)}</p>
                      )}
                    </div>

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
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-lg font-semibold"
                        autoFocus
                      />
                    </div>

                    {amount && Number(amount) >= 5000 && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Loan Summary</p>
                        {(() => {
                          const repayment = calculateRepayment(Number(amount), selectedPlan.rate, selectedPlan.tenure);
                          return (
                            <>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">Principal Amount:</span>
                                <span className="font-medium">{formatCurrency(Number(amount))}</span>
                              </div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">Interest ({selectedPlan.rate}%):</span>
                                <span className="font-medium">{formatCurrency(repayment.interestAmount)}</span>
                              </div>
                              {selectedPlan.processingFee > 0 && (
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-gray-500">Processing Fee:</span>
                                  <span className="font-medium">{formatCurrency(selectedPlan.processingFee)}</span>
                                </div>
                              )}
                              <div className="border-t border-gray-200 dark:border-gray-600 my-2 pt-2">
                                <div className="flex justify-between font-bold">
                                  <span>Total Repayable:</span>
                                  <span style={{ color: selectedPlan.color }}>
                                    {formatCurrency(repayment.totalRepayable + selectedPlan.processingFee)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex justify-between text-sm mt-2">
                                <span className="text-gray-500">Due Date:</span>
                                <span className="font-medium">
                                  {new Date(Date.now() + selectedPlan.tenure * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        📋 By applying, you agree to repay the total amount by the due date.
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
                        onClick={handleApply}
                        disabled={loading}
                        className="flex-1 py-3 text-white font-bold rounded-xl disabled:opacity-50"
                        style={{ background: `linear-gradient(135deg, ${selectedPlan.color}, ${selectedPlan.color}dd)` }}
                      >
                        {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Apply Now'}
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

export default Loans;