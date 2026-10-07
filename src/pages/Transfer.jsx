import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import {
  FaPaperPlane, FaDownload, FaUpload, FaUser, FaUniversity,
  FaCheckCircle, FaSpinner, FaSearch, FaExchangeAlt,
  FaCreditCard, FaMobileAlt, FaInfoCircle, FaShieldAlt, FaWallet,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PinVerificationModal from '../components/Common/PinVerificationModal';
import PinSetupModal from '../components/Common/PinSetupModal';
import TransactionReceipt from '../components/Common/TransactionReceipt';

// ─────────────────────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────────────────────

const NIGERIAN_BANKS = [
  { code: 'VAULTIX',   name: '🚀 Vaultix (Internal – Free & Instant)' },
  { code: '044',       name: 'Access Bank' },
  { code: '023',       name: 'Citibank Nigeria' },
  { code: '050',       name: 'Ecobank Nigeria' },
  { code: '070',       name: 'Fidelity Bank' },
  { code: '011',       name: 'First Bank of Nigeria' },
  { code: '058',       name: 'Guaranty Trust Bank (GTBank)' },
  { code: '030',       name: 'Heritage Bank' },
  { code: '301',       name: 'Jaiz Bank' },
  { code: '082',       name: 'Keystone Bank' },
  { code: '076',       name: 'Polaris Bank' },
  { code: '039',       name: 'Stanbic IBTC Bank' },
  { code: '232',       name: 'Sterling Bank' },
  { code: '032',       name: 'Union Bank of Nigeria' },
  { code: '033',       name: 'United Bank for Africa (UBA)' },
  { code: '035',       name: 'Wema Bank' },
  { code: '057',       name: 'Zenith Bank' },
  { code: '101',       name: 'Providus Bank' },
  { code: '215',       name: 'Unity Bank' },
  { code: 'OPAY',      name: 'OPay' },
  { code: 'PALMPAY',   name: 'PalmPay' },
  { code: 'KUDABANK',  name: 'Kuda Bank' },
  { code: 'MONIEPOINT', name: 'Moniepoint' },
  { code: 'OTHER',     name: 'Other / My bank not listed' },
];

const BANKS_NO_INTERNAL = NIGERIAN_BANKS.filter(b => b.code !== 'VAULTIX');

const WALLET_PROVIDERS = [
  { code: 'OPAY',       name: 'OPay' },
  { code: 'PALMPAY',    name: 'PalmPay' },
  { code: 'KUDABANK',   name: 'Kuda Bank' },
  { code: 'MONIEPOINT', name: 'Moniepoint' },
  { code: 'CHIPPER',    name: 'Chipper Cash' },
  { code: 'CARBON',     name: 'Carbon' },
  { code: 'PIGGYVEST',  name: 'PiggyVest' },
  { code: 'COWRYWISE',  name: 'Cowrywise' },
];

const NETWORKS = [
  { code: 'MTN',     ussd: (amt) => `*737*${amt}#` },
  { code: 'AIRTEL',  ussd: (amt) => `*901*${amt}#` },
  { code: 'GLO',     ussd: (amt) => `*805*${amt}#` },
  { code: '9MOBILE', ussd: (amt) => `*322*${amt}#` },
];

const TABS = [
  { id: 'transfer', label: 'Send Money', icon: FaPaperPlane, color: 'from-indigo-600 to-blue-600' },
  { id: 'deposit',  label: 'Deposit',    icon: FaDownload,   color: 'from-green-600 to-emerald-600' },
  { id: 'withdraw', label: 'Withdraw',   icon: FaUpload,     color: 'from-orange-600 to-red-600' },
];

const DEPOSIT_METHODS = [
  { id: 'card', name: 'Debit / Credit Card', icon: FaCreditCard, color: 'from-purple-500 to-pink-500',   desc: 'Pay with Paystack' },
];

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

const loadPaystackScript = () => new Promise((resolve, reject) => {
  if (window.PaystackPop) {
    resolve();
    return;
  }

  const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
  if (existingScript) {
    existingScript.addEventListener('load', resolve, { once: true });
    existingScript.addEventListener('error', () => reject(new Error('Failed to load Paystack script')), { once: true });
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://js.paystack.co/v1/inline.js';
  script.async = true;
  script.onload = resolve;
  script.onerror = () => reject(new Error('Failed to load Paystack script'));
  document.body.appendChild(script);
});

const WITHDRAW_METHODS = [
  { id: 'bank',   name: 'Bank Account',  icon: FaUniversity, color: 'from-blue-500 to-cyan-500',    desc: 'Nigerian bank account' },
  { id: 'wallet', name: 'Mobile Wallet', icon: FaWallet,     color: 'from-green-500 to-emerald-500', desc: 'OPay, PalmPay & more' },
  { id: 'card',   name: 'Debit Card',    icon: FaCreditCard, color: 'from-purple-500 to-pink-500',   desc: 'Card linked to account' },
];

const QUICK_AMOUNTS = {
  transfer: [1000, 5000, 10000, 50000],
  deposit:  [5000, 10000, 25000, 50000],
  withdraw: [5000, 10000, 25000, 50000],
};

const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 12 }, (_, i) => String(THIS_YEAR + i));

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatCardDisplay = (raw = '') => {
  const n = raw.replace(/\s/g, '').padEnd(16, '•');
  return `${n.slice(0,4)} ${n.slice(4,8)} ${n.slice(8,12)} ${n.slice(12,16)}`;
};

