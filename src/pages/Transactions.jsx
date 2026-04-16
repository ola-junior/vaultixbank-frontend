import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import {
  FaArrowUp, FaArrowDown, FaSearch, FaDownload,
  FaReceipt, FaChevronLeft, FaChevronRight,
  FaExchangeAlt, FaCheckCircle, FaClock, FaTimesCircle,
  FaTimes, FaCalendarAlt, FaWallet, FaChartLine,
  FaInbox, FaFilter, FaSlidersH,
} from 'react-icons/fa';
import TransactionReceipt from '../components/Common/TransactionReceipt';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// Constants & helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS = {
  successful: {
    label: 'Success',
    icon: FaCheckCircle,
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/25 dark:text-emerald-400 dark:border-emerald-700/60',
    dot: 'bg-emerald-500',
    glow: 'rgba(16,185,129,0.18)',
  },
  pending: {
    label: 'Pending',
    icon: FaClock,
    pill: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/25 dark:text-amber-400 dark:border-amber-700/60',
    dot: 'bg-amber-400',
    glow: 'rgba(245,158,11,0.18)',
  },
  failed: {
    label: 'Failed',
    icon: FaTimesCircle,
    pill: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/25 dark:text-red-400 dark:border-red-700/60',
    dot: 'bg-red-500',
    glow: 'rgba(239,68,68,0.18)',
  },
};

