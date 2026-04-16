import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import TransactionReceipt from './TransactionReceipt';
import {
  FaChevronRight, FaArrowUp, FaArrowDown,
  FaExchangeAlt, FaChevronDown,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Category resolver (same as Transactions page) ────────────────────────────
const getCat = (tx) => {
  const d = (tx.description || '').toLowerCase();
  const meta = tx.metadata;
  if (meta?.category) {
    const cats = {
      airtime: '📱', data: '📡', electricity: '⚡', tv: '📺',
      water: '💧', education: '🎓', betting: '⚽', internet: '🌐',
    };
    if (cats[meta.category]) return { emoji: cats[meta.category], color: '#6366f1' };
  }
  if (d.includes('airtime'))  return { emoji: '📱', color: '#8b5cf6' };
  if (d.includes('data'))     return { emoji: '📡', color: '#3b82f6' };
  if (d.includes('electricity') || d.includes('power') || d.includes('token')) return { emoji: '⚡', color: '#eab308' };
  if (d.includes('tv') || d.includes('cable') || d.includes('dstv')) return { emoji: '📺', color: '#ec4899' };
  if (d.includes('water'))    return { emoji: '💧', color: '#06b6d4' };
  if (d.includes('education') || d.includes('waec') || d.includes('jamb')) return { emoji: '🎓', color: '#8b5cf6' };
  if (d.includes('bet'))      return { emoji: '⚽', color: '#10b981' };
  if (d.includes('internet')) return { emoji: '🌐', color: '#6366f1' };
  if (d.includes('withdraw')) return { emoji: '🏧', color: '#f97316' };
  if (d.includes('deposit'))  return { emoji: '💰', color: '#10b981' };
  return tx.type === 'credit'
    ? { emoji: '⬇️', color: '#10b981' }
    : { emoji: '⬆️', color: '#ef4444' };
};

const getTxLabel = (tx) => {
  if (tx.description) return tx.description;
  if (tx.type === 'credit') return tx.senderName ? `From ${tx.senderName}` : 'Money Received';
  return tx.recipientName ? `To ${tx.recipientName}` : 'Money Sent';
};

const getTxSub = (tx) => {
  if (tx.type === 'credit' && tx.senderName) return tx.senderName;
  if (tx.type === 'debit' && tx.recipientName) return tx.recipientName;
  return formatDate(tx.createdAt);
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const SkeletonItem = ({ i }) => (
  <div className="flex items-center gap-3 px-4 py-3.5 animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
    <div className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/5" />
      <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg w-2/5" />
    </div>
    <div className="space-y-2 text-right">
      <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-lg w-16" />
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-lg w-10 ml-auto" />
    </div>
  </div>
);

// ─── Single transaction item ──────────────────────────────────────────────────
const TxItem = ({ tx, index, onTap }) => {
  const isCredit = tx.type === 'credit';
  const cat = getCat(tx);
  const label = getTxLabel(tx);
  const sub = getTxSub(tx);

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      onClick={() => onTap(tx)}
      className="group flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/80 dark:hover:bg-gray-700/30 active:bg-gray-100 dark:active:bg-gray-700/50 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-700/50 last:border-0"
    >
      {/* Emoji icon with glow */}
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 transition-transform group-hover:scale-105"
        style={{
          background: cat && cat.color ? `${cat.color}14` : '#6366f114',
          boxShadow: cat && cat.color ? `0 2px 8px ${cat.color}20` : '0 2px 8px #6366f120',
        }}
      >
        {cat?.emoji || '💳'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13.5px] font-semibold text-gray-800 dark:text-gray-100 truncate leading-snug" style={{ letterSpacing: '-0.01em' }}>
            {label}
          </p>
          <span
            className="text-[13.5px] font-bold flex-shrink-0 tabular-nums"
            style={{ color: isCredit ? '#10b981' : '#374151', letterSpacing: '-0.02em' }}
          >
            {isCredit ? '+' : '−'}{formatCurrency(tx.amount)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{sub}</p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${
              tx.status === 'successful' ? 'bg-emerald-500' :
              tx.status === 'pending'    ? 'bg-amber-400' : 'bg-red-500'
            }`} />
            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 capitalize">{tx.status}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main RecentTransactions ──────────────────────────────────────────────────
const RecentTransactions = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeFilter, setActiveFilter]   = useState('all');
  const [selectedTx, setSelectedTx]       = useState(null);
  const [showReceipt, setShowReceipt]     = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  useEffect(() => { 
    fetchTransactions(); 
  }, [refreshTrigger, activeFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = { limit: 6 };
      if (activeFilter !== 'all') params.type = activeFilter;
      const res = await api.get('/transactions', { params });
      const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setTransactions(list.slice(0, 6));
    } catch (e) {
      console.error('RecentTransactions fetch error:', e);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Summary stats from loaded list
  const totalIn  = transactions.filter(t => t.type === 'credit' && t.status === 'successful').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'debit'  && t.status === 'successful').reduce((s, t) => s + t.amount, 0);

  const filterBtns = [
    { id: 'all',    label: 'All' },
    { id: 'credit', label: 'In' },
    { id: 'debit',  label: 'Out' },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-black text-gray-900 dark:text-white" style={{ letterSpacing: '-0.02em' }}>
              Recent Activity
            </h2>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Your latest transactions</p>
          </div>
          <Link to="/transactions"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
            See all <FaChevronRight className="text-[9px]" />
          </Link>
        </div>

        {/* ── Mini summary bar ── */}
        <motion.div
          onClick={() => setSummaryExpanded(p => !p)}
          className="mx-4 mb-3 rounded-2xl overflow-hidden cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)' }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[9.5px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">In</p>
                <p className="text-sm font-black text-emerald-600" style={{ letterSpacing: '-0.02em' }}>
                  {loading ? '—' : `+${formatCurrency(totalIn)}`}
                </p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
              <div>
                <p className="text-[9.5px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Out</p>
                <p className="text-sm font-black text-gray-700 dark:text-gray-300" style={{ letterSpacing: '-0.02em' }}>
                  {loading ? '—' : `−${formatCurrency(totalOut)}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-bold text-gray-400">This page</span>
              <motion.div animate={{ rotate: summaryExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <FaChevronDown className="text-gray-400 text-xs" />
              </motion.div>
            </div>
          </div>

          <AnimatePresence>
            {summaryExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 pt-0 border-t border-gray-200/60 dark:border-gray-700/40">
                  <div className="grid grid-cols-3 gap-3 mt-2.5">
                    {[
                      { label: 'Credits', count: transactions.filter(t => t.type === 'credit').length, color: '#10b981' },
                      { label: 'Debits',  count: transactions.filter(t => t.type === 'debit').length,  color: '#ef4444' },
                      { label: 'Total',   count: transactions.length,                                   color: '#6366f1' },
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{s.label}</p>
                        <p className="text-base font-black" style={{ color: s.color, letterSpacing: '-0.02em' }}>{s.count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Filter pills ── */}
        <div className="flex items-center gap-2 px-4 pb-3">
          {filterBtns.map(btn => (
            <button
              key={btn.id}
              onClick={() => setActiveFilter(btn.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === btn.id
                  ? btn.id === 'credit'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : btn.id === 'debit'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* ── List ── */}
        <div className="border-t border-gray-100 dark:border-gray-700/50">
          {loading ? (
            <div>{Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} i={i} />)}</div>
          ) : transactions.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 gap-2 text-center px-6">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700/60 rounded-2xl flex items-center justify-center mb-1">
                <FaExchangeAlt className="text-gray-400 dark:text-gray-500 text-lg" />
              </div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400" style={{ letterSpacing: '-0.01em' }}>
                No transactions yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[200px] leading-relaxed">
                Start sending or receiving money to see your history here.
              </p>
              <button onClick={() => navigate('/transfer')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl transition-all"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}>
                Make a transfer
              </button>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={activeFilter}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}>
                {transactions.map((tx, i) => (
                  <TxItem key={tx._id || i} tx={tx} index={i}
                    onTap={t => { setSelectedTx(t); setShowReceipt(true); }} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* ── Footer CTA ── */}
        {!loading && transactions.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700/50">
            <Link to="/transactions"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
              View all transactions <FaChevronRight className="text-[9px]" />
            </Link>
          </div>
        )}
      </motion.div>

      {/* Receipt modal */}
      {showReceipt && selectedTx && (
        <TransactionReceipt
          transaction={selectedTx}
          user={user}
          onClose={() => { setShowReceipt(false); setSelectedTx(null); }}
        />
      )}
    </>
  );
};

export default RecentTransactions;