const getCardBrand = (raw = '') => {
  const n = raw.replace(/\s/g, '');
  if (n.startsWith('4')) return 'VISA';
  if (/^(5|2)/.test(n)) return 'MASTERCARD';
  if (/^(5061|6500)/.test(n)) return 'VERVE';
  return null;
};

const fmtCardNum = (val = '') =>
  val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// Shared field container
const FieldGroup = ({ children }) => (
  <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-600">
    {children}
  </div>
);

// Shared label
const FieldLabel = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
    {children}
  </label>
);

// Info banner
const InfoBanner = ({ color = 'blue', icon: IconComponent, title, body }) => {
  const colors = {
    blue:   { wrap: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',   icon: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300',   title: 'text-blue-800 dark:text-blue-200',   body: 'text-blue-600 dark:text-blue-300' },
    green:  { wrap: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',  icon: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300',  title: 'text-green-800 dark:text-green-200',  body: 'text-green-600 dark:text-green-300' },
    purple: { wrap: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700', icon: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300', title: 'text-purple-800 dark:text-purple-200', body: 'text-purple-600 dark:text-purple-300' },
  };
  const c = colors[color];
  return (
    <div className={`border rounded-2xl p-4 ${c.wrap}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c.icon}`}>
          {React.createElement(IconComponent, { className: 'text-sm' })}
        </div>
        <div>
          <p className={`text-sm font-semibold ${c.title}`}>{title}</p>
          <p className={`text-xs mt-0.5 leading-relaxed ${c.body}`}>{body}</p>
        </div>
      </div>
    </div>
  );
};

