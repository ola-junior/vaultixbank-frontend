import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { useBills } from '../hooks/useBills';
import PinVerificationModal from '../components/Common/PinVerificationModal';
import PinSetupModal from '../components/Common/PinSetupModal';
import BillReceipt from '../components/Common/BillReceipt';
import {
  FaMobileAlt, FaWifi, FaTv, FaBolt, FaWater,
  FaGraduationCap, FaGamepad, FaGlobe,
  FaUser, FaCheckCircle, FaSearch, FaSpinner,
  FaShieldAlt, FaInfoCircle, FaArrowLeft,
  FaChevronDown, FaChevronRight,
} from 'react-icons/fa';
import { MdSportsSoccer } from 'react-icons/md';

// ─── Category config ──────────────────────────────────────────────────────────
export const BILL_CATEGORIES = {
  airtime: {
    label: 'Airtime',
    icon: FaMobileAlt,
    gradient: ['#6366f1', '#8b5cf6'],
    color: '#8b5cf6',
    description: 'Buy airtime for any Nigerian network',
    recipientLabel: 'Phone Number',
    recipientPlaceholder: '08012345678',
    recipientType: 'tel',
    recipientLength: 11,
    hasPlans: false,
    hasFreeAmount: true,
    quickAmounts: [100, 200, 500, 1000, 2000, 5000],
    verifyRecipient: false,
  },
  data: {
    label: 'Data',
    icon: FaWifi,
    gradient: ['#3b82f6', '#0ea5e9'],
    color: '#3b82f6',
    description: 'Buy internet data bundles',
    recipientLabel: 'Phone Number',
    recipientPlaceholder: '08012345678',
    recipientType: 'tel',
    recipientLength: 11,
    hasPlans: true,
    hasFreeAmount: false,
    quickAmounts: [],
    verifyRecipient: false,
  },
  tv: {
    label: 'Cable TV',
    icon: FaTv,
    gradient: ['#f59e0b', '#d97706'],
    color: '#f59e0b',
    description: 'Pay your TV subscription',
    recipientLabel: 'Smartcard / IUC Number',
    recipientPlaceholder: 'Enter smartcard number',
    recipientType: 'text',
    recipientLength: 10,
    hasPlans: true,
    hasFreeAmount: false,
    quickAmounts: [],
    verifyRecipient: true,
  },
  electricity: {
    label: 'Electricity',
    icon: FaBolt,
    gradient: ['#eab308', '#ca8a04'],
    color: '#eab308',
    description: 'Pay electricity bills & buy prepaid tokens',
    recipientLabel: 'Meter Number',
    recipientPlaceholder: 'Enter meter number',
    recipientType: 'text',
    recipientLength: 11,
    hasPlans: false,
    hasFreeAmount: true,
    quickAmounts: [1000, 2000, 5000, 10000, 20000],
    verifyRecipient: true,
    showToken: true,
  },
  water: {
    label: 'Water',
    icon: FaWater,
    gradient: ['#06b6d4', '#0284c7'],
    color: '#06b6d4',
    description: 'Pay water bills',
    recipientLabel: 'Account / Bill Number',
    recipientPlaceholder: 'Enter account number',
    recipientType: 'text',
    recipientLength: 8,
    hasPlans: false,
    hasFreeAmount: true,
    quickAmounts: [2000, 5000, 10000],
    verifyRecipient: true,
  },
  education: {
    label: 'Education',
    icon: FaGraduationCap,
    gradient: ['#8b5cf6', '#6d28d9'],
    color: '#8b5cf6',
    description: 'Pay exam fees — WAEC, NECO, JAMB & more',
    recipientLabel: 'Registration Number',
    recipientPlaceholder: 'Enter exam registration number',
    recipientType: 'text',
    recipientLength: 10,
    hasPlans: false,
    hasFreeAmount: true,
    quickAmounts: [],
    verifyRecipient: false,
  },
  betting: {
    label: 'Betting',
    icon: MdSportsSoccer,
    gradient: ['#10b981', '#059669'],
    color: '#10b981',
    description: 'Fund your betting account instantly',
    recipientLabel: 'User ID / Username',
    recipientPlaceholder: 'Enter your betting user ID',
    recipientType: 'text',
    recipientLength: 6,
    hasPlans: false,
    hasFreeAmount: true,
    quickAmounts: [500, 1000, 2000, 5000, 10000],
    verifyRecipient: true,
  },
  internet: {
    label: 'Internet',
    icon: FaGlobe,
    gradient: ['#6366f1', '#4f46e5'],
    color: '#6366f1',
    description: 'Pay broadband & ISP subscriptions',
    recipientLabel: 'Account Number / Username',
    recipientPlaceholder: 'Enter account number',
    recipientType: 'text',
    recipientLength: 6,
    hasPlans: false,
    hasFreeAmount: true,
    quickAmounts: [3000, 5000, 10000, 15000],
    verifyRecipient: false,
  },
};

