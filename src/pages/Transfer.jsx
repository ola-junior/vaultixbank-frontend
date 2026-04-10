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
  FaInfoCircle
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
  const [formData, setFormData] = useState({
    recipientAccount: '',
    recipientBank: '',
    recipientCustomBank: '',
    amount: '',
    description: '',
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

  const paymentMethods = [
    { id: 'card', name: 'Card', icon: FaCreditCard, color: 'from-purple-500 to-pink-500' },
    { id: 'bank', name: 'Bank Transfer', icon: FaUniversity, color: 'from-blue-500 to-cyan-500' },
    { id: 'ussd', name: 'USSD', icon: FaMobileAlt, color: 'from-green-500 to-emerald-500' },
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

  const handleVerifyAccount = async () => {
    if (!formData.recipientBank) {
      toast.error('Please select recipient bank');
      return;
    }
    
    if (formData.recipientBank === 'OTHER' && !formData.recipientCustomBank) {
      toast.error('Please enter bank name');
      return;
    }
    
    if (!formData.recipientAccount) {
      toast.error('Please enter recipient account number');
      return;
    }
    
    if (formData.recipientAccount.length !== 10 || !/^\d+$/.test(formData.recipientAccount)) {
      toast.error('Account number must be 10 digits');
      return;
    }

    if (formData.recipientBank === 'VAULTIX' && formData.recipientAccount === user?.accountNumber) {
      toast.error('Cannot transfer to your own account');
      return;
    }

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
        
        toast.success(data.isInternal ? '✅ Vaultix account verified!' : '✅ Account verified! Ready to transfer.');
      }
    } catch (error) {
      console.error('Account verification error:', error);
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

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if ((activeTab === 'transfer' || activeTab === 'withdraw') && Number(formData.amount) > (user?.balance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    if (activeTab === 'transfer' && !recipientVerified) {
      toast.error('Please verify recipient account first');
      return;
    }

    setPendingTransaction({
      type: activeTab,
      data: {
        ...formData,
        recipientName: recipientName,
        isInternal: isInternalTransfer,
        paymentMethod: selectedPaymentMethod
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
      let requestData = {
        amount: Number(pendingTransaction.data.amount),
        pin,
      };

      if (pendingTransaction.data.description) {
        requestData.description = pendingTransaction.data.description;
      }

      switch (pendingTransaction.type) {
        case 'transfer':
          endpoint = '/transactions/transfer';
          requestData.recipientAccount = pendingTransaction.data.recipientAccount;
          requestData.recipientBank = pendingTransaction.data.recipientBank;
          requestData.recipientName = pendingTransaction.data.recipientName;
          
          successMessage = pendingTransaction.data.isInternal 
            ? `✅ Transfer to ${pendingTransaction.data.recipientName} completed!`
            : `✅ Transfer to ${nigerianBanks.find(b => b.code === pendingTransaction.data.recipientBank)?.name || 'External Bank'} completed!`;
          
          if (pendingTransaction.data.recipientCustomBank) {
            requestData.recipientCustomBank = pendingTransaction.data.recipientCustomBank;
          }
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

        if (response.data.data?.newBalance !== undefined) {
          updateUser({ ...user, balance: response.data.data.newBalance });
        }

        setFormData({
          recipientAccount: '',
          recipientBank: '',
          recipientCustomBank: '',
          amount: '',
          description: '',
        });
        setRecipientVerified(false);
        setRecipientName('');
        setIsInternalTransfer(false);
        setSelectedPaymentMethod('card');

        setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
      }
    } catch (error) {
      console.error('Transaction error:', error);
      
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
    setFormData({
      recipientAccount: '',
      recipientBank: '',
      recipientCustomBank: '',
      amount: '',
      description: '',
    });
    setRecipientVerified(false);
    setRecipientName('');
    setIsInternalTransfer(false);
  };

  const getMaxAmount = () => {
    if (activeTab === 'transfer' || activeTab === 'withdraw') {
      return user?.balance || 0;
    }
    return 1000000;
  };

  const getSelectedBankName = () => {
    if (formData.recipientBank === 'OTHER') return formData.recipientCustomBank;
    return nigerianBanks.find(b => b.code === formData.recipientBank)?.name || '';
  };

  const currentTab = tabs.find(t => t.id === activeTab);

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
                  className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
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
              
              {/* Deposit - Payment Method Selection */}
              {activeTab === 'deposit' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Payment Method (Demo)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`p-3 border rounded-xl text-center transition-all duration-200 ${
                          selectedPaymentMethod === method.id
                            ? `border-indigo-500 bg-gradient-to-br ${method.color} text-white shadow-lg scale-105`
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        <method.icon className={`text-2xl mx-auto mb-1 ${selectedPaymentMethod === method.id ? 'text-white' : 'text-gray-500'}`} />
                        <span className="text-xs font-medium">{method.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Demo Notice */}
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <p className="text-yellow-800 dark:text-yellow-200 text-xs flex items-center gap-2">
                      <FaInfoCircle />
                      <span><strong>Demo Mode:</strong> This is a simulated deposit. No real money is involved.</span>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Transfer-specific fields */}
              {activeTab === 'transfer' && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recipient Bank
                      </label>
                      <div className="relative">
                        <FaUniversity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                          name="recipientBank"
                          required
                          value={formData.recipientBank}
                          onChange={handleChange}
                          disabled={recipientVerified}
                          className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${
                            recipientVerified ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600'
                          }`}
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Enter Bank Name
                        </label>
                        <input
                          type="text"
                          name="recipientCustomBank"
                          required
                          value={formData.recipientCustomBank}
                          onChange={handleChange}
                          disabled={recipientVerified}
                          className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${
                            recipientVerified ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="Enter your bank name"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recipient Account Number
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="recipientAccount"
                          required
                          value={formData.recipientAccount}
                          onChange={handleChange}
                          disabled={recipientVerified}
                          className={`w-full pl-10 pr-24 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${
                            recipientVerified 
                              ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed border-green-500' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
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
                        {recipientVerified && (
                          <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xl" />
                        )}
                      </div>
                    </div>

                    {/* Recipient Name Display */}
                    {recipientVerified && recipientName && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border ${
                          isInternalTransfer 
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200' 
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isInternalTransfer ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {isInternalTransfer ? <FaUser /> : <FaExchangeAlt />}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">
                              {isInternalTransfer ? 'Vaultix Account Holder' : 'External Account'}
                              {!isInternalTransfer && (
                                <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] rounded-full">
                                  External Transfer
                                </span>
                              )}
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{recipientName}</p>
                            <p className="text-xs text-gray-500">Account: {formData.recipientAccount} • Bank: {getSelectedBankName()}</p>
                          </div>
                        </div>
                        {!isInternalTransfer && (
                          <p className="mt-3 text-xs text-gray-500 border-t pt-3">
                            ⚡ External transfers may take up to 5 minutes to process.
                          </p>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Amount field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (₦)
                </label>
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

              {/* Description field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
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
              <div className={`p-4 rounded-xl border ${
                activeTab === 'deposit' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' :
                activeTab === 'withdraw' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200' :
                'bg-purple-50 dark:bg-purple-900/20 border-purple-200'
              }`}>
                <p className={`text-sm ${
                  activeTab === 'deposit' ? 'text-blue-800 dark:text-blue-200' :
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
                  <button
                    type="button"
                    onClick={() => setShowPinSetupModal(true)}
                    className="ml-2 font-semibold underline"
                  >
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
        onClose={() => {
          setShowPinModal(false);
          setPendingTransaction(null);
        }}
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