// Method selector buttons (deposit / withdraw)
const MethodSelector = ({ methods, selected, onSelect, activeColor }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {methods.map(m => (
      <button key={m.id} type="button" onClick={() => onSelect(m.id)}
        className={`p-3 border-2 rounded-xl text-left transition-all duration-200 ${selected === m.id
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}
      >
        {React.createElement(m.icon, { className: 'mb-2 text-lg' })}
        <p className="font-semibold text-sm text-gray-800 dark:text-white">{m.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{m.desc}</p>
      </button>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const Transfer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  // UI state
  const [activeTab, setActiveTab] = useState(location.state?.action || 'transfer');
  const [loading, setLoading] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);

  // Modal state
  const [showPinModal, setShowPinModal]       = useState(false);
  const [showPinSetupModal, setShowPinSetupModal] = useState(false);
  const [showReceipt, setShowReceipt]         = useState(false);

  // Transaction state
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [receiptData, setReceiptData]               = useState(null);
  const paystackReferenceRef = useRef('');

  // Transfer state
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [recipientVerified, setRecipientVerified] = useState(false);
  const [recipientName, setRecipientName]         = useState('');
  const [isInternalTransfer, setIsInternalTransfer] = useState(false);
  const [transferDestination, setTransferDestination] = useState('vaultix');
  const [bankSearch, setBankSearch] = useState('');

  // Method selection
  const [depositMethod,  setDepositMethod]  = useState('card');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');

  // Form data
  const [form, setForm] = useState({ recipientAccount: '', recipientBank: '', recipientCustomBank: '', amount: '', description: '' });
  const [cardData,         setCardData]         = useState({ cardNumber: '', cardHolder: '', expiryMonth: '', expiryYear: '', cvv: '' });
  const [bankDepData,      setBankDepData]      = useState({ accountName: '', accountNumber: '', bankName: '', reference: '' });
  const [ussdData,         setUssdData]         = useState({ phone: '', network: '' });
  const [wdBankData,       setWdBankData]       = useState({ accountName: '', accountNumber: '', bankName: '' });
  const [wdWalletData,     setWdWalletData]     = useState({ walletPhone: '', walletProvider: '', walletName: '' });
  const [wdCardData,       setWdCardData]       = useState({ cardNumber: '', cardHolder: '', bankName: '' });

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => { checkPinStatus(); }, []);

  // Reset verify when account/bank changes
  useEffect(() => {
    setRecipientVerified(false);
    setRecipientName('');
    setIsInternalTransfer(false);
  }, [form.recipientAccount, form.recipientBank]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const checkPinStatus = async () => {
    try {
      const res = await api.get('/user/has-pin');
      setHasPin(res.data.hasPin);
    } catch (e) { console.error('PIN check failed', e); }
  };

  const getBankName = (code) => {
    if (code === 'OTHER') return form.recipientCustomBank;
    return NIGERIAN_BANKS.find(b => b.code === code)?.name || code;
  };

  const getMaxAmount = () =>
    activeTab === 'transfer' || activeTab === 'withdraw' ? user?.balance || 0 : 1_000_000;

  const resetAll = () => {
    setForm({ recipientAccount: '', recipientBank: '', recipientCustomBank: '', amount: '', description: '' });
    setCardData({ cardNumber: '', cardHolder: '', expiryMonth: '', expiryYear: '', cvv: '' });
    setBankDepData({ accountName: '', accountNumber: '', bankName: '', reference: '' });
    setUssdData({ phone: '', network: '' });
    setWdBankData({ accountName: '', accountNumber: '', bankName: '' });
    setWdWalletData({ walletPhone: '', walletProvider: '', walletName: '' });
    setWdCardData({ cardNumber: '', cardHolder: '', bankName: '' });
    setRecipientVerified(false);
    setRecipientName('');
    setIsInternalTransfer(false);
    setDepositMethod('card');
    setWithdrawMethod('bank');
  };

  // ── Change handlers ───────────────────────────────────────────────────────
  const onFormChange  = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const selectTransferDestination = (destination) => {
    const defaultBank = destination === 'vaultix' ? 'VAULTIX' : '';
    setTransferDestination(destination);
    setBankSearch('');
    setForm(p => ({ ...p, recipientBank: defaultBank }));
    setRecipientVerified(false);
    setRecipientName('');
    setIsInternalTransfer(false);
  };

  const filteredTransferBanks = BANKS_NO_INTERNAL.filter((bank) =>
    bank.name.toLowerCase().includes(bankSearch.trim().toLowerCase()) ||
    bank.code.toLowerCase().includes(bankSearch.trim().toLowerCase())
  );

  const onCardChange  = (e) => {
    let { name, value } = e.target;
    if (name === 'cardNumber') value = fmtCardNum(value);
    if (name === 'cvv') value = value.replace(/\D/g,'').slice(0,4);
    setCardData(p => ({ ...p, [name]: value }));
  };

  const onWdCardChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cardNumber') value = fmtCardNum(value);
    setWdCardData(p => ({ ...p, [name]: value }));
  };

  // ── Verify recipient account ───────────────────────────────────────────────
  const handleVerifyAccount = async () => {
    if (!form.recipientBank) { toast.error('Search and select the recipient bank first'); return; }
    if (form.recipientBank === 'OTHER' && !form.recipientCustomBank) { toast.error('Please enter bank name'); return; }
    if (!form.recipientAccount || form.recipientAccount.length !== 10 || !/^\d+$/.test(form.recipientAccount)) {
      toast.error('Account number must be exactly 10 digits'); return;
    }
    if (form.recipientBank === 'VAULTIX' && form.recipientAccount === user?.accountNumber) {
      toast.error('You cannot transfer to your own account'); return;
    }
    setVerifyingAccount(true);
    try {
      const res = await api.post('/transactions/verify-account', {
        accountNumber: form.recipientAccount,
        bankCode: form.recipientBank,
        bankName: form.recipientBank === 'OTHER' ? form.recipientCustomBank : undefined,
      });
      if (res.data.success) {
        const d = res.data.data;
        setRecipientName(d.accountName);
        setRecipientVerified(true);
        setIsInternalTransfer(d.isInternal || false);
        toast.success(d.isInternal ? '✅ Vaultix account verified!' : '✅ Account verified!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify account');
      setRecipientVerified(false); setRecipientName(''); setIsInternalTransfer(false);
    } finally { setVerifyingAccount(false); }
  };

  // ── Validate before PIN ───────────────────────────────────────────────────
  const validate = () => {
    const amt = Number(form.amount);
    if (!form.amount || amt <= 0) { toast.error('Please enter a valid amount'); return false; }
    if ((activeTab === 'transfer' || activeTab === 'withdraw') && amt > (user?.balance || 0)) {
      toast.error('Insufficient balance'); return false;
    }
    if (activeTab === 'transfer' && !recipientVerified) {
      toast.error('Please verify recipient account first'); return false;
    }
    if (activeTab === 'deposit') {
      if (depositMethod === 'card') {
        if (!PAYSTACK_PUBLIC_KEY) { toast.error('Paystack public key is missing. Please configure VITE_PAYSTACK_PUBLIC_KEY.'); return false; }
      }
      if (depositMethod === 'bank') {
        if (!bankDepData.accountName.trim()) { toast.error('Enter account name'); return false; }
        if (bankDepData.accountNumber.length < 10) { toast.error('Enter a valid account number'); return false; }
        if (!bankDepData.bankName) { toast.error('Select your bank'); return false; }
      }
      if (depositMethod === 'ussd') {
        if (!ussdData.network) { toast.error('Select your network'); return false; }
        if (!ussdData.phone || ussdData.phone.length < 11) { toast.error('Enter a valid phone number'); return false; }
      }
    }
    if (activeTab === 'withdraw') {
      if (withdrawMethod === 'bank') {
        if (!wdBankData.bankName) { toast.error('Select destination bank'); return false; }
        if (wdBankData.accountNumber.length < 10) { toast.error('Enter a valid 10-digit account number'); return false; }
        if (!wdBankData.accountName.trim()) { toast.error('Enter account name'); return false; }
      }
      if (withdrawMethod === 'wallet') {
        if (!wdWalletData.walletProvider) { toast.error('Select a wallet provider'); return false; }
        if (!wdWalletData.walletPhone || wdWalletData.walletPhone.length < 11) { toast.error('Enter a valid 11-digit phone number'); return false; }
        if (!wdWalletData.walletName.trim()) { toast.error('Enter account name on wallet'); return false; }
      }
      if (withdrawMethod === 'card') {
        if (wdCardData.cardNumber.replace(/\s/g,'').length < 16) { toast.error('Enter a valid 16-digit card number'); return false; }
        if (!wdCardData.cardHolder.trim()) { toast.error('Enter cardholder name'); return false; }
        if (!wdCardData.bankName) { toast.error("Select the card's issuing bank"); return false; }
      }
    }
    return true;
  };

  // ── Submit → open PIN modal ───────────────────────────────────────────────
  const handlePaystackDeposit = async () => {
    if (!PAYSTACK_PUBLIC_KEY) {
      toast.error('Paystack public key is missing. Please configure VITE_PAYSTACK_PUBLIC_KEY.');
      return;
    }

    try {
      await loadPaystackScript();

      if (!window.PaystackPop) {
        throw new Error('Paystack checkout library did not load.');
      }

      const amount = Number(form.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        toast.error('Enter a valid amount.');
        return;
      }

      const email = user?.email?.trim();
      if (!email) {
        toast.error('Your account email is required before making a Paystack payment.');
        return;
      }

      const reference = `VAULTIX-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
      paystackReferenceRef.current = reference;
      const paystackAmount = Math.round(amount * 100);
      let paymentCompleted = false;

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: paystackAmount,
        currency: 'NGN',
        ref: reference,
        metadata: {
          vaultix_user_id: user?._id || user?.id || '',
          custom_fields: [
            {
              display_name: 'Vaultix User ID',
              variable_name: 'vaultix_user_id',
              value: user?._id || user?.id || '',
            },
            {
              display_name: 'Vaultix User',
              variable_name: 'vaultix_user',
              value: user?.name || 'Vaultix User',
            },
          ],
        },
        callback: (response) => {
          paymentCompleted = true;
          if (!response?.reference) {
            toast.error('Paystack did not return a payment reference.');
            return;
          }

          setPendingTransaction({
            type: 'deposit',
            amount,
            description: form.description,
            depositMethod: 'card',
            paystackReference: response.reference || paystackReferenceRef.current,
          });
          setShowPinModal(true);
          toast.success('Payment completed. Enter your transaction PIN to verify it.');
        },
        onClose: () => {
          if (!paymentCompleted) {
            toast.error('Paystack payment was cancelled.');
          }
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error('Paystack setup error:', error);
      toast.error(error.message || 'Unable to open Paystack checkout right now. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (activeTab === 'deposit') {
      await handlePaystackDeposit();
      return;
    }

    setPendingTransaction({
      type: activeTab,
      amount: Number(form.amount),
      description: form.description,
      // transfer
      recipientAccount: form.recipientAccount,
      recipientBank: form.recipientBank,
      recipientCustomBank: form.recipientCustomBank,
      recipientName,
      isInternal: isInternalTransfer,
      // deposit
      depositMethod,
      cardData:    depositMethod === 'card' ? cardData : null,
      bankDepData: depositMethod === 'bank' ? bankDepData : null,
      ussdData:    depositMethod === 'ussd' ? ussdData : null,
      // withdraw
      withdrawMethod,
      wdBankData:   withdrawMethod === 'bank'   ? wdBankData   : null,
      wdWalletData: withdrawMethod === 'wallet' ? wdWalletData : null,
      wdCardData:   withdrawMethod === 'card'   ? wdCardData   : null,
    });
    setShowPinModal(true);
  };

  // ── PIN confirmed → execute API call ──────────────────────────────────────
  const handlePinVerified = async (pin) => {
    if (!pendingTransaction) return;
    setLoading(true);
    setShowPinModal(false);

    try {
      let endpoint;
      const body = {
        amount: pendingTransaction.amount,
        pin,
        ...(pendingTransaction.description ? { description: pendingTransaction.description } : {}),
      };

      if (pendingTransaction.type === 'transfer') {
        endpoint = '/transactions/transfer';
        body.recipientAccount = pendingTransaction.recipientAccount;
        body.recipientBank    = pendingTransaction.recipientBank;
        body.recipientName    = pendingTransaction.recipientName;
        if (pendingTransaction.recipientCustomBank) body.recipientCustomBank = pendingTransaction.recipientCustomBank;
      } else if (pendingTransaction.type === 'deposit') {
        endpoint = '/transactions/deposit';
        body.paymentMethod = pendingTransaction.depositMethod;
        const paymentReference = pendingTransaction.paystackReference || paystackReferenceRef.current;
        if (!paymentReference) {
          toast.error('Paystack payment reference is missing. Please restart the deposit.');
          return;
        }
        body.reference = paymentReference;
      } else {
        endpoint = '/transactions/withdraw';
        body.withdrawMethod   = pendingTransaction.withdrawMethod;
        body.withdrawBankData = pendingTransaction.wdBankData;
        body.withdrawWalletData = pendingTransaction.wdWalletData;
        body.withdrawCardData = pendingTransaction.wdCardData;
      }

      const res = await api.post(endpoint, body);

      if (res.data.success) {
        const txData = res.data.data || {};
        const transaction = txData.transaction || {};

        // Update balance
        if (txData.newBalance !== undefined) {
          updateUser({ ...user, balance: txData.newBalance });
        }

        // Build receipt
        const receipt = {
          ...txData,
          amount:      transaction.amount ?? pendingTransaction.amount,
          status:      transaction.status || txData.status || 'successful',
          type:        pendingTransaction.type === 'deposit' ? 'credit' : 'debit',
          subType:     pendingTransaction.type,
          description: pendingTransaction.description || null,
          createdAt:   transaction.createdAt || txData.createdAt || new Date().toISOString(),
          reference:   transaction.reference || txData.reference || txData.transactionId || txData._id || null,
          recipientName:    pendingTransaction.recipientName || null,
          recipientAccount: pendingTransaction.recipientAccount || null,
          recipientBank:    pendingTransaction.recipientBank
            ? NIGERIAN_BANKS.find(b => b.code === pendingTransaction.recipientBank)?.name || pendingTransaction.recipientBank
            : null,
          senderName:    user?.name || null,
          senderAccount: user?.accountNumber || null,
          balanceAfter:  txData.newBalance ?? transaction.balanceAfter ?? txData.balanceAfter ?? null,
        };

        if (pendingTransaction.type === 'deposit') {
          toast.success('Deposit successful.');
        }
        resetAll();
        setReceiptData(receipt);
        setShowReceipt(true);
      }
    } catch (err) {
      if (err.response?.data?.needsPinSetup) {
        setShowPinSetupModal(true);
        toast.error('Please set your transaction PIN first');
      } else if (err.response?.status === 401) {
        toast.error('Invalid transaction PIN');
      } else {
        toast.error(err.response?.data?.message || 'Transaction failed. Please try again.');
      }
    } finally {
      setLoading(false);
      setPendingTransaction(null);
    }
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    setReceiptData(null);
    navigate('/dashboard', { replace: true });
  };

  const handleTabChange = (id) => {
    setActiveTab(id);
    resetAll();
  };

  const currentTab = TABS.find(t => t.id === activeTab);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">

          {/* ── Tab bar ── */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? `border-indigo-500 bg-gradient-to-r ${tab.color} bg-clip-text text-transparent`
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}>
                  <tab.icon className="inline-block mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ════════════════════════════════════════
                  DEPOSIT TAB
              ════════════════════════════════════════ */}
              {activeTab === 'deposit' && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Choose Payment Method
                    </label>
                    <MethodSelector methods={DEPOSIT_METHODS} selected={depositMethod} onSelect={setDepositMethod} activeColor="indigo" />
                  </div>

                  <AnimatePresence mode="wait">
                    {/* CARD */}
                    {depositMethod === 'card' && (
                      <motion.div key="dep-card"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-4">
                        <InfoBanner color="green" icon={FaCreditCard}
                          title="Secure card deposit"
                          body="Enter the amount below, then complete payment in Paystack's secure checkout. Vaultix never receives your card number or CVV." />
                      </motion.div>
                    )}

                    {/* BANK */}
                    {depositMethod === 'bank' && (
                      <motion.div key="dep-bank"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-4">
                        <InfoBanner color="blue" icon={FaUniversity}
                          title="Bank Transfer Details"
                          body="Enter your source bank account. Funds will be pulled from this account and credited to your Vaultix wallet." />
                        <FieldGroup>
                          <div>
                            <FieldLabel>Account Name</FieldLabel>
                            <div className="relative">
                              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                              <input type="text" name="accountName" value={bankDepData.accountName}
                                onChange={e => setBankDepData(p => ({ ...p, accountName: e.target.value }))}
                                placeholder="Full name on bank account"
                                className="w-full pl-9 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-sm" />
                            </div>
                          </div>
                          <div>
                            <FieldLabel>Source Bank</FieldLabel>
                            <div className="relative">
                              <FaUniversity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                              <select name="bankName" value={bankDepData.bankName}
                                onChange={e => setBankDepData(p => ({ ...p, bankName: e.target.value }))}
                                className="w-full pl-9 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-sm appearance-none">
                                <option value="">Select your bank</option>
                                {BANKS_NO_INTERNAL.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                              </select>
                            </div>
                          </div>
                          <div>
                            <FieldLabel>Account Number</FieldLabel>
                            <input type="text" name="accountNumber" value={bankDepData.accountNumber}
                              onChange={e => setBankDepData(p => ({ ...p, accountNumber: e.target.value.replace(/\D/g,'').slice(0,10) }))}
                              placeholder="10-digit account number" maxLength="10"
                              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-sm font-mono" />
                          </div>
                          <div>
                            <FieldLabel>Transfer Reference <span className="font-normal normal-case text-gray-400">(optional)</span></FieldLabel>
                            <input type="text" value={bankDepData.reference}
                              onChange={e => setBankDepData(p => ({ ...p, reference: e.target.value }))}
                              placeholder="e.g. DEP/2024/001"
                              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-sm" />
                          </div>
                        </FieldGroup>
                        <div className="flex items-center gap-2 px-1">
                          <FaInfoCircle className="text-blue-400 text-sm flex-shrink-0" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">Bank transfers typically process within 2–5 minutes during business hours.</p>
                        </div>
                      </motion.div>
                    )}

                    {/* USSD */}
                    {depositMethod === 'ussd' && (
                      <motion.div key="dep-ussd"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-4">
                        <InfoBanner color="green" icon={FaMobileAlt}
                          title="USSD Payment"
                          body="After submitting, you'll receive a USSD prompt on your phone to authorize the payment. Works without internet." />
                        <FieldGroup>
                          <div>
                            <FieldLabel>Mobile Network</FieldLabel>
                            <div className="grid grid-cols-4 gap-2">
                              {NETWORKS.map(n => (
                                <button key={n.code} type="button" onClick={() => setUssdData(p => ({ ...p, network: n.code }))}
                                  className={`py-2.5 rounded-xl border-2 text-center text-xs font-semibold transition-all ${
                                    ussdData.network === n.code
                                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 hover:border-gray-300'
                                  }`}>
                                  {n.code}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <FieldLabel>Phone Number</FieldLabel>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <FaMobileAlt className="text-gray-400 text-sm" />
                                <span className="text-gray-400 text-sm ml-1">+234</span>
                              </div>
                              <input type="tel" name="phone" value={ussdData.phone}
                                onChange={e => setUssdData(p => ({ ...p, phone: e.target.value.replace(/\D/g,'').slice(0,11) }))}
                                placeholder="08012345678" maxLength="11"
                                className="w-full pl-20 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-sm font-mono" />
                            </div>
                          </div>
                          {/* USSD code preview */}
                          {ussdData.network && form.amount && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className="bg-gray-900 rounded-xl p-4 text-center">
                              <p className="text-gray-400 text-xs mb-1">Dial this code to pay</p>
                              <p className="text-green-400 font-mono text-xl font-bold tracking-wider">
                                {NETWORKS.find(n => n.code === ussdData.network)?.ussd(form.amount)}
                              </p>
                              <p className="text-gray-500 text-[10px] mt-1">Amount: {formatCurrency(form.amount)}</p>
                            </motion.div>
                          )}
                        </FieldGroup>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              )}

              {/* ════════════════════════════════════════
                  WITHDRAW TAB
              ════════════════════════════════════════ */}
              {activeTab === 'withdraw' && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Where are you withdrawing to?
                    </label>
                    <MethodSelector methods={WITHDRAW_METHODS} selected={withdrawMethod} onSelect={setWithdrawMethod} activeColor="orange" />
                  </div>

                  <AnimatePresence mode="wait">
                    {/* BANK */}
                    {withdrawMethod === 'bank' && (
                      <motion.div key="wd-bank"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-4">
                        <InfoBanner color="blue" icon={FaUniversity}
                          title="Withdraw to Bank Account"
                          body="Enter the Nigerian bank account details you want to receive funds in. Must be a valid account in your name." />
                        <FieldGroup>
                          <div>
                            <FieldLabel>Destination Bank</FieldLabel>
                            <div className="relative">
                              <FaUniversity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                              <select name="bankName" value={wdBankData.bankName}
                                onChange={e => setWdBankData(p => ({ ...p, bankName: e.target.value }))}
                                className="w-full pl-9 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white bg-white text-sm appearance-none">
                                <option value="">Select destination bank</option>
                                {BANKS_NO_INTERNAL.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                              </select>
                            </div>
                          </div>
                          <div>
                            <FieldLabel>Account Number</FieldLabel>
                            <input type="text" value={wdBankData.accountNumber}
                              onChange={e => setWdBankData(p => ({ ...p, accountNumber: e.target.value.replace(/\D/g,'').slice(0,10) }))}
                              placeholder="10-digit account number" maxLength="10"
                              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white bg-white text-sm font-mono" />
                          </div>
                          <div>
                            <FieldLabel>Account Name</FieldLabel>
                            <div className="relative">
                              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                              <input type="text" value={wdBankData.accountName}
                                onChange={e => setWdBankData(p => ({ ...p, accountName: e.target.value }))}
                                placeholder="Full name on the bank account"
                                className="w-full pl-9 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white bg-white text-sm" />
                            </div>
                          </div>
                        </FieldGroup>
                        <div className="flex items-center gap-2 px-1">
                          <FaInfoCircle className="text-blue-400 text-sm flex-shrink-0" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">Withdrawals to bank accounts typically arrive within 5–10 minutes.</p>
                        </div>
                      </motion.div>
                    )}

                    {/* WALLET */}
                    {withdrawMethod === 'wallet' && (
                      <motion.div key="wd-wallet"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-4">
                        <InfoBanner color="green" icon={FaWallet}
                          title="Withdraw to Mobile Wallet"
                          body="Funds will be sent to your mobile wallet account. Make sure the phone number matches the wallet account." />
                        <FieldGroup>
                          <div>
                            <FieldLabel>Wallet Provider</FieldLabel>
                            <div className="grid grid-cols-4 gap-2">
                              {WALLET_PROVIDERS.map(p => (
                                <button key={p.code} type="button"
                                  onClick={() => setWdWalletData(prev => ({ ...prev, walletProvider: p.code }))}
                                  className={`py-2.5 px-1 rounded-xl border-2 text-center text-[10px] font-semibold leading-tight transition-all ${
                                    wdWalletData.walletProvider === p.code
                                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 hover:border-gray-300'
                                  }`}>
                                  {p.name}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <FieldLabel>Wallet Phone Number</FieldLabel>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <FaMobileAlt className="text-gray-400 text-sm" />
                                <span className="text-gray-400 text-sm ml-1">+234</span>
                              </div>
                              <input type="tel" value={wdWalletData.walletPhone}
                                onChange={e => setWdWalletData(p => ({ ...p, walletPhone: e.target.value.replace(/\D/g,'').slice(0,11) }))}
                                placeholder="08012345678" maxLength="11"
                                className="w-full pl-20 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white bg-white text-sm font-mono" />
                            </div>
                          </div>
                          <div>
                            <FieldLabel>Account Name on Wallet</FieldLabel>
                            <div className="relative">
                              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                              <input type="text" value={wdWalletData.walletName}
                                onChange={e => setWdWalletData(p => ({ ...p, walletName: e.target.value }))}
                                placeholder="Full name on wallet account"
                                className="w-full pl-9 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white bg-white text-sm" />
                            </div>
                          </div>
                        </FieldGroup>
                        <div className="flex items-center gap-2 px-1">
                          <FaInfoCircle className="text-green-400 text-sm flex-shrink-0" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">Mobile wallet transfers are usually instant once confirmed.</p>
                        </div>
                      </motion.div>
                    )}

                    {/* CARD */}
                    {withdrawMethod === 'card' && (
                      <motion.div key="wd-card"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-4">
                        <InfoBanner color="purple" icon={FaCreditCard}
                          title="Withdraw to Debit Card"
                          body="Enter your debit card number and issuing bank. Funds will be credited to the linked account." />
                        {/* Mini card preview */}
                        <div className="relative h-32 rounded-2xl overflow-hidden select-none"
                          style={{ background: 'linear-gradient(135deg,#ea580c,#dc2626)' }}>
                          <div className="absolute inset-0 p-5 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <p className="text-orange-200 text-[10px] font-medium uppercase tracking-wider">Withdrawal Card</p>
                              {getCardBrand(wdCardData.cardNumber) && (
                                <div className="bg-white/20 px-2.5 py-1 rounded-md">
                                  <p className="text-white text-xs font-bold tracking-widest">{getCardBrand(wdCardData.cardNumber)}</p>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-white font-mono text-lg tracking-widest">{formatCardDisplay(wdCardData.cardNumber)}</p>
                              <div className="flex justify-between items-end mt-2">
                                <div>
                                  <p className="text-orange-300 text-[9px] uppercase tracking-wider">Card Holder</p>
                                  <p className="text-white text-sm font-medium uppercase">{wdCardData.cardHolder || 'YOUR NAME'}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-orange-300 text-[9px] uppercase tracking-wider">Issuing Bank</p>
                                  <p className="text-white text-xs font-medium">
                                    {BANKS_NO_INTERNAL.find(b => b.code === wdCardData.bankName)?.name?.split(' ')[0] || '—'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <FieldGroup>
                          <div>
                            <FieldLabel>Card Number</FieldLabel>
                            <div className="relative">
                              <FaCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                              <input type="text" name="cardNumber" value={wdCardData.cardNumber} onChange={onWdCardChange}
                                placeholder="0000 0000 0000 0000" maxLength="19"
                                className="w-full pl-9 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white font-mono text-sm bg-white" />
                            </div>
                          </div>
                          <div>
                            <FieldLabel>Cardholder Name</FieldLabel>
                            <div className="relative">
                              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                              <input type="text" name="cardHolder" value={wdCardData.cardHolder} onChange={onWdCardChange}
                                placeholder="Name printed on card"
                                className="w-full pl-9 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white bg-white text-sm" />
                            </div>
                          </div>
                          <div>
                            <FieldLabel>Card's Issuing Bank</FieldLabel>
                            <div className="relative">
                              <FaUniversity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                              <select name="bankName" value={wdCardData.bankName} onChange={onWdCardChange}
                                className="w-full pl-9 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white bg-white text-sm appearance-none">
                                <option value="">Select issuing bank</option>
                                {BANKS_NO_INTERNAL.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                              </select>
                            </div>
                          </div>
                        </FieldGroup>
                        <div className="flex items-center gap-2 px-1">
                          <FaShieldAlt className="text-orange-400 text-sm flex-shrink-0" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">We only use your card number to identify the linked bank account. No charges are made to this card.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ════════════════════════════════════════
                  TRANSFER TAB
              ════════════════════════════════════════ */}
              {activeTab === 'transfer' && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Destination type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Where are you sending?</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => selectTransferDestination('vaultix')}
                        className={`p-4 rounded-xl border-2 text-left ${transferDestination === 'vaultix' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
                        <FaWallet className="text-indigo-600 mb-2" />
                        <p className="font-semibold text-gray-900 dark:text-white">Vaultix user</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Send to a Vaultix account</p>
                      </button>
                      <button type="button" onClick={() => selectTransferDestination('bank')}
                        className={`p-4 rounded-xl border-2 text-left ${transferDestination === 'bank' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
                        <FaUniversity className="text-indigo-600 mb-2" />
                        <p className="font-semibold text-gray-900 dark:text-white">Other bank</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">OPay, PalmPay, Moniepoint and more</p>
                      </button>
                    </div>
                  </div>

                  {/* Account number first */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recipient account number</label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" name="recipientAccount" value={form.recipientAccount}
                        onChange={e => { setRecipientVerified(false); setRecipientName(''); onFormChange(e); }} disabled={recipientVerified} required
                        placeholder="Enter 10-digit account number" maxLength="10"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white" />
                    </div>
                  </div>

                  {/* Search/select bank after account number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {transferDestination === 'vaultix' ? 'Vaultix account' : 'Search recipient bank'}
                    </label>
                    {transferDestination !== 'bank' ? (
                      <div className="p-3 rounded-xl border border-green-200 bg-green-50 text-sm text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200">
                        The account number will be checked against Vaultix users.
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input value={bankSearch} onChange={e => setBankSearch(e.target.value)} disabled={recipientVerified}
                            placeholder="Search OPay, PalmPay, Moniepoint, UBA or any bank"
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white bg-white" />
                        </div>
                      {!recipientVerified && (
                      <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                        {filteredTransferBanks
                          .map(bank => (
                            <button type="button" key={bank.code} onClick={() => { setForm(p => ({ ...p, recipientBank: bank.code })); setBankSearch(bank.name); }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm ${form.recipientBank === bank.code ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                              {bank.name} <span className="text-xs opacity-60">({bank.code})</span>
                            </button>
                          ))}
                      </div>
                    )}
                      </>
                    )}
                  </div>

                  {!recipientVerified && (
                    <button type="button" onClick={handleVerifyAccount}
                      disabled={verifyingAccount || form.recipientAccount.length !== 10 || !form.recipientBank}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                      {verifyingAccount ? <FaSpinner className="animate-spin" /> : <FaSearch />} Verify account name
                    </button>
                  )}

                  {/* Verified recipient card */}
                  {recipientVerified && recipientName && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border ${isInternalTransfer
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isInternalTransfer ? 'bg-green-100 dark:bg-green-900/50 text-green-600' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600'
                        }`}>
                          {isInternalTransfer ? <FaUser /> : <FaExchangeAlt />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {isInternalTransfer ? 'Vaultix Account Holder' : 'External Account'}
                            </p>
                            {!isInternalTransfer && (
                              <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 text-[10px] font-semibold rounded-full">
                                External Transfer
                              </span>
                            )}
                          </div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{recipientName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {form.recipientAccount} · {getBankName(form.recipientBank)}
                          </p>
                        </div>
                      </div>
                      {!isInternalTransfer && (
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                          ⚡ Paystack external transfers may take up to 5 minutes to process.
                        </p>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* ════════════════════════════════════════
                  AMOUNT (shared)
              ════════════════════════════════════════ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount (₦)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
                  <input type="number" name="amount" value={form.amount} onChange={onFormChange}
                    required min="1" max={getMaxAmount()} step="1" placeholder="0"
                    className="w-full pl-8 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-lg font-semibold" />
                </div>
                {form.amount && Number(form.amount) > 0 && (
                  <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
                    = <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(form.amount)}</span>
                  </p>
                )}
                {(activeTab === 'transfer' || activeTab === 'withdraw') && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Available: <span className="font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(user?.balance || 0)}</span>
                  </p>
                )}
              </div>

              {/* Quick amount buttons */}
              <div className="grid grid-cols-4 gap-2">
                {QUICK_AMOUNTS[activeTab]?.map(q => (
                  <button key={q} type="button"
                    onClick={() => setForm(p => ({ ...p, amount: q.toString() }))}
                    className={`py-2 border rounded-xl text-sm font-medium transition-all ${
                      form.amount === q.toString()
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                    ₦{q.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea name="description" value={form.description} onChange={onFormChange}
                  rows="2" maxLength="200" placeholder="Add a note…"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none text-sm" />
                <p className="mt-1 text-xs text-gray-400">{form.description.length}/200</p>
              </div>

              {/* Info box */}
              <div className={`p-3.5 rounded-xl border text-sm ${
                activeTab === 'deposit'  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' :
                activeTab === 'withdraw' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200' :
                                          'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200'
              }`}>
                {activeTab === 'deposit'  && '💡 Live Paystack checkout: funds are verified in real time before your wallet is credited.'}
                {activeTab === 'withdraw' && '💡 Paystack processes withdrawals to your selected destination.'}
                {activeTab === 'transfer' && '💡 Vaultix transfers are FREE & INSTANT. Paystack external transfers take up to 5 minutes.'}
              </div>

              {/* Submit button */}
              <button type="submit"
                disabled={loading || (activeTab === 'transfer' && !recipientVerified)}
                className={`w-full py-3.5 bg-gradient-to-r ${currentTab?.color || 'from-indigo-600 to-blue-600'} text-white rounded-xl font-semibold text-base hover:opacity-90 active:scale-[0.99] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <FaSpinner className="animate-spin" /> Processing…
                  </span>
                ) : (
                  <>
                    {activeTab === 'transfer' && (
                      recipientVerified
                        ? `Send ${form.amount ? formatCurrency(form.amount) : ''} to ${recipientName?.split(' ')[0] || 'Recipient'}`
                        : 'Verify Account to Send'
                    )}
                    {activeTab === 'deposit'  && `Deposit ${form.amount ? formatCurrency(form.amount) : 'Funds'}`}
                    {activeTab === 'withdraw' && `Withdraw ${form.amount ? formatCurrency(form.amount) : 'Funds'}`}
                  </>
                )}
              </button>
            </form>

            {/* PIN warning */}
            {!hasPin && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  ⚠️ You haven't set a transaction PIN yet.{' '}
                  <button type="button" onClick={() => setShowPinSetupModal(true)} className="font-semibold underline">
                    Set PIN Now
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <PinVerificationModal
        isOpen={showPinModal}
        onClose={() => { setShowPinModal(false); setPendingTransaction(null); }}
        onVerify={handlePinVerified}
        title={
          activeTab === 'transfer' ? `Confirm Transfer${recipientName ? ` to ${recipientName.split(' ')[0]}` : ''}` :
          activeTab === 'deposit'  ? 'Confirm Deposit' : 'Confirm Withdrawal'
        }
      />

      <PinSetupModal
        isOpen={showPinSetupModal}
        onClose={() => setShowPinSetupModal(false)}
        onSuccess={() => { setHasPin(true); toast.success('PIN set! You can now make transactions.'); }}
      />

      {/* ── Receipt ── */}
      {showReceipt && receiptData && (
        <TransactionReceipt
          transaction={receiptData}
          user={user}
          onClose={handleReceiptClose}
        />
      )}
    </>
  );
};

export default Transfer;