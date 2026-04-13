import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import {
  FaPaperPlane,
  FaDownload,
  FaUpload,
  FaUser,
  FaUniversity,
  FaCheckCircle,
  FaSpinner,
  FaSearch,
  FaExchangeAlt,
  FaCreditCard,
  FaMobileAlt,
  FaGlobe,
  FaInfoCircle,
  FaLock,
  FaCalendarAlt,
  FaShieldAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PinVerificationModal from '../components/Common/PinVerificationModal';
import PinSetupModal from '../components/Common/PinSetupModal';

const Transfer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(location.state?.action || 'transfer');
  const [loading, setLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPinSetupModal, setShowPinSetupModal] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [hasPin, setHasPin] = useState(false);
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [recipientVerified, setRecipientVerified] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [isInternalTransfer, setIsInternalTransfer] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [cardFlipped, setCardFlipped] = useState(false);

  const [formData, setFormData] = useState({
    recipientAccount: '',
    recipientBank: '',
    recipientCustomBank: '',
    amount: '',
    description: '',
  });

  // Card payment form state
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  // Bank transfer form state
  const [bankData, setBankData] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    routingNumber: '',
  });

  // USSD form state
  const [ussdData, setUssdData] = useState({
    phone: '',
    network: '',
  });

  const tabs = [
    { id: 'transfer', label: 'Send Money', icon: FaPaperPlane, color: 'from-indigo-600 to-blue-600' },
    { id: 'deposit', label: 'Deposit', icon: FaDownload, color: 'from-green-600 to-emerald-600' },
    { id: 'withdraw', label: 'Withdraw', icon: FaUpload, color: 'from-orange-600 to-red-600' },
  ];

  const nigerianBanks = [
    { code: 'VAULTIX', name: '🚀 Vaultix (Internal - Free & Instant)' },
    { code: '044', name: 'Access Bank' },
    { code: '023', name: 'Citibank Nigeria' },
    { code: '050', name: 'Ecobank Nigeria' },
    { code: '070', name: 'Fidelity Bank' },
    { code: '011', name: 'First Bank of Nigeria' },
    { code: '058', name: 'Guaranty Trust Bank (GTBank)' },
    { code: '030', name: 'Heritage Bank' },
    { code: '301', name: 'Jaiz Bank' },
    { code: '082', name: 'Keystone Bank' },
    { code: '076', name: 'Polaris Bank' },
    { code: '039', name: 'Stanbic IBTC Bank' },
    { code: '232', name: 'Sterling Bank' },
    { code: '032', name: 'Union Bank of Nigeria' },
    { code: '033', name: 'United Bank for Africa (UBA)' },
    { code: '035', name: 'Wema Bank' },
    { code: '057', name: 'Zenith Bank' },
    { code: '101', name: 'Providus Bank' },
    { code: '215', name: 'Unity Bank' },
    { code: 'OPAY', name: 'OPay' },
    { code: 'PALMPAY', name: 'PalmPay' },
    { code: 'KUDABANK', name: 'Kuda Bank' },
    { code: 'OTHER', name: 'Other / My bank not listed' },
  ];

  const nigerianNetworks = [
    { code: 'MTN', name: 'MTN Nigeria' },
    { code: 'AIRTEL', name: 'Airtel Nigeria' },
    { code: 'GLO', name: 'Glo' },
    { code: '9MOBILE', name: '9Mobile' },
  ];

  const paymentMethods = [
    { id: 'card', name: 'Debit / Credit Card', icon: FaCreditCard, color: 'from-purple-500 to-pink-500', description: 'Visa, Mastercard, Verve' },
    { id: 'bank', name: 'Bank Transfer', icon: FaUniversity, color: 'from-blue-500 to-cyan-500', description: 'Direct from your bank' },
    { id: 'ussd', name: 'USSD', icon: FaMobileAlt, color: 'from-green-500 to-emerald-500', description: 'Works without internet' },
  ];

  const quickAmounts = {
    transfer: [1000, 5000, 10000, 50000],
    deposit: [5000, 10000, 25000, 50000],
    withdraw: [5000, 10000, 25000, 50000]
  };

  useEffect(() => {
    checkPinStatus();
  }, []);

  useEffect(() => {
    if (recipientVerified) {
      setRecipientVerified(false);
      setRecipientName('');
      setIsInternalTransfer(false);
    }
  }, [formData.recipientAccount, formData.recipientBank]);

  const checkPinStatus = async () => {
    try {
      const response = await api.get('/user/has-pin');
      setHasPin(response.data.hasPin);
    } catch (error) {
      console.error('Error checking PIN status:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;

    if (name === 'cardNumber') {
      formatted = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    }
    if (name === 'cvv') {
      formatted = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardData({ ...cardData, [name]: formatted });
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankData({ ...bankData, [name]: value });
  };

  const handleUssdChange = (e) => {
    const { name, value } = e.target;
    setUssdData({ ...ussdData, [name]: value });
  };

  const formatCardDisplay = (number) => {
    const raw = number.replace(/\s/g, '');
    const padded = raw.padEnd(16, '•');
    return `${padded.slice(0, 4)} ${padded.slice(4, 8)} ${padded.slice(8, 12)} ${padded.slice(12, 16)}`;
  };

  const getCardBrand = (number) => {
    const raw = number.replace(/\s/g, '');
    if (raw.startsWith('4')) return 'VISA';
    if (raw.startsWith('5') || raw.startsWith('2')) return 'MASTERCARD';
    if (raw.startsWith('5061') || raw.startsWith('6500')) return 'VERVE';
    return null;
  };

  const handleVerifyAccount = async () => {
    if (!formData.recipientBank) { toast.error('Please select recipient bank'); return; }
    if (formData.recipientBank === 'OTHER' && !formData.recipientCustomBank) { toast.error('Please enter bank name'); return; }
    if (!formData.recipientAccount) { toast.error('Please enter recipient account number'); return; }
    if (formData.recipientAccount.length !== 10 || !/^\d+$/.test(formData.recipientAccount)) { toast.error('Account number must be 10 digits'); return; }
    if (formData.recipientBank === 'VAULTIX' && formData.recipientAccount === user?.accountNumber) { toast.error('Cannot transfer to your own account'); return; }

    setVerifyingAccount(true);
    try {
      const response = await api.post('/transactions/verify-account', {
        accountNumber: formData.recipientAccount,
        bankCode: formData.recipientBank,
        bankName: formData.recipientBank === 'OTHER' ? formData.recipientCustomBank : undefined
      });
      if (response.data.success) {
        const data = response.data.data;
        setRecipientName(data.accountName);
        setRecipientVerified(true);
        setIsInternalTransfer(data.isInternal || false);
        toast.success(data.isInternal ? '✅ Vaultix account verified!' : '✅ Account verified!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify account');
      setRecipientVerified(false);
      setRecipientName('');
      setIsInternalTransfer(false);
    } finally {
      setVerifyingAccount(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) { toast.error('Please enter a valid amount'); return; }
    if ((activeTab === 'transfer' || activeTab === 'withdraw') && Number(formData.amount) > (user?.balance || 0)) { toast.error('Insufficient balance'); return; }
    if (activeTab === 'transfer' && !recipientVerified) { toast.error('Please verify recipient account first'); return; }

    if (activeTab === 'deposit') {
      if (selectedPaymentMethod === 'card') {
        const raw = cardData.cardNumber.replace(/\s/g, '');
        if (raw.length < 16) { toast.error('Please enter a valid 16-digit card number'); return; }
        if (!cardData.cardHolder.trim()) { toast.error('Please enter cardholder name'); return; }
        if (!cardData.expiryMonth || !cardData.expiryYear) { toast.error('Please enter card expiry'); return; }
        if (!cardData.cvv || cardData.cvv.length < 3) { toast.error('Please enter a valid CVV'); return; }
      }
      if (selectedPaymentMethod === 'bank') {
        if (!bankData.accountName.trim()) { toast.error('Please enter account name'); return; }
        if (!bankData.accountNumber || bankData.accountNumber.length < 10) { toast.error('Please enter a valid account number'); return; }
        if (!bankData.bankName) { toast.error('Please select your bank'); return; }
      }
      if (selectedPaymentMethod === 'ussd') {
        if (!ussdData.phone || ussdData.phone.length < 11) { toast.error('Please enter a valid phone number'); return; }
        if (!ussdData.network) { toast.error('Please select your network'); return; }
      }
    }

    setPendingTransaction({
      type: activeTab,
      data: {
        ...formData,
        recipientName,
        isInternal: isInternalTransfer,
        paymentMethod: selectedPaymentMethod,
        cardData: selectedPaymentMethod === 'card' ? cardData : undefined,
        bankData: selectedPaymentMethod === 'bank' ? bankData : undefined,
        ussdData: selectedPaymentMethod === 'ussd' ? ussdData : undefined,
      },
    });
    setShowPinModal(true);
  };

  const handlePinVerified = async (pin) => {
    if (!pendingTransaction) return;
    setLoading(true);
    setShowPinModal(false);

    try {
      let endpoint;
      let successMessage;
      let requestData = { amount: Number(pendingTransaction.data.amount), pin };
      if (pendingTransaction.data.description) requestData.description = pendingTransaction.data.description;

      switch (pendingTransaction.type) {
        case 'transfer':
          endpoint = '/transactions/transfer';
          requestData.recipientAccount = pendingTransaction.data.recipientAccount;
          requestData.recipientBank = pendingTransaction.data.recipientBank;
          requestData.recipientName = pendingTransaction.data.recipientName;
          if (pendingTransaction.data.recipientCustomBank) requestData.recipientCustomBank = pendingTransaction.data.recipientCustomBank;
          successMessage = `✅ Transfer to ${pendingTransaction.data.recipientName} completed!`;
          break;
        case 'deposit':
          endpoint = '/transactions/deposit';
          requestData.paymentMethod = pendingTransaction.data.paymentMethod;
          successMessage = `✅ Deposit of ${formatCurrency(pendingTransaction.data.amount)} completed! (Demo Mode)`;
          break;
        case 'withdraw':
          endpoint = '/transactions/withdraw';
          successMessage = `✅ Withdrawal of ${formatCurrency(pendingTransaction.data.amount)} completed!`;
          break;
        default:
          throw new Error('Invalid transaction type');
      }

      const response = await api.post(endpoint, requestData);
      if (response.data.success) {
        toast.success(response.data.message || successMessage);
        if (response.data.data?.newBalance !== undefined) updateUser({ ...user, balance: response.data.data.newBalance });

        setFormData({ recipientAccount: '', recipientBank: '', recipientCustomBank: '', amount: '', description: '' });
        setCardData({ cardNumber: '', cardHolder: '', expiryMonth: '', expiryYear: '', cvv: '' });
        setBankData({ accountName: '', accountNumber: '', bankName: '', routingNumber: '' });
        setUssdData({ phone: '', network: '' });
        setRecipientVerified(false);
        setRecipientName('');
        setIsInternalTransfer(false);
        setSelectedPaymentMethod('card');
        setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
      }
    } catch (error) {
      if (error.response?.data?.needsPinSetup) {
        setShowPinSetupModal(true);
        toast.error('Please set your transaction PIN first');
      } else if (error.response?.status === 401) {
        toast.error('Invalid transaction PIN');
      } else {
        toast.error(error.response?.data?.message || 'Transaction failed');
      }
    } finally {
      setLoading(false);
      setPendingTransaction(null);
    }
  };

  const handlePinSetupSuccess = () => {
    setHasPin(true);
    toast.success('PIN set successfully! You can now make transactions.');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setFormData({ recipientAccount: '', recipientBank: '', recipientCustomBank: '', amount: '', description: '' });
    setRecipientVerified(false);
    setRecipientName('');
    setIsInternalTransfer(false);
  };

  const getMaxAmount = () => {
    if (activeTab === 'transfer' || activeTab === 'withdraw') return user?.balance || 0;
    return 1000000;
  };

  const getSelectedBankName = () => {
    if (formData.recipientBank === 'OTHER') return formData.recipientCustomBank;
    return nigerianBanks.find(b => b.code === formData.recipientBank)?.name || '';
  };

  const currentTab = tabs.find(t => t.id === activeTab);
  const cardBrand = getCardBrand(cardData.cardNumber);

  // Months and years for expiry
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, i) => String(currentYear + i));

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === tab.id
                      ? `border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-gradient-to-r ${tab.color} bg-clip-text text-transparent`
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  <tab.icon className="inline-block mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ── DEPOSIT SECTION ── */}
              {activeTab === 'deposit' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Choose Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={`p-3 border-2 rounded-xl text-left transition-all duration-200 ${selectedPaymentMethod === method.id
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                            }`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 bg-gradient-to-br ${method.color}`}>
                            <method.icon className="text-white text-base" />
                          </div>
                          <p className={`text-xs font-semibold ${selectedPaymentMethod === method.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                            {method.name}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{method.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── CARD FORM ── */}
                  <AnimatePresence mode="wait">
                    {selectedPaymentMethod === 'card' && (
                      <motion.div
                        key="card-form"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        {/* Card Preview */}
                        <div
                          className="relative h-44 rounded-2xl overflow-hidden cursor-pointer select-none"
                          style={{ perspective: '1000px' }}
                          onClick={() => setCardFlipped(!cardFlipped)}
                        >
                          <motion.div
                            className="w-full h-full relative"
                            style={{ transformStyle: 'preserve-3d' }}
                            animate={{ rotateY: cardFlipped ? 180 : 0 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                          >
                            {/* Front */}
                            <div
                              className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between"
                              style={{
                                backfaceVisibility: 'hidden',
                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
                              }}
                            >
                              {/* Top row */}
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-purple-200 text-[10px] font-medium uppercase tracking-wider">Vaultix</p>
                                  <p className="text-white text-xs font-light opacity-60 mt-0.5">Deposit Card</p>
                                </div>
                                {cardBrand && (
                                  <div className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-md">
                                    <p className="text-white text-xs font-bold tracking-widest">{cardBrand}</p>
                                  </div>
                                )}
                              </div>

                              {/* Chip */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-7 rounded bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-90 flex items-center justify-center">
                                  <div className="w-7 h-4 border border-yellow-600/50 rounded-sm grid grid-cols-3 gap-px p-0.5">
                                    {[...Array(9)].map((_, i) => (
                                      <div key={i} className="bg-yellow-600/40 rounded-[1px]" />
                                    ))}
                                  </div>
                                </div>
                                <div className="w-6 h-6 rounded-full border-2 border-white/30 flex items-center justify-center">
                                  <div className="w-3 h-3 rounded-full border border-white/30" />
                                </div>
                              </div>

                              {/* Card Number */}
                              <div>
                                <p className="text-white font-mono text-lg tracking-widest">
                                  {formatCardDisplay(cardData.cardNumber)}
                                </p>
                                <div className="flex justify-between items-end mt-3">
                                  <div>
                                    <p className="text-purple-300 text-[9px] uppercase tracking-wider">Card Holder</p>
                                    <p className="text-white text-sm font-medium mt-0.5 uppercase tracking-wide">
                                      {cardData.cardHolder || 'YOUR NAME'}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-purple-300 text-[9px] uppercase tracking-wider">Expires</p>
                                    <p className="text-white text-sm font-medium mt-0.5">
                                      {cardData.expiryMonth || 'MM'}/{cardData.expiryYear?.slice(-2) || 'YY'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Back */}
                            <div
                              className="absolute inset-0 rounded-2xl flex flex-col justify-between"
                              style={{
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                              }}
                            >
                              <div className="h-10 bg-gray-900/70 mt-6" />
                              <div className="px-5 pb-5 space-y-3">
                                <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
                                  <div className="flex-1 h-7 bg-white/80 rounded-md flex items-center px-3">
                                    <span className="font-mono text-gray-800 font-bold tracking-[0.3em] text-sm">
                                      {cardData.cvv ? '•'.repeat(cardData.cvv.length) : '•••'}
                                    </span>
                                  </div>
                                  <p className="text-purple-300 text-[10px] ml-3 text-right">
                                    CVV
                                  </p>
                                </div>
                                <p className="text-purple-400 text-[9px] text-center">Click to flip back</p>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                        <p className="text-center text-xs text-gray-400">Click card to see CVV side</p>

                        {/* Card Fields */}
                        <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-600">
                          {/* Card Number */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                              Card Number
                            </label>
                            <div className="relative">
                              <FaCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                              <input
                                type="text"
                                name="cardNumber"
                                value={cardData.cardNumber}
                                onChange={handleCardChange}
                                placeholder="0000 0000 0000 0000"
                                maxLength="19"
                                className="w-full pl-9 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white font-mono text-sm bg-white"
                              />
                            </div>
                          </div>

                          {/* Cardholder Name */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                              Cardholder Name
                            </label>
                            <div className="relative">
                              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                              <input
                                type="text"
                                name="cardHolder"
                                value={cardData.cardHolder}
                                onChange={handleCardChange}
                                placeholder="Name on card"
                                className="w-full pl-9 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-sm"
                              />
                            </div>
                          </div>

                          {/* Expiry + CVV */}
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                Month
                              </label>
                              <select
                                name="expiryMonth"
                                value={cardData.expiryMonth}
                                onChange={handleCardChange}
                                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-sm"
                              >
                                <option value="">MM</option>
                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                Year
                              </label>
                              <select
                                name="expiryYear"
                                value={cardData.expiryYear}
                                onChange={handleCardChange}
                                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-sm"
                              >
                                <option value="">YY</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                CVV
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  name="cvv"
                                  value={cardData.cvv}
                                  onChange={handleCardChange}
                                  onFocus={() => setCardFlipped(true)}
                                  onBlur={() => setCardFlipped(false)}
                                  placeholder="•••"
                                  maxLength="4"
                                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-sm font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Security Note */}
                        <div className="flex items-center gap-2 px-1">
                          <FaShieldAlt className="text-green-500 text-sm flex-shrink-0" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Your card details are encrypted and secured with 256-bit SSL. We never store your CVV.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* ── BANK TRANSFER FORM ── */}
                    {selectedPaymentMethod === 'bank' && (
                      <motion.div
                        key="bank-form"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        {/* Bank Transfer Instructions Banner */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0">
                              <FaUniversity className="text-blue-600 dark:text-blue-300 text-sm" />
                            </div>
                            <div>
                              <p className="text-blue-800 dark:text-blue-200 text-sm font-semibold">Bank Transfer Details</p>
                              <p className="text-blue-600 dark:text-blue-300 text-xs mt-0.5 leading-relaxed">
                                Enter your source bank account details. Funds will be pulled from this account and credited to your Vaultix wallet.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-600">
                          {/* Account Name */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                              Account Name
                            </label>
                            <div className="relative">
                              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                              <input
                                type="text"
                                name="accountName"
                                value={bankData.accountName}
                                onChange={handleBankChange}
                                placeholder="Full name on bank account"
                                className="w-full pl-9 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-sm"
                              />
                            </div>
                          </div>

                          {/* Bank Name */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                              Source Bank
                            </label>
                            <div className="relative">
                              <FaUniversity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                              <select
                                name="bankName"
                                value={bankData.bankName}
                                onChange={handleBankChange}
                                className="w-full pl-9 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-sm appearance-none"
                              >
                                <option value="">Select your bank</option>
                                {nigerianBanks.filter(b => b.code !== 'VAULTIX').map((bank) => (
                                  <option key={bank.code} value={bank.code}>{bank.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Account Number */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                              Account Number
                            </label>
                            <input
                              type="text"
                              name="accountNumber"
                              value={bankData.accountNumber}
                              onChange={handleBankChange}
                              placeholder="10-digit account number"
                              maxLength="10"
                              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-sm font-mono"
                            />
                          </div>

                          {/* Reference (optional) */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                              Transfer Reference <span className="font-normal normal-case text-gray-400">(optional)</span>
                            </label>
                            <input
                              type="text"
                              name="routingNumber"
                              value={bankData.routingNumber}
                              onChange={handleBankChange}
                              placeholder="e.g. DEP/2024/001"
                              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-sm"
                            />
                          </div>
                        </div>

                        {/* Processing time notice */}
                        <div className="flex items-center gap-2 px-1">
                          <FaInfoCircle className="text-blue-400 text-sm flex-shrink-0" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Bank transfers typically process within 2–5 minutes during business hours.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* ── USSD FORM ── */}
                    {selectedPaymentMethod === 'ussd' && (
                      <motion.div
                        key="ussd-form"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-800 flex items-center justify-center flex-shrink-0">
                              <FaMobileAlt className="text-green-600 dark:text-green-300 text-sm" />
                            </div>
                            <div>
                              <p className="text-green-800 dark:text-green-200 text-sm font-semibold">USSD Payment</p>
                              <p className="text-green-600 dark:text-green-300 text-xs mt-0.5 leading-relaxed">
                                After submitting, you'll receive a USSD prompt on your phone to authorize the payment. Works without internet.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-600">
                          {/* Network */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                              Mobile Network
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                              {nigerianNetworks.map((net) => (
                                <button
                                  key={net.code}
                                  type="button"
                                  onClick={() => setUssdData({ ...ussdData, network: net.code })}
                                  className={`py-2.5 px-1 rounded-xl border-2 text-center transition-all text-xs font-semibold ${ussdData.network === net.code
                                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                  {net.code}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Phone Number */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                              Phone Number
                            </label>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <FaMobileAlt className="text-gray-400 text-sm" />
                                <span className="text-gray-400 text-sm ml-1">+234</span>
                              </div>
                              <input
                                type="tel"
                                name="phone"
                                value={ussdData.phone}
                                onChange={handleUssdChange}
                                placeholder="08012345678"
                                maxLength="11"
                                className="w-full pl-20 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-sm font-mono"
                              />
                            </div>
                          </div>

                          {/* USSD Code Preview */}
                          {ussdData.network && formData.amount && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="bg-gray-900 rounded-xl p-4 text-center"
                            >
                              <p className="text-gray-400 text-xs mb-1">Dial this code to pay</p>
                              <p className="text-green-400 font-mono text-xl font-bold tracking-wider">
                                {ussdData.network === 'MTN' ? `*737*${formData.amount}#` :
                                  ussdData.network === 'AIRTEL' ? `*901*${formData.amount}#` :
                                    ussdData.network === 'GLO' ? `*805*${formData.amount}#` :
                                      `*322*${formData.amount}#`}
                              </p>
                              <p className="text-gray-500 text-[10px] mt-1">Amount: {formatCurrency(formData.amount)}</p>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Demo Notice */}
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <p className="text-yellow-800 dark:text-yellow-200 text-xs flex items-center gap-2">
                      <FaInfoCircle className="flex-shrink-0" />
                      <span><strong>Demo Mode:</strong> This is a simulated deposit. No real money or card details are processed.</span>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── TRANSFER SECTION ── (unchanged) */}
              {activeTab === 'transfer' && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recipient Bank</label>
                      <div className="relative">
                        <FaUniversity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                          name="recipientBank"
                          required
                          value={formData.recipientBank}
                          onChange={handleChange}
                          disabled={recipientVerified}
                          className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${recipientVerified ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600'}`}
                        >
                          <option value="">Select recipient bank</option>
                          {nigerianBanks.map((bank) => (
                            <option key={bank.code} value={bank.code}>{bank.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {formData.recipientBank === 'OTHER' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enter Bank Name</label>
                        <input
                          type="text"
                          name="recipientCustomBank"
                          required
                          value={formData.recipientCustomBank}
                          onChange={handleChange}
                          disabled={recipientVerified}
                          className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${recipientVerified ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600'}`}
                          placeholder="Enter your bank name"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recipient Account Number</label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="recipientAccount"
                          required
                          value={formData.recipientAccount}
                          onChange={handleChange}
                          disabled={recipientVerified}
                          className={`w-full pl-10 pr-24 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${recipientVerified ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed border-green-500' : 'border-gray-300 dark:border-gray-600'}`}
                          placeholder="Enter 10-digit account number"
                          maxLength="10"
                        />
                        {!recipientVerified && (
                          <button
                            type="button"
                            onClick={handleVerifyAccount}
                            disabled={verifyingAccount || !formData.recipientAccount || !formData.recipientBank}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
                          >
                            {verifyingAccount ? <FaSpinner className="animate-spin" /> : <><FaSearch className="inline mr-1" />Verify</>}
                          </button>
                        )}
                        {recipientVerified && <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xl" />}
                      </div>
                    </div>

                    {recipientVerified && recipientName && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border ${isInternalTransfer ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isInternalTransfer ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {isInternalTransfer ? <FaUser /> : <FaExchangeAlt />}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">
                              {isInternalTransfer ? 'Vaultix Account Holder' : 'External Account'}
                              {!isInternalTransfer && <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] rounded-full">External Transfer</span>}
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{recipientName}</p>
                            <p className="text-xs text-gray-500">Account: {formData.recipientAccount} • Bank: {getSelectedBankName()}</p>
                          </div>
                        </div>
                        {!isInternalTransfer && <p className="mt-3 text-xs text-gray-500 border-t pt-3">⚡ External transfers may take up to 5 minutes to process.</p>}
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Amount Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount (₦)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                  <input
                    type="number"
                    name="amount"
                    required
                    min="1"
                    max={getMaxAmount()}
                    step="1"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                {formData.amount && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Amount: <span className="font-semibold">{formatCurrency(formData.amount)}</span>
                  </p>
                )}
                {(activeTab === 'transfer' || activeTab === 'withdraw') && (
                  <p className="mt-1 text-xs text-gray-500">
                    Available Balance: <span className="font-semibold">{formatCurrency(user?.balance || 0)}</span>
                  </p>
                )}
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts[activeTab]?.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => setFormData({ ...formData, amount: quickAmount.toString() })}
                    className="py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    ₦{quickAmount.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Add a note..."
                  maxLength="200"
                />
                <p className="mt-1 text-xs text-gray-500">{formData.description.length}/200 characters</p>
              </div>

              {/* Info Box */}
              <div className={`p-4 rounded-xl border ${activeTab === 'deposit' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' :
                  activeTab === 'withdraw' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200' :
                    'bg-purple-50 dark:bg-purple-900/20 border-purple-200'
                }`}>
                <p className={`text-sm ${activeTab === 'deposit' ? 'text-blue-800 dark:text-blue-200' :
                    activeTab === 'withdraw' ? 'text-orange-800 dark:text-orange-200' :
                      'text-purple-800 dark:text-purple-200'
                  }`}>
                  {activeTab === 'deposit' && '💡 Demo Mode: Simulated deposit. Funds added instantly to your account.'}
                  {activeTab === 'withdraw' && '💡 Withdrawals are processed instantly to your linked bank account.'}
                  {activeTab === 'transfer' && '💡 Vaultix transfers are FREE & INSTANT. External transfers take up to 5 minutes.'}
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (activeTab === 'transfer' && !recipientVerified)}
                className={`w-full py-3 bg-gradient-to-r ${currentTab?.color || 'from-indigo-600 to-blue-600'} text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  <>
                    {activeTab === 'transfer' && (
                      recipientVerified
                        ? `Send ${formData.amount ? formatCurrency(formData.amount) : ''} to ${recipientName?.split(' ')[0] || 'Recipient'}`
                        : 'Verify Account to Send'
                    )}
                    {activeTab === 'deposit' && `Deposit ${formData.amount ? formatCurrency(formData.amount) : 'Funds'}`}
                    {activeTab === 'withdraw' && `Withdraw ${formData.amount ? formatCurrency(formData.amount) : 'Funds'}`}
                  </>
                )}
              </button>
            </form>

            {/* PIN Status Warning */}
            {!hasPin && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  ⚠️ You haven't set a transaction PIN yet.
                  <button type="button" onClick={() => setShowPinSetupModal(true)} className="ml-2 font-semibold underline">
                    Set PIN Now
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <PinVerificationModal
        isOpen={showPinModal}
        onClose={() => { setShowPinModal(false); setPendingTransaction(null); }}
        onVerify={handlePinVerified}
        title={
          activeTab === 'transfer'
            ? `Confirm Transfer${recipientName ? ` to ${recipientName.split(' ')[0]}` : ''}`
            : activeTab === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'
        }
      />
      <PinSetupModal
        isOpen={showPinSetupModal}
        onClose={() => setShowPinSetupModal(false)}
        onSuccess={handlePinSetupSuccess}
      />
    </>
  );
};

export default Transfer;