import React, { useState, useEffect } from 'react';
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
  { id: 'card', name: 'Debit / Credit Card', icon: FaCreditCard, color: 'from-purple-500 to-pink-500',   desc: 'Visa, Mastercard, Verve' },
  { id: 'bank', name: 'Bank Transfer',       icon: FaUniversity, color: 'from-blue-500 to-cyan-500',    desc: 'Direct from your bank' },
  { id: 'ussd', name: 'USSD',                icon: FaMobileAlt,  color: 'from-green-500 to-emerald-500', desc: 'Works without internet' },
];

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
const InfoBanner = ({ color = 'blue', icon: Icon, title, body }) => {
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
          <Icon className="text-sm" />
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
  <div className="grid grid-cols-3 gap-3">
    {methods.map(m => (
      <button key={m.id} type="button" onClick={() => onSelect(m.id)}
        className={`p-3 border-2 rounded-xl text-left transition-all duration-200 ${
          selected === m.id
            ? `border-${activeColor}-500 bg-${activeColor}-50 dark:bg-${activeColor}-900/30 shadow-md`
            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300'
        }`}>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 bg-gradient-to-br ${m.color}`}>
          <m.icon className="text-white text-base" />
        </div>
        <p className={`text-xs font-semibold ${selected === m.id ? `text-${activeColor}-700 dark:text-${activeColor}-300` : 'text-gray-700 dark:text-gray-300'}`}>
          {m.name}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{m.desc}</p>
      </button>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Card Preview (3D flip)
// ─────────────────────────────────────────────────────────────────────────────

const CardPreview = ({ cardData, flipped, onFlip, gradient = 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#a855f7 100%)', textColor = 'purple' }) => {
  const brand = getCardBrand(cardData.cardNumber);
  return (
    <div>
      <div className="relative h-44 rounded-2xl overflow-hidden cursor-pointer select-none"
        style={{ perspective: '1000px' }} onClick={onFlip}>
        <motion.div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.5, ease: 'easeInOut' }}>

          {/* Front */}
          <div className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between"
            style={{ backfaceVisibility: 'hidden', background: gradient }}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-${textColor}-200 text-[10px] font-medium uppercase tracking-wider`}>Vaultix</p>
              </div>
              {brand && (
                <div className="bg-white/20 px-2.5 py-1 rounded-md">
                  <p className="text-white text-xs font-bold tracking-widest">{brand}</p>
                </div>
              )}
            </div>
            {/* Chip */}
            <div className="w-10 h-7 rounded bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
              <div className="w-7 h-4 border border-yellow-600/50 rounded-sm grid grid-cols-3 gap-px p-0.5">
                {[...Array(9)].map((_, i) => <div key={i} className="bg-yellow-600/40 rounded-[1px]" />)}
              </div>
            </div>
            <div>
              <p className="text-white font-mono text-lg tracking-widest">{formatCardDisplay(cardData.cardNumber)}</p>
              <div className="flex justify-between items-end mt-3">
                <div>
                  <p className={`text-${textColor}-300 text-[9px] uppercase tracking-wider`}>Card Holder</p>
                  <p className="text-white text-sm font-medium mt-0.5 uppercase tracking-wide">{cardData.cardHolder || 'YOUR NAME'}</p>
                </div>
                {cardData.expiryMonth && (
                  <div className="text-right">
                    <p className={`text-${textColor}-300 text-[9px] uppercase tracking-wider`}>Expires</p>
                    <p className="text-white text-sm font-medium mt-0.5">{cardData.expiryMonth}/{cardData.expiryYear?.slice(-2) || 'YY'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 rounded-2xl flex flex-col justify-between"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
            <div className="h-10 bg-gray-900/70 mt-6" />
            <div className="px-5 pb-5">
              <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
                <div className="flex-1 h-7 bg-white/80 rounded-md flex items-center px-3">
                  <span className="font-mono text-gray-800 font-bold tracking-[0.3em] text-sm">
                    {cardData.cvv ? '•'.repeat(cardData.cvv.length) : '•••'}
                  </span>
                </div>
                <p className="text-purple-300 text-[10px] ml-3">CVV</p>
              </div>
              <p className="text-purple-400 text-[9px] text-center mt-2">Click to flip back</p>
            </div>
          </div>
        </motion.div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-1">Click card to see CVV side</p>
    </div>
  );
};

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

  // Transfer state
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [recipientVerified, setRecipientVerified] = useState(false);
  const [recipientName, setRecipientName]         = useState('');
  const [isInternalTransfer, setIsInternalTransfer] = useState(false);

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
    if (!form.recipientBank) { toast.error('Please select recipient bank'); return; }
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
        if (cardData.cardNumber.replace(/\s/g,'').length < 16) { toast.error('Enter a valid 16-digit card number'); return false; }
        if (!cardData.cardHolder.trim()) { toast.error('Enter cardholder name'); return false; }
        if (!cardData.expiryMonth || !cardData.expiryYear) { toast.error('Enter card expiry'); return false; }
        if (!cardData.cvv || cardData.cvv.length < 3) { toast.error('Enter a valid CVV'); return false; }
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
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
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

        // Update balance
        if (txData.newBalance !== undefined) {
          updateUser({ ...user, balance: txData.newBalance });
        }

        // Build receipt
        const receipt = {
          ...txData,
          amount:      pendingTransaction.amount,
          status:      txData.status || 'successful',
          type:        pendingTransaction.type === 'deposit' ? 'credit' : 'debit',
          subType:     pendingTransaction.type,
          description: pendingTransaction.description || null,
          createdAt:   txData.createdAt || new Date().toISOString(),
          reference:   txData.reference || txData.transactionId || txData._id || null,
          recipientName:    pendingTransaction.recipientName || null,
          recipientAccount: pendingTransaction.recipientAccount || null,
          recipientBank:    pendingTransaction.recipientBank
            ? NIGERIAN_BANKS.find(b => b.code === pendingTransaction.recipientBank)?.name || pendingTransaction.recipientBank
            : null,
          senderName:    user?.name || null,
          senderAccount: user?.accountNumber || null,
          balanceAfter:  txData.newBalance ?? txData.balanceAfter ?? null,
        };

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
                        <CardPreview cardData={cardData} flipped={cardFlipped} onFlip={() => setCardFlipped(p => !p)} />
                        <FieldGroup>
                          {/* Card number */}
                          <div>
                            <FieldLabel>Card Number</FieldLabel>
                            <div className="relative">
                              <FaCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                              <input type="text" name="cardNumber" value={cardData.cardNumber} onChange={onCardChange}
                                placeholder="0000 0000 0000 0000" maxLength="19"
                                className="w-full pl-9 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white font-mono text-sm bg-white" />
                            </div>
                          </div>
                          {/* Cardholder */}
                          <div>
                            <FieldLabel>Cardholder Name</FieldLabel>
                            <div className="relative">
                              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                              <input type="text" name="cardHolder" value={cardData.cardHolder} onChange={onCardChange}
                                placeholder="Name on card"
                                className="w-full pl-9 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-sm" />
                            </div>
                          </div>
                          {/* Expiry + CVV */}
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <FieldLabel>Month</FieldLabel>
                              <select name="expiryMonth" value={cardData.expiryMonth} onChange={onCardChange}
                                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-sm">
                                <option value="">MM</option>
                                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                            </div>
                            <div>
                              <FieldLabel>Year</FieldLabel>
                              <select name="expiryYear" value={cardData.expiryYear} onChange={onCardChange}
                                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-sm">
                                <option value="">YY</option>
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                              </select>
                            </div>
                            <div>
                              <FieldLabel>CVV</FieldLabel>
                              <input type="text" name="cvv" value={cardData.cvv} onChange={onCardChange}
                                onFocus={() => setCardFlipped(true)} onBlur={() => setCardFlipped(false)}
                                placeholder="•••" maxLength="4"
                                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white bg-white text-sm font-mono" />
                            </div>
                          </div>
                        </FieldGroup>
                        <div className="flex items-center gap-2 px-1">
                          <FaShieldAlt className="text-green-500 text-sm flex-shrink-0" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">Card details are 256-bit encrypted. We never store your CVV.</p>
                        </div>
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

                  {/* Demo notice */}
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <p className="text-yellow-800 dark:text-yellow-200 text-xs flex items-center gap-2">
                      <FaInfoCircle className="flex-shrink-0" />
                      <span><strong>Demo Mode:</strong> This is a simulated deposit. No real money or card details are processed.</span>
                    </p>
                  </div>
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
                  {/* Recipient Bank */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recipient Bank</label>
                    <div className="relative">
                      <FaUniversity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select name="recipientBank" value={form.recipientBank} onChange={onFormChange}
                        disabled={recipientVerified} required
                        className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-colors ${
                          recipientVerified ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed border-gray-200' : 'border-gray-300 dark:border-gray-600 bg-white'
                        }`}>
                        <option value="">Select recipient bank</option>
                        {NIGERIAN_BANKS.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Custom bank name */}
                  {form.recipientBank === 'OTHER' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enter Bank Name</label>
                      <input type="text" name="recipientCustomBank" value={form.recipientCustomBank}
                        onChange={onFormChange} disabled={recipientVerified} required
                        placeholder="Enter your bank name"
                        className={`w-full px-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${
                          recipientVerified ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed border-gray-200' : 'border-gray-300 dark:border-gray-600 bg-white'
                        }`} />
                    </div>
                  )}

                  {/* Account number + Verify */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recipient Account Number</label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" name="recipientAccount" value={form.recipientAccount}
                        onChange={onFormChange} disabled={recipientVerified} required
                        placeholder="Enter 10-digit account number" maxLength="10"
                        className={`w-full pl-10 pr-28 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${
                          recipientVerified ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed border-green-400' : 'border-gray-300 dark:border-gray-600 bg-white'
                        }`} />
                      {!recipientVerified ? (
                        <button type="button" onClick={handleVerifyAccount}
                          disabled={verifyingAccount || !form.recipientAccount || !form.recipientBank}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1">
                          {verifyingAccount ? <FaSpinner className="animate-spin text-xs" /> : <><FaSearch className="text-xs" /> Verify</>}
                        </button>
                      ) : (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                          <FaCheckCircle className="text-green-500 text-lg" />
                          <button type="button"
                            onClick={() => { setRecipientVerified(false); setRecipientName(''); setIsInternalTransfer(false); }}
                            className="text-xs text-gray-400 hover:text-red-500 underline transition-colors">
                            Change
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

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
                          ⚡ External transfers may take up to 5 minutes to process.
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
                {activeTab === 'deposit'  && '💡 Demo Mode: Simulated deposit. Funds added instantly to your account.'}
                {activeTab === 'withdraw' && '💡 Withdrawals are processed within minutes to your selected destination.'}
                {activeTab === 'transfer' && '💡 Vaultix transfers are FREE & INSTANT. External transfers take up to 5 minutes.'}
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