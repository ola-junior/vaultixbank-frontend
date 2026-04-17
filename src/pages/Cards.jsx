import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  FaCreditCard, FaPlus, FaLock, FaUnlock, FaCopy,
  FaEye, FaEyeSlash, FaSpinner, FaCheckCircle,
  FaTimes, FaArrowLeft, FaShieldAlt, FaWifi, FaCircle,
  FaMoneyBillWave, FaGlobe, FaMobileAlt, FaTrash,
  FaExclamationTriangle, FaHistory, FaSync, FaWallet
} from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import api from '../services/api';

const Cards = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showFullNumber, setShowFullNumber] = useState({});
  const [showCVV, setShowCVV] = useState({});
  const [activeTab, setActiveTab] = useState('all'); // all, physical, virtual
  const [fundAmount, setFundAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [newCardForm, setNewCardForm] = useState({
    type: 'virtual',
    name: 'My Card',
    dailyLimit: 100000,
    pin: '',
    confirmPin: ''
  });

  useEffect(() => {
    fetchCards();
    fetchCardTransactions();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cards');
      if (res.data.success) {
        setCards(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch cards:', err);
      // Mock data for demo
      setCards([
        {
          _id: '1',
          type: 'physical',
          name: 'Platinum Debit',
          cardNumber: '5399412345678901',
          expiry: '05/28',
          cvv: '123',
          status: 'active',
          frozen: false,
          dailyLimit: 100000,
          spentToday: 25000,
          balance: 50000,
          brand: 'mastercard',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          type: 'virtual',
          name: 'Virtual Dollar Card',
          cardNumber: '4532123456789012',
          expiry: '08/27',
          cvv: '456',
          status: 'active',
          frozen: false,
          dailyLimit: 500000,
          spentToday: 120000,
          balance: 200000,
          brand: 'visa',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCardTransactions = async () => {
    try {
      const res = await api.get('/cards/transactions');
      if (res.data.success) {
        setTransactions(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  const handleCreateCard = async () => {
    if (!newCardForm.pin || newCardForm.pin.length !== 4) {
      toast.error('Please enter a 4-digit PIN');
      return;
    }
    if (newCardForm.pin !== newCardForm.confirmPin) {
      toast.error('PINs do not match');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post('/cards/create', {
        type: newCardForm.type,
        name: newCardForm.name,
        dailyLimit: newCardForm.dailyLimit,
        pin: newCardForm.pin
      });
      
      if (res.data.success) {
        await fetchCards();
        toast.success(`${newCardForm.type === 'virtual' ? 'Virtual' : 'Physical'} card created successfully!`);
        setShowCreateModal(false);
        setNewCardForm({ type: 'virtual', name: 'My Card', dailyLimit: 100000, pin: '', confirmPin: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create card');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFreeze = async (cardId) => {
    const card = cards.find(c => c._id === cardId);
    const action = card.frozen ? 'unfreeze' : 'freeze';
    
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this card?`)) {
      return;
    }
    
    try {
      const res = await api.post(`/cards/${cardId}/toggle-freeze`);
      if (res.data.success) {
        setCards(cards.map(c => 
          c._id === cardId ? { ...c, frozen: !c.frozen } : c
        ));
        toast.success(`Card ${action}d successfully`);
      }
    } catch (err) {
      toast.error(`Failed to ${action} card`);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/cards/${cardId}`);
      setCards(cards.filter(c => c._id !== cardId));
      toast.success('Card deleted successfully');
      setSelectedCard(null);
    } catch (err) {
      toast.error('Failed to delete card');
    }
  };

  const handleFundCard = async () => {
    if (!selectedCard) return;
    if (!fundAmount || Number(fundAmount) < 1000) {
      toast.error('Minimum funding amount is ₦1,000');
      return;
    }
    if (Number(fundAmount) > (user?.balance || 0)) {
      toast.error('Insufficient balance in main account');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post(`/cards/${selectedCard._id}/fund`, {
        amount: Number(fundAmount)
      });
      
      if (res.data.success) {
        await refreshUser();
        await fetchCards();
        toast.success(`✅ Card funded with ${formatCurrency(fundAmount)}!`);
        setShowFundModal(false);
        setFundAmount('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fund card');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawFromCard = async () => {
    if (!selectedCard) return;
    if (!fundAmount || Number(fundAmount) < 1000) {
      toast.error('Minimum withdrawal amount is ₦1,000');
      return;
    }
    if (Number(fundAmount) > selectedCard.balance) {
      toast.error('Insufficient card balance');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post(`/cards/${selectedCard._id}/withdraw`, {
        amount: Number(fundAmount)
      });
      
      if (res.data.success) {
        await refreshUser();
        await fetchCards();
        toast.success(`✅ ${formatCurrency(fundAmount)} returned to main balance!`);
        setShowFundModal(false);
        setFundAmount('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw from card');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCardNumber = (cardNumber) => {
    navigator.clipboard.writeText(cardNumber);
    toast.success('Card number copied!');
  };

  const toggleShowNumber = (cardId) => {
    setShowFullNumber(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const toggleShowCVV = (cardId) => {
    setShowCVV(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const formatCardNumber = (number, showFull) => {
    if (!number) return '•••• •••• •••• ••••';
    if (showFull) {
      return `${number.slice(0, 4)} ${number.slice(4, 8)} ${number.slice(8, 12)} ${number.slice(12, 16)}`;
    }
    return `${number.slice(0, 4)} •••• •••• ${number.slice(-4)}`;
  };

  const filteredCards = activeTab === 'all' 
    ? cards 
    : cards.filter(c => c.type === activeTab);

  const totalCardBalance = cards.reduce((sum, c) => sum + (c.balance || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            My Cards
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your virtual and physical cards
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg"
        >
          <FaPlus /> Create Card
        </motion.button>
      </div>

      {/* Card Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-xl"
        >
          <FaCreditCard className="text-2xl mb-2 opacity-80" />
          <p className="text-white/70 text-sm">Total Cards</p>
          <p className="text-2xl font-bold">{cards.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-xl"
        >
          <FaWallet className="text-2xl mb-2 opacity-80" />
          <p className="text-white/70 text-sm">Card Balance</p>
          <p className="text-2xl font-bold">{formatCurrency(totalCardBalance)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-5 text-white shadow-xl"
        >
          <FaShieldAlt className="text-2xl mb-2 opacity-80" />
          <p className="text-white/70 text-sm">Active Cards</p>
          <p className="text-2xl font-bold">{cards.filter(c => !c.frozen).length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-xl"
        >
          <FaMoneyBillWave className="text-2xl mb-2 opacity-80" />
          <p className="text-white/70 text-sm">Main Balance</p>
          <p className="text-2xl font-bold">{formatCurrency(user?.balance || 0)}</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          All Cards ({cards.length})
        </button>
        <button
          onClick={() => setActiveTab('physical')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'physical'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Physical ({cards.filter(c => c.type === 'physical').length})
        </button>
        <button
          onClick={() => setActiveTab('virtual')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'virtual'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Virtual ({cards.filter(c => c.type === 'virtual').length})
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <FaSpinner className="animate-spin text-indigo-500 text-3xl" />
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl">
            <FaCreditCard className="text-5xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No cards found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first card to start making payments
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium"
            >
              Create Card
            </motion.button>
          </div>
        ) : (
          filteredCards.map((card) => (
            <motion.div
              key={card._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`relative bg-gradient-to-br ${card.color || 'from-indigo-600 via-blue-600 to-cyan-600'} rounded-2xl p-6 text-white shadow-xl overflow-hidden`}
            >
              {/* Card Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white rounded-full"></div>
              </div>

              {/* Frozen Overlay */}
              {card.frozen && (
                <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                  <div className="text-center">
                    <FaLock className="text-4xl mb-2" />
                    <p className="font-bold text-lg">Card Frozen</p>
                  </div>
                </div>
              )}

              <div className="relative z-0">
                {/* Top Section */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <FaCreditCard className="text-2xl" />
                    <div>
                      <p className="font-bold text-lg">{card.name}</p>
                      <p className="text-xs opacity-80 capitalize">{card.type} • {card.brand}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {card.type === 'virtual' && <FaGlobe className="opacity-70" />}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      card.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                    }`}>
                      {card.status}
                    </span>
                  </div>
                </div>

                {/* Card Number */}
                <div className="mb-6">
                  <p className="text-xs opacity-70 mb-1">Card Number</p>
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-xl tracking-wider">
                      {formatCardNumber(card.cardNumber, showFullNumber[card._id])}
                    </p>
                    <button
                      onClick={() => toggleShowNumber(card._id)}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      {showFullNumber[card._id] ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <button
                      onClick={() => handleCopyCardNumber(card.cardNumber)}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>

                {/* Card Details Row */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs opacity-70">Expiry</p>
                    <p className="font-mono font-semibold">{card.expiry}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">CVV</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-semibold">
                        {showCVV[card._id] ? card.cvv : '***'}
                      </p>
                      <button
                        onClick={() => toggleShowCVV(card._id)}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        {showCVV[card._id] ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Balance</p>
                    <p className="font-bold">{formatCurrency(card.balance || 0)}</p>
                  </div>
                </div>

                {/* Limits */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs opacity-70 mb-1">
                    <span>Daily Limit</span>
                    <span>{formatCurrency(card.spentToday || 0)} / {formatCurrency(card.dailyLimit)}</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-1.5">
                    <div 
                      className="bg-white rounded-full h-1.5 transition-all"
                      style={{ width: `${Math.min(((card.spentToday || 0) / card.dailyLimit) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedCard(card);
                      setShowFundModal(true);
                    }}
                    disabled={card.frozen}
                    className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Fund Card
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggleFreeze(card._id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      card.frozen 
                        ? 'bg-green-500/30 hover:bg-green-500/40' 
                        : 'bg-yellow-500/30 hover:bg-yellow-500/40'
                    }`}
                  >
                    {card.frozen ? <FaUnlock /> : <FaLock />}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteCard(card._id)}
                    className="px-4 py-2 bg-red-500/30 hover:bg-red-500/40 rounded-lg text-sm font-medium transition-colors"
                  >
                    <FaTrash />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Recent Card Transactions */}
      {transactions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Card Transactions</h3>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((tx, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {tx.type === 'credit' ? <FaArrowLeft className="rotate-45" /> : <FaArrowLeft />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{tx.description}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <p className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Card Modal */}
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
              <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <FaArrowLeft />
                  </button>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Create New Card
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Card Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Card Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setNewCardForm({ ...newCardForm, type: 'virtual' })}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          newCardForm.type === 'virtual'
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <FaGlobe className="text-2xl mb-1" style={{ color: newCardForm.type === 'virtual' ? '#6366f1' : '#9ca3af' }} />
                        <p className="font-medium">Virtual Card</p>
                        <p className="text-xs text-gray-500">Instant • Online only</p>
                      </button>
                      <button
                        onClick={() => setNewCardForm({ ...newCardForm, type: 'physical' })}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          newCardForm.type === 'physical'
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <FaCreditCard className="text-2xl mb-1" style={{ color: newCardForm.type === 'physical' ? '#6366f1' : '#9ca3af' }} />
                        <p className="font-medium">Physical Card</p>
                        <p className="text-xs text-gray-500">Delivery: 3-5 days</p>
                      </button>
                    </div>
                  </div>

                  {/* Card Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Card Name
                    </label>
                    <input
                      type="text"
                      value={newCardForm.name}
                      onChange={(e) => setNewCardForm({ ...newCardForm, name: e.target.value })}
                      placeholder="e.g., Shopping Card"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {/* Daily Limit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Daily Spending Limit (₦)
                    </label>
                    <select
                      value={newCardForm.dailyLimit}
                      onChange={(e) => setNewCardForm({ ...newCardForm, dailyLimit: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value={50000}>₦50,000</option>
                      <option value={100000}>₦100,000</option>
                      <option value={250000}>₦250,000</option>
                      <option value={500000}>₦500,000</option>
                      <option value={1000000}>₦1,000,000</option>
                    </select>
                  </div>

                  {/* PIN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      4-Digit PIN
                    </label>
                    <input
                      type="password"
                      maxLength="4"
                      value={newCardForm.pin}
                      onChange={(e) => setNewCardForm({ ...newCardForm, pin: e.target.value.replace(/\D/g, '') })}
                      placeholder="••••"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-center text-2xl tracking-widest"
                    />
                  </div>

                  {/* Confirm PIN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm PIN
                    </label>
                    <input
                      type="password"
                      maxLength="4"
                      value={newCardForm.confirmPin}
                      onChange={(e) => setNewCardForm({ ...newCardForm, confirmPin: e.target.value.replace(/\D/g, '') })}
                      placeholder="••••"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-center text-2xl tracking-widest"
                    />
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {newCardForm.type === 'virtual' 
                        ? '✅ Virtual card will be created instantly and ready to use.'
                        : '📦 Physical card will be delivered to your address within 3-5 business days.'
                      }
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreateCard}
                      disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl disabled:opacity-50"
                    >
                      {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Create Card'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Fund/Withdraw Modal */}
      <AnimatePresence>
        {showFundModal && selectedCard && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowFundModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setShowFundModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <FaArrowLeft />
                  </button>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Manage Card Balance
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="text-sm text-gray-500">Current Card Balance</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(selectedCard.balance || 0)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Main Account Balance</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(user?.balance || 0)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount (₦)
                    </label>
                    <input
                      type="number"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      min={1000}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-lg font-semibold"
                    />
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleFundCard}
                      disabled={loading}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl disabled:opacity-50"
                    >
                      Add Money
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleWithdrawFromCard}
                      disabled={loading}
                      className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl disabled:opacity-50"
                    >
                      Withdraw
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cards;