const CATEGORY_MAP = {
  airtime:     { emoji: '📱', bg: 'bg-violet-100 dark:bg-violet-900/30', label: 'Airtime' },
  data:        { emoji: '📡', bg: 'bg-blue-100 dark:bg-blue-900/30',     label: 'Data' },
  transfer:    { emoji: '💸', bg: 'bg-indigo-100 dark:bg-indigo-900/30', label: 'Transfer' },
  deposit:     { emoji: '💰', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Deposit' },
  withdraw:    { emoji: '🏧', bg: 'bg-orange-100 dark:bg-orange-900/30', label: 'Withdraw' },
  tv:          { emoji: '📺', bg: 'bg-pink-100 dark:bg-pink-900/30',     label: 'TV' },
  electricity: { emoji: '⚡', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Electric' },
  water:       { emoji: '💧', bg: 'bg-cyan-100 dark:bg-cyan-900/30',     label: 'Water' },
  education:   { emoji: '🎓', bg: 'bg-purple-100 dark:bg-purple-900/30', label: 'Education' },
  betting:     { emoji: '⚽', bg: 'bg-green-100 dark:bg-green-900/30',   label: 'Betting' },
  internet:    { emoji: '🌐', bg: 'bg-sky-100 dark:bg-sky-900/30',       label: 'Internet' },
  credit:      { emoji: '⬇️', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Received' },
  debit:       { emoji: '⬆️', bg: 'bg-red-100 dark:bg-red-900/30',       label: 'Sent' },
};

const getCat = (tx) => {
  const d = (tx.description || '').toLowerCase();
  const meta = tx.metadata;
  if (meta?.category && CATEGORY_MAP[meta.category]) return CATEGORY_MAP[meta.category];
  if (d.includes('airtime')) return CATEGORY_MAP.airtime;
  if (d.includes('data')) return CATEGORY_MAP.data;
  if (d.includes('electricity') || d.includes('power') || d.includes('token')) return CATEGORY_MAP.electricity;
  if (d.includes('tv') || d.includes('cable') || d.includes('dstv') || d.includes('gotv')) return CATEGORY_MAP.tv;
  if (d.includes('water')) return CATEGORY_MAP.water;
  if (d.includes('education') || d.includes('waec') || d.includes('jamb') || d.includes('neco')) return CATEGORY_MAP.education;
  if (d.includes('bet') || d.includes('sport')) return CATEGORY_MAP.betting;
  if (d.includes('internet') || d.includes('spectranet') || d.includes('smile')) return CATEGORY_MAP.internet;
  if (d.includes('withdraw')) return CATEGORY_MAP.withdraw;
  if (d.includes('deposit')) return CATEGORY_MAP.deposit;
  return tx.type === 'credit' ? CATEGORY_MAP.credit : CATEGORY_MAP.debit;
};

const getTxLabel = (tx) => {
  if (tx.description) return tx.description;
  if (tx.type === 'credit') return tx.senderName ? `From ${tx.senderName}` : 'Money Received';
  return tx.recipientName ? `To ${tx.recipientName}` : 'Money Sent';
};

const getTxSub = (tx) => {
  if (tx.type === 'credit' && tx.senderName) return tx.senderName;
  if (tx.type === 'debit' && tx.recipientName) return tx.recipientName;
  if (tx.reference) return tx.reference.slice(0, 18) + (tx.reference.length > 18 ? '…' : '');
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton loader row
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonRow = ({ i }) => (
  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-700/50 last:border-0 animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
    <div className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
    <div className="flex-1 min-w-0 space-y-2">
      <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3" />
      <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg w-1/3" />
    </div>
    <div className="text-right space-y-2 flex-shrink-0">
      <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-lg w-20" />
      <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg w-14 ml-auto" />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Transaction card (mobile) + row (desktop)
// ─────────────────────────────────────────────────────────────────────────────
const TxItem = ({ tx, index, onReceipt }) => {
  const isCredit = tx.type === 'credit';
  const status   = STATUS[tx.status] || STATUS.successful;
  const cat      = getCat(tx);
  const label    = getTxLabel(tx);
  const sub      = getTxSub(tx);
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.028, 0.35) }}
      onClick={() => onReceipt(tx)}
      className="group flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-700/50 last:border-0 hover:bg-gray-50/80 dark:hover:bg-gray-700/30 active:bg-gray-100 dark:active:bg-gray-700/50 transition-colors cursor-pointer select-none"
    >
      {/* Icon */}
      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 ${cat.bg} transition-transform group-hover:scale-105`}>
        {cat.emoji}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate leading-snug" style={{ letterSpacing: '-0.01em' }}>
            {label}
          </p>
          <span className={`text-sm font-bold flex-shrink-0 tabular-nums ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200'}`}
            style={{ letterSpacing: '-0.02em' }}>
            {isCredit ? '+' : '−'}{formatCurrency(tx.amount)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5 gap-2">
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
            {sub || formatDate(tx.createdAt)}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
            <span className="text-[10.5px] font-semibold text-gray-400 dark:text-gray-500">{status.label}</span>
          </div>
        </div>
        {/* Date on mobile below sub */}
        <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5 sm:hidden">{formatDate(tx.createdAt)}</p>
      </div>

      {/* Receipt chevron hint */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <FaChevronRight className="text-gray-300 dark:text-gray-600 text-xs" />
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, gradient, icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.3, delay }}
    className="relative overflow-hidden rounded-2xl p-4 sm:p-5"
    style={{ background: gradient, boxShadow: `0 4px 20px ${gradient.includes('emerald') ? 'rgba(16,185,129,0.2)' : gradient.includes('red') ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.2)'}` }}
  >
    <div className="absolute inset-0 opacity-[0.07]" style={{ background: 'radial-gradient(circle at top right, rgba(255,255,255,0.8), transparent 60%)' }} />
    <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.12em] mb-2">{label}</p>
    <p className="text-xl sm:text-2xl font-black text-white leading-none mb-1" style={{ letterSpacing: '-0.03em' }}>{value}</p>
    {sub && <p className="text-[11px] text-white/60 font-medium">{sub}</p>}
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Filter bottom sheet (mobile) / inline (desktop)
// ─────────────────────────────────────────────────────────────────────────────
const FilterSheet = ({ show, onClose, filter, setFilter, dateRange, setDateRange, onClear, hasActive }) => {
  const filterBtns = [
    { id: 'all',    label: 'All',     emoji: '🔄' },
    { id: 'credit', label: 'Credits', emoji: '⬇️' },
    { id: 'debit',  label: 'Debits',  emoji: '⬆️' },
  ];

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm sm:hidden" />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 sm:hidden"
            style={{ borderRadius: '24px 24px 0 0', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <p className="text-base font-bold text-gray-900 dark:text-white" style={{ letterSpacing: '-0.02em' }}>Filters</p>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <FaTimes className="text-gray-500 dark:text-gray-400 text-xs" />
              </button>
            </div>
            <div className="px-5 pb-6 space-y-5">
              {/* Type filter */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Transaction Type</p>
                <div className="grid grid-cols-3 gap-2">
                  {filterBtns.map(btn => (
                    <button key={btn.id} onClick={() => setFilter(btn.id)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all ${
                        filter === btn.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                      }`}>
                      <span className="text-xl">{btn.emoji}</span>
                      <span className={`text-xs font-bold ${filter === btn.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>
                        {btn.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Date range */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Date Range</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1 block">From</label>
                    <input type="date" value={dateRange.from}
                      onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1 block">To</label>
                    <input type="date" value={dateRange.to}
                      onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-3">
                {hasActive && (
                  <button onClick={() => { onClear(); onClose(); }}
                    className="flex-1 py-3 border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 text-sm font-semibold rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    Clear All
                  </button>
                )}
                <button onClick={onClose}
                  className="flex-1 py-3 text-white text-sm font-bold rounded-2xl transition-all"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Transactions component
// ─────────────────────────────────────────────────────────────────────────────
const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');
  const [searchTerm, setSearchTerm]     = useState('');
  const [dateRange, setDateRange]       = useState({ from: '', to: '' });
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showDateDesktop, setShowDateDesktop] = useState(false);
  const [selectedTx, setSelectedTx]     = useState(null);
  const [showReceipt, setShowReceipt]   = useState(false);
  const [pagination, setPagination]     = useState({ page: 1, total: 0, pages: 1 });
  const [stats, setStats]               = useState({ credits: 0, debits: 0, count: 0 });
  const searchRef = useRef(null);

  useEffect(() => { fetchTransactions(); }, [filter, pagination.page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 20 };
      if (filter !== 'all') params.type = filter;
      const res = await api.get('/transactions', { params });
      const rd   = res.data;
      const list = Array.isArray(rd?.data) ? rd.data : Array.isArray(rd) ? rd : [];
      setTransactions(list);
      setPagination({ page: rd?.page ?? pagination.page, total: rd?.total ?? 0, pages: rd?.pages ?? 1 });
      let tc = 0, td = 0;
      list.forEach(t => {
        if (t.status === 'successful') {
          if (t.type === 'credit') tc += t.amount;
          else td += t.amount;
        }
      });
      setStats({ credits: tc, debits: td, count: list.length });
    } catch (e) {
      console.error('fetchTransactions error:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter(tx => {
    const q = searchTerm.toLowerCase();
    const hit = !q ||
      tx.description?.toLowerCase().includes(q) ||
      tx.recipientName?.toLowerCase().includes(q) ||
      tx.senderName?.toLowerCase().includes(q) ||
      tx.reference?.toLowerCase().includes(q);
    const d = new Date(tx.createdAt);
    const fromOk = !dateRange.from || d >= new Date(dateRange.from);
    const toOk   = !dateRange.to   || d <= new Date(dateRange.to + 'T23:59:59');
    return hit && fromOk && toOk;
  });

  const hasActive = filter !== 'all' || searchTerm || dateRange.from || dateRange.to;

  const clearFilters = () => {
    setFilter('all');
    setSearchTerm('');
    setDateRange({ from: '', to: '' });
  };

  const exportCSV = () => {
    const hdr = ['Date', 'Description', 'Type', 'Amount', 'Status', 'Reference'];
    const rows = filtered.map(t => [
      formatDateTime(t.createdAt),
      getTxLabel(t).replace(/,/g, ' '),
      t.type, t.amount, t.status, t.reference || '',
    ]);
    const csv = [hdr, ...rows].map(r => r.join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `vaultix-txns-${new Date().toISOString().slice(0,10)}.csv`,
    });
    a.click();
  };

  const filterBtns = [
    { id: 'all',    label: 'All' },
    { id: 'credit', label: 'Credits' },
    { id: 'debit',  label: 'Debits' },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 max-w-3xl mx-auto px-0 sm:px-0">

      {/* ── Page Header ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-4 sm:px-0 pt-1 sm:pt-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white" style={{ letterSpacing: '-0.03em' }}>
            Transactions
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your complete payment history</p>
        </div>
        <button onClick={exportCSV}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
          <FaDownload className="text-indigo-500 text-xs" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </motion.div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 px-4 sm:px-0">
        <StatCard label="Money In"  value={formatCurrency(stats.credits)} sub="Credits"
          gradient="linear-gradient(135deg,#10b981,#059669)" delay={0} />
        <StatCard label="Money Out" value={formatCurrency(stats.debits)}  sub="Debits"
          gradient="linear-gradient(135deg,#ef4444,#dc2626)" delay={0.06} />
        <StatCard label="Total"     value={pagination.total || stats.count} sub="Transactions"
          gradient="linear-gradient(135deg,#6366f1,#8b5cf6)" delay={0.12} />
      </div>

      {/* ── Search + Filter Bar ── */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 mx-4 sm:mx-0 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

        {/* Top row */}
        <div className="flex items-center gap-2 p-3 sm:p-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search transactions…"
              className="w-full pl-9 pr-8 py-2.5 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:text-white placeholder-gray-400 transition-all"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>

          {/* Mobile filter button */}
          <button onClick={() => setShowFilterSheet(true)}
            className={`sm:hidden flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              hasActive
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}>
            <FaSlidersH className="text-xs" />
            {hasActive ? 'Filtered' : 'Filter'}
          </button>

          {/* Desktop filter pills */}
          <div className="hidden sm:flex items-center gap-2">
            {filterBtns.map(btn => (
              <button key={btn.id} onClick={() => setFilter(btn.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === btn.id
                    ? btn.id === 'credit'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : btn.id === 'debit'
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}>
                {btn.label}
              </button>
            ))}
            <button onClick={() => setShowDateDesktop(p => !p)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                showDateDesktop || dateRange.from || dateRange.to
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}>
              <FaCalendarAlt className="text-[10px]" /> Date
            </button>
            {hasActive && (
              <button onClick={clearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <FaTimes className="text-[9px]" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Desktop date range */}
        <AnimatePresence>
          {showDateDesktop && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }} className="overflow-hidden hidden sm:block">
              <div className="px-4 pb-4 pt-0 flex gap-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">From</label>
                  <input type="date" value={dateRange.from}
                    onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">To</label>
                  <input type="date" value={dateRange.to}
                    onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Transactions List ── */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}
        className="bg-white dark:bg-gray-800 mx-4 sm:mx-0 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

        {/* List header */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700/60">
            <p className="text-[10.5px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em]">
              {filtered.length} {filtered.length === 1 ? 'transaction' : 'transactions'}
              {hasActive && <span className="ml-2 text-indigo-500">· Filtered</span>}
            </p>
            <p className="text-[10.5px] text-gray-400 dark:text-gray-500 font-medium">Tap to view receipt</p>
          </div>
        )}

        {loading ? (
          <div>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} i={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 px-6 gap-3 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700/60 rounded-3xl flex items-center justify-center mb-1">
              <FaInbox className="text-gray-400 dark:text-gray-500 text-2xl" />
            </div>
            <p className="text-base font-bold text-gray-700 dark:text-gray-300" style={{ letterSpacing: '-0.01em' }}>
              No transactions found
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs leading-relaxed">
              {hasActive
                ? 'Try clearing your filters to see more results.'
                : 'Your transactions will appear here once you start sending or receiving money.'}
            </p>
            {hasActive && (
              <button onClick={clearFilters}
                className="mt-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Clear filters
              </button>
            )}
          </motion.div>
        ) : (
          <div>
            {filtered.map((tx, i) => (
              <TxItem key={tx._id || i} tx={tx} index={i}
                onReceipt={t => { setSelectedTx(t); setShowReceipt(true); }} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && !loading && (
          <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              <span className="font-bold text-gray-700 dark:text-gray-300">{pagination.page}</span>
              <span> / </span>
              <span className="font-bold text-gray-700 dark:text-gray-300">{pagination.pages}</span>
              {pagination.total > 0 && (
                <span className="text-gray-400 dark:text-gray-600"> · {pagination.total} total</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <FaChevronLeft className="text-[11px]" />
              </button>

              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pg;
                  const { page, pages } = pagination;
                  if (pages <= 5) pg = i + 1;
                  else if (page <= 3) pg = i + 1;
                  else if (page >= pages - 2) pg = pages - 4 + i;
                  else pg = page - 2 + i;
                  return (
                    <button key={pg} onClick={() => setPagination(p => ({ ...p, page: pg }))}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        pg === pagination.page
                          ? 'text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      style={pg === pagination.page ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : {}}>
                      {pg}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <FaChevronRight className="text-[11px]" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Bottom safe-area spacer for mobile */}
      <div className="h-4 sm:h-0" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />

      {/* Mobile filter sheet */}
      <FilterSheet
        show={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        filter={filter} setFilter={setFilter}
        dateRange={dateRange} setDateRange={setDateRange}
        onClear={clearFilters} hasActive={hasActive}
      />

      {/* Receipt modal */}
      {showReceipt && selectedTx && (
        <TransactionReceipt
          transaction={selectedTx}
          user={user}
          onClose={() => { setShowReceipt(false); setSelectedTx(null); }}
        />
      )}
    </div>
  );
};

export default Transactions;