// ─── Step indicator ───────────────────────────────────────────────────────────
const StepDot = ({ step, current }) => (
  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
    step < current ? 'bg-indigo-500' :
    step === current ? 'bg-indigo-600 scale-125' :
    'bg-gray-200 dark:bg-gray-700'
  }`} />
);

// ─── Provider selector card ───────────────────────────────────────────────────
const ProviderCard = ({ provider, selected, onSelect }) => (
  <motion.button
    type="button"
    whileHover={{ y: -2, scale: 1.03 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => onSelect(provider)}
    className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ${
      selected?.code === provider.code
        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md'
        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300'
    }`}
  >
    {selected?.code === provider.code && (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
        <FaCheckCircle className="text-white text-xs" />
      </motion.div>
    )}
    <span className="text-2xl">{provider.logo}</span>
    <span className={`text-xs font-semibold text-center leading-tight ${
      selected?.code === provider.code ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'
    }`}>
      {provider.name}
    </span>
  </motion.button>
);

// ─── Plan card ────────────────────────────────────────────────────────────────
const PlanCard = ({ plan, selected, onSelect }) => (
  <motion.button
    type="button"
    whileHover={{ y: -1, scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    onClick={() => onSelect(plan)}
    className={`relative w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
      selected?.code === plan.code
        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md'
        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300'
    }`}
  >
    {selected?.code === plan.code && (
      <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500" />
    )}
    <div className="flex items-center justify-between pr-6">
      <div>
        <p className={`text-sm font-bold ${selected?.code === plan.code ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>
          {plan.name}
        </p>
        {plan.validity && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{plan.validity}</p>
        )}
      </div>
      <p className={`text-sm font-bold ${selected?.code === plan.code ? 'text-indigo-600' : 'text-gray-700 dark:text-gray-300'}`}>
        {formatCurrency(plan.amount)}
      </p>
    </div>
  </motion.button>
);

// ─── Main BillsPage ───────────────────────────────────────────────────────────
const BillsPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const bills = useBills();

  const config = BILL_CATEGORIES[category];

  // Step: 1=provider, 2=plan/amount, 3=recipient, 4=confirm
  const [step, setStep] = useState(1);

  // Selections
  const [selectedProvider, setSelectedProvider]   = useState(null);
  const [selectedPlan, setSelectedPlan]           = useState(null);
  const [amount, setAmount]                       = useState('');
  const [recipient, setRecipient]                 = useState('');
  const [recipientName, setRecipientName]         = useState('');
  const [recipientVerified, setRecipientVerified] = useState(false);
  const [description, setDescription]             = useState('');

  // Modal state
  const [showPinModal, setShowPinModal]         = useState(false);
  const [showPinSetupModal, setShowPinSetupModal] = useState(false);
  const [showReceipt, setShowReceipt]           = useState(false);
  const [receiptData, setReceiptData]           = useState(null);

  // Redirect unknown categories
  useEffect(() => {
    if (!config) navigate('/dashboard', { replace: true });
  }, [category]);

  // Fetch providers when category changes
  useEffect(() => {
    if (config) {
      bills.fetchProviders(category);
      setStep(1);
      setSelectedProvider(null);
      setSelectedPlan(null);
      setAmount('');
      setRecipient('');
      setRecipientName('');
      setRecipientVerified(false);
    }
  }, [category]);

  // Fetch plans when provider selected
  useEffect(() => {
    if (selectedProvider && config?.hasPlans) {
      bills.fetchPlans(category, selectedProvider.code);
      setSelectedPlan(null);
    }
  }, [selectedProvider]);

  // Reset verification when recipient changes
  useEffect(() => {
    setRecipientVerified(false);
    setRecipientName('');
  }, [recipient]);

  if (!config) return null;

  const Icon = config.icon;
  const [c1, c2] = config.gradient;
  const effectiveAmount = selectedPlan ? selectedPlan.amount : Number(amount);
  const totalSteps = 4;

  // ── Step navigation ────────────────────────────────────────────────────────
  const canGoNext = () => {
    if (step === 1) return !!selectedProvider;
    if (step === 2) {
      if (config.hasPlans) return !!selectedPlan;
      return effectiveAmount > 0;
    }
    if (step === 3) {
      if (recipient.length < (config.recipientLength || 6)) return false;
      if (config.verifyRecipient) return recipientVerified;
      return true;
    }
    return true;
  };

  const next = () => { if (canGoNext() && step < totalSteps) setStep(s => s + 1); };
  const back = () => {
    if (step > 1) setStep(s => s - 1);
    else navigate(-1);
  };

  // ── Verify recipient ──────────────────────────────────────────────────────
  const handleVerify = async () => {
    if (!recipient || recipient.length < (config.recipientLength || 6)) {
      toast.error(`Please enter a valid ${config.recipientLabel.toLowerCase()}`);
      return;
    }
    try {
      const res = await bills.verifyRecipient({
        category,
        provider: selectedProvider?.code,
        recipient,
      });
      if (res.success) {
        setRecipientName(res.data.recipientName || '');
        setRecipientVerified(true);
        toast.success('✅ Recipient verified!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  // ── Submit → PIN modal ────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (effectiveAmount > (user?.balance || 0)) {
      toast.error('Insufficient balance');
      return;
    }
    setShowPinModal(true);
  };

  // ── PIN verified → pay ────────────────────────────────────────────────────
  const handlePinVerified = async (pin) => {
    setShowPinModal(false);
    try {
      const res = await bills.payBill({
        category,
        provider:      selectedProvider.code,
        plan:          selectedPlan?.code || null,
        recipient,
        recipientName: recipientName || null,
        amount:        effectiveAmount,
        pin,
        description:   description || null,
      });

      if (res.success) {
        if (res.data?.newBalance !== undefined) {
          updateUser({ ...user, balance: res.data.newBalance });
        }
        setReceiptData({
          ...res.data,
          category,
          providerName: selectedProvider?.name,
          planName:     selectedPlan?.name || null,
        });
        setShowReceipt(true);
      }
    } catch (err) {
      if (err.response?.data?.needsPinSetup) {
        setShowPinSetupModal(true);
        toast.error('Please set your transaction PIN first');
      } else if (err.response?.status === 401) {
        toast.error('Invalid transaction PIN');
      } else {
        toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
      }
    }
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    navigate('/dashboard', { replace: true });
  };

  // ── Render steps ───────────────────────────────────────────────────────────
  return (
    <>
      <div className="max-w-lg mx-auto pb-8">

        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={back}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FaArrowLeft className="text-sm" />
          </motion.button>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 40, height: 40, borderRadius: 14,
                background: `linear-gradient(145deg, ${c1}, ${c2})`,
                boxShadow: `0 4px 14px ${c1}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon style={{ color: '#fff', fontSize: 17 }} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white" style={{ letterSpacing: '-0.02em' }}>
                {config.label}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{config.description}</p>
            </div>
          </div>
        </div>

        {/* ── Step dots ── */}
        <div className="flex items-center gap-2 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <React.Fragment key={i}>
              <StepDot step={i + 1} current={step} />
              {i < totalSteps - 1 && (
                <div className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${i + 1 < step ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </React.Fragment>
          ))}
          <span className="ml-2 text-xs font-semibold text-gray-400">Step {step}/{totalSteps}</span>
        </div>

        {/* ── Card ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <AnimatePresence mode="wait">

            {/* ══ STEP 1: Choose Provider ══ */}
            {step === 1 && (
              <motion.div key="step1"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }} className="p-6 space-y-5">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1" style={{ letterSpacing: '-0.02em' }}>
                    Choose Provider
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Select your service provider</p>
                </div>

                {bills.loadingProviders ? (
                  <div className="flex justify-center py-8">
                    <FaSpinner className="animate-spin text-indigo-500 text-2xl" />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {bills.providers.map(p => (
                      <ProviderCard key={p.code} provider={p} selected={selectedProvider} onSelect={setSelectedProvider} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ STEP 2: Plan / Amount ══ */}
            {step === 2 && (
              <motion.div key="step2"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }} className="p-6 space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{selectedProvider?.logo}</span>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white" style={{ letterSpacing: '-0.02em' }}>
                      {selectedProvider?.name}
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {config.hasPlans ? 'Select a plan' : 'Enter amount'}
                  </p>
                </div>

                {/* Plans list */}
                {config.hasPlans && (
                  <>
                    {bills.loadingPlans ? (
                      <div className="flex justify-center py-8"><FaSpinner className="animate-spin text-indigo-500 text-2xl" /></div>
                    ) : bills.plans.length > 0 ? (
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                        {bills.plans.map(plan => (
                          <PlanCard key={plan.code} plan={plan} selected={selectedPlan} onSelect={setSelectedPlan} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">No plans available for {selectedProvider?.name}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Free amount */}
                {config.hasFreeAmount && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                        Amount (₦)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
                        <input
                          type="number" value={amount}
                          onChange={e => setAmount(e.target.value)}
                          min="1" max={user?.balance || 0} step="1"
                          placeholder="Enter amount"
                          className="w-full pl-8 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-lg font-semibold"
                        />
                      </div>
                      {amount && Number(amount) > 0 && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          = <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(amount)}</span>
                        </p>
                      )}
                    </div>

                    {/* Quick amounts */}
                    {config.quickAmounts.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {config.quickAmounts.map(q => (
                          <motion.button
                            key={q} type="button" whileTap={{ scale: 0.95 }}
                            onClick={() => setAmount(q.toString())}
                            className={`py-2 border rounded-xl text-xs font-semibold transition-all ${
                              amount === q.toString()
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 bg-white dark:bg-gray-700'
                            }`}
                          >
                            ₦{q.toLocaleString()}
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Balance info */}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Available balance: <span className="font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(user?.balance || 0)}</span>
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ STEP 3: Recipient ══ */}
            {step === 3 && (
              <motion.div key="step3"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }} className="p-6 space-y-5">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1" style={{ letterSpacing: '-0.02em' }}>
                    {config.recipientLabel}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enter the {config.recipientLabel.toLowerCase()} for this payment
                  </p>
                </div>

                {/* Recipient input */}
                <div>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={config.recipientType || 'text'}
                      value={recipient}
                      onChange={e => setRecipient(
                        config.recipientType === 'tel'
                          ? e.target.value.replace(/\D/g, '').slice(0, config.recipientLength || 11)
                          : e.target.value.slice(0, 20)
                      )}
                      disabled={recipientVerified}
                      placeholder={config.recipientPlaceholder}
                      maxLength={config.recipientLength || 20}
                      className={`w-full pl-10 pr-28 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-colors ${
                        recipientVerified
                          ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed border-green-400'
                          : 'border-gray-300 dark:border-gray-600 bg-white'
                      }`}
                    />
                    {config.verifyRecipient && !recipientVerified && (
                      <button type="button" onClick={handleVerify}
                        disabled={bills.verifying || recipient.length < (config.recipientLength || 6)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1">
                        {bills.verifying ? <FaSpinner className="animate-spin text-xs" /> : <><FaSearch className="text-xs" /> Verify</>}
                      </button>
                    )}
                    {recipientVerified && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        <FaCheckCircle className="text-green-500 text-lg" />
                        <button type="button" onClick={() => { setRecipientVerified(false); setRecipientName(''); }}
                          className="text-xs text-gray-400 hover:text-red-500 underline transition-colors">
                          Change
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Verified name badge */}
                  {recipientVerified && recipientName && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                      <FaCheckCircle className="text-green-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-green-700 dark:text-green-300 font-semibold uppercase tracking-wide">Verified</p>
                        <p className="text-sm font-bold text-green-800 dark:text-green-200">{recipientName}</p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Optional description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Note <span className="font-normal normal-case text-gray-400">(optional)</span>
                  </label>
                  <input type="text" value={description}
                    onChange={e => setDescription(e.target.value)} maxLength={100}
                    placeholder="Add a note…"
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-sm" />
                </div>

                {/* Info note */}
                <div className="flex items-start gap-2 px-1">
                  <FaInfoCircle className="text-indigo-400 text-sm flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {category === 'electricity'
                      ? 'A recharge token will be sent to you after payment.'
                      : category === 'data' || category === 'airtime'
                      ? 'Top-up will be applied instantly to the phone number.'
                      : category === 'tv'
                      ? 'Subscription will be renewed immediately after payment.'
                      : 'Payment will be processed instantly.'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* ══ STEP 4: Review & Pay ══ */}
            {step === 4 && (
              <motion.div key="step4"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }} className="p-6 space-y-5">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1" style={{ letterSpacing: '-0.02em' }}>
                    Review Payment
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Confirm the details below before paying</p>
                </div>

                {/* Summary card */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-600 overflow-hidden">
                  {/* Amount header */}
                  <div
                    className="p-5 text-center relative"
                    style={{ background: `linear-gradient(145deg, ${c1}18, ${c2}12)` }}
                  >
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white" style={{ letterSpacing: '-0.03em' }}>
                      {formatCurrency(effectiveAmount)}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                      style={{ background: `${c1}20`, border: `1px solid ${c1}30` }}>
                      <Icon style={{ color: c1, fontSize: 11 }} />
                      <span className="text-xs font-semibold" style={{ color: c1 }}>{config.label} Payment</span>
                    </div>
                  </div>

                  {/* Details rows */}
                  <div className="divide-y divide-gray-200 dark:divide-gray-600">
                    {[
                      { label: 'Provider', value: selectedProvider?.name },
                      selectedPlan && { label: 'Plan', value: selectedPlan.name },
                      { label: config.recipientLabel, value: recipient },
                      recipientName && { label: 'Name', value: recipientName },
                      description && { label: 'Note', value: description },
                      { label: 'Amount', value: formatCurrency(effectiveAmount) },
                      { label: 'Fee', value: '₦0.00 (Free)' },
                      { label: 'Total Deducted', value: formatCurrency(effectiveAmount), bold: true },
                    ].filter(Boolean).map((row, i) => (
                      <div key={i} className="flex justify-between items-center px-5 py-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{row.label}</span>
                        <span className={`text-sm text-gray-900 dark:text-white max-w-[60%] text-right truncate ${row.bold ? 'font-bold' : 'font-medium'}`}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-5 py-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Balance After</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatCurrency((user?.balance || 0) - effectiveAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security note */}
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-green-500 text-sm flex-shrink-0" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your payment is secured & processed instantly via Vaultix.
                  </p>
                </div>

                {/* Pay button */}
                <motion.button
                  type="button"
                  whileHover={{ opacity: 0.92 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={bills.paying}
                  className="w-full py-4 text-white font-bold text-base rounded-2xl shadow-lg transition-all disabled:opacity-60"
                  style={{
                    background: `linear-gradient(135deg, ${c1}, ${c2})`,
                    boxShadow: `0 8px 24px ${c1}45`,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {bills.paying ? (
                    <span className="flex items-center justify-center gap-2">
                      <FaSpinner className="animate-spin" /> Processing…
                    </span>
                  ) : (
                    `Pay ${formatCurrency(effectiveAmount)}`
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Next / Back navigation bar (steps 1–3) ── */}
          {step < 4 && (
            <div className="px-6 pb-5 flex gap-3">
              {step > 1 && (
                <motion.button whileTap={{ scale: 0.96 }} onClick={back}
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Back
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={next}
                disabled={!canGoNext()}
                className="flex-1 py-3 text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: canGoNext() ? `linear-gradient(135deg, ${c1}, ${c2})` : '#94a3b8',
                  boxShadow: canGoNext() ? `0 4px 16px ${c1}40` : 'none',
                }}
              >
                {step === 3 ? 'Review' : 'Continue'} <FaChevronRight className="text-xs" />
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <PinVerificationModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onVerify={handlePinVerified}
        title={`Confirm ${config.label} Payment`}
      />
      <PinSetupModal
        isOpen={showPinSetupModal}
        onClose={() => setShowPinSetupModal(false)}
        onSuccess={() => toast.success('PIN set! You can now make payments.')}
      />
      {showReceipt && receiptData && (
        <BillReceipt
          bill={receiptData}
          category={config}
          onClose={handleReceiptClose}
        />
      )}
    </>
  );
};

export default BillsPage;