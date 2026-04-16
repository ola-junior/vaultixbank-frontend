import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import {
  FaArrowUp, FaArrowDown, FaSearch, FaDownload,
  FaReceipt, FaFilter, FaChevronLeft, FaChevronRight,
  FaExchangeAlt, FaCheckCircle, FaClock, FaTimesCircle,
  FaSort, FaSortUp, FaSortDown, FaTimes, FaCalendarAlt,
  FaWallet, FaChartLine, FaInbox
} from 'react-icons/fa';
import TransactionReceipt from '../components/Common/TransactionReceipt';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_META = {
  successful: {
    label: 'Successful',
    icon: FaCheckCircle,
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  pending: {
    label: 'Pending',
    icon: FaClock,
    pill: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    dot: 'bg-amber-400',
  },
  failed: {
    label: 'Failed',
    icon: FaTimesCircle,
    pill: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    dot: 'bg-red-500',
  },
};

const getTxLabel = (tx) => {
  if (tx.description) return tx.description;
  if (tx.type === 'credit') return tx.senderName ? `From ${tx.senderName}` : 'Money Received';
  return tx.recipientName ? `To ${tx.recipientName}` : 'Money Sent';
};

const getTxSub = (tx) => {
  if (tx.type === 'credit' && tx.senderName) return `Sent by ${tx.senderName}`;
  if (tx.type === 'debit' && tx.recipientName) return `To ${tx.recipientName}`;
  return tx.reference?.slice(0, 14) ? `Ref: ${tx.reference.slice(0, 14)}…` : null;
};

// Category icon mapping
const getCategoryIcon = (tx) => {
  const desc = (tx.description || '').toLowerCase();
  if (desc.includes('airtime') || desc.includes('data')) return { icon: '📱', bg: 'bg-violet-100 dark:bg-violet-900/30' };
  if (desc.includes('transfer') || desc.includes('sent')) return { icon: '💸', bg: 'bg-blue-100 dark:bg-blue-900/30' };
  if (desc.includes('deposit') || desc.includes('received')) return { icon: '💰', bg: 'bg-green-100 dark:bg-green-900/30' };
  if (desc.includes('withdraw')) return { icon: '🏧', bg: 'bg-orange-100 dark:bg-orange-900/30' };
  if (desc.includes('tv') || desc.includes('cable')) return { icon: '📺', bg: 'bg-pink-100 dark:bg-pink-900/30' };
  if (desc.includes('electricity') || desc.includes('power')) return { icon: '⚡', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
  if (tx.type === 'credit') return { icon: '⬇️', bg: 'bg-emerald-100 dark:bg-emerald-900/30' };
  return { icon: '⬆️', bg: 'bg-red-100 dark:bg-red-900/30' };
};

// ─────────────────────────────────────────────────────────────────────────────
// Summary stat card
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, trend, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
        {trend && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{trend}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="text-white text-base" />
      </div>
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Single transaction row
// ─────────────────────────────────────────────────────────────────────────────
const TxRow = ({ tx, index, onReceipt }) => {
  const isCredit = tx.type === 'credit';
  const status = STATUS_META[tx.status] || STATUS_META.successful;
  const category = getCategoryIcon(tx);
  const label = getTxLabel(tx);
  const sub = getTxSub(tx);

  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="group hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors border-b border-gray-100 dark:border-gray-700/60 last:border-0"
    >
      {/* Icon + Description */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${category.bg}`}>
            {category.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[180px]">{label}</p>
            {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-[180px]">{sub}</p>}
          </div>
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-3.5 hidden sm:table-cell">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{formatDate(tx.createdAt)}</p>
      </td>

      {/* Type */}
      <td className="px-4 py-3.5 hidden md:table-cell">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
          isCredit
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
        }`}>
          {isCredit ? <FaArrowDown className="text-[9px]" /> : <FaArrowUp className="text-[9px]" />}
          {isCredit ? 'Credit' : 'Debit'}
        </span>
      </td>

      {/* Amount */}
      <td className="px-4 py-3.5">
        <span className={`text-sm font-bold tabular-nums ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
          {isCredit ? '+' : '−'}{formatCurrency(tx.amount)}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${status.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </td>

      {/* Receipt */}
      <td className="px-4 py-3.5">
        <button
          onClick={() => onReceipt(tx)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 transition-all opacity-0 group-hover:opacity-100"
          title="View Receipt"
        >
          <FaReceipt className="text-sm" />
        </button>
      </td>
    </motion.tr>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [filter, setFilter]                 = useState('all');
  const [searchTerm, setSearchTerm]         = useState('');
  const [dateRange, setDateRange]           = useState({ from: '', to: '' });
  const [showFilters, setShowFilters]       = useState(false);
  const [selectedTx, setSelectedTx]         = useState(null);
  const [showReceipt, setShowReceipt]       = useState(false);
  const [pagination, setPagination]         = useState({ page: 1, total: 0, pages: 1 });
  const [stats, setStats]                   = useState({ totalCredits: 0, totalDebits: 0, count: 0 });

  useEffect(() => { fetchTransactions(); }, [filter, pagination.page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 15 };
      if (filter !== 'all') params.type = filter;
      const res = await api.get('/transactions', { params });
      const rd = res.data;
      const list = Array.isArray(rd?.data) ? rd.data : Array.isArray(rd) ? rd : [];
      setTransactions(list);
      setPagination({ page: rd?.page ?? pagination.page, total: rd?.total ?? 0, pages: rd?.pages ?? 1 });

      // Compute stats from current page
      let tc = 0, td = 0;
      list.forEach(t => {
        if (t.status === 'successful') {
          if (t.type === 'credit') tc += t.amount;
          else td += t.amount;
        }
      });
      setStats({ totalCredits: tc, totalDebits: td, count: list.length });
    } catch (e) {
      console.error('Failed to fetch transactions', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter(tx => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      tx.description?.toLowerCase().includes(q) ||
      tx.recipientName?.toLowerCase().includes(q) ||
      tx.senderName?.toLowerCase().includes(q) ||
      tx.reference?.toLowerCase().includes(q);
    const txDate = new Date(tx.createdAt);
    const matchFrom = !dateRange.from || txDate >= new Date(dateRange.from);
    const matchTo   = !dateRange.to   || txDate <= new Date(dateRange.to + 'T23:59:59');
    return matchSearch && matchFrom && matchTo;
  });

  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Type', 'Amount (₦)', 'Status', 'Reference'];
    const rows = filtered.map(t => [
      formatDateTime(t.createdAt),
      getTxLabel(t).replace(/,/g, ' '),
      t.type,
      t.amount,
      t.status,
      t.reference || '',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `vaultix-transactions-${new Date().toISOString().slice(0,10)}.csv`,
    });
    a.click();
  };

  const clearFilters = () => { setSearchTerm(''); setDateRange({ from: '', to: '' }); setFilter('all'); };
  const hasActiveFilters = filter !== 'all' || searchTerm || dateRange.from || dateRange.to;

  const filterBtns = [
    { id: 'all',    label: 'All',     icon: FaExchangeAlt },
    { id: 'credit', label: 'Credits', icon: FaArrowDown },
    { id: 'debit',  label: 'Debits',  icon: FaArrowUp },
  ];

  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Transactions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Your complete payment history
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm transition-all"
        >
          <FaDownload className="text-xs text-indigo-500" />
          Export CSV
        </button>
      </motion.div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon={FaChartLine}  label="Page Total In"  value={formatCurrency(stats.totalCredits)} trend="Credits this page" color="bg-emerald-500" delay={0} />
        <StatCard icon={FaWallet}     label="Page Total Out" value={formatCurrency(stats.totalDebits)}  trend="Debits this page"  color="bg-red-500"     delay={0.05} />
        <StatCard icon={FaExchangeAlt} label="Transactions"  value={pagination.total || filtered.length} trend={`Showing ${filtered.length}`} color="bg-indigo-500" delay={0.1} />
      </div>

      {/* ── Filter + Search Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row gap-3 p-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, description, reference…"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white placeholder-gray-400 transition-all"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 items-center">
            {filterBtns.map(btn => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  filter === btn.id
                    ? btn.id === 'credit'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/40'
                      : btn.id === 'debit'
                      ? 'bg-red-500 text-white shadow-md shadow-red-200 dark:shadow-red-900/40'
                      : 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/40'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <btn.icon className="text-[10px]" />
                {btn.label}
              </button>
            ))}

            {/* Date filter toggle */}
            <button
              onClick={() => setShowFilters(p => !p)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                showFilters || dateRange.from || dateRange.to
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <FaCalendarAlt className="text-[10px]" />
              Date
            </button>

            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <FaTimes className="text-[10px]" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Date range row */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-0 flex flex-col sm:flex-row gap-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">From</label>
                  <input type="date" value={dateRange.from}
                    onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">To</label>
                  <input type="date" value={dateRange.to}
                    onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Transactions Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-3 border-indigo-100 dark:border-indigo-900/50" />
              <div className="absolute inset-0 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin" style={{ borderWidth: 3 }} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading transactions…</p>
          </div>

        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
              <FaInbox className="text-gray-400 text-2xl" />
            </div>
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No transactions found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
              {hasActiveFilters ? 'Try clearing your filters to see more results.' : 'Your transactions will appear here once you start sending or receiving money.'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-1 text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Clear filters
              </button>
            )}
          </div>

        ) : (
          <>
            {/* Table header */}
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                {filtered.length} {filtered.length === 1 ? 'transaction' : 'transactions'}
              </p>
              {hasActiveFilters && (
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-semibold">
                  Filtered
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/70 dark:bg-gray-700/30">
                    <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                      Transaction
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest hidden sm:table-cell">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest hidden md:table-cell">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest hidden lg:table-cell">
                      Status
                    </th>
                    <th className="px-4 py-3 w-12" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx, i) => (
                    <TxRow key={tx._id || i} tx={tx} index={i} onReceipt={t => { setSelectedTx(t); setShowReceipt(true); }} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Page <span className="font-semibold text-gray-700 dark:text-gray-300">{pagination.page}</span> of{' '}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{pagination.pages}</span>
                  {pagination.total > 0 && (
                    <> &nbsp;·&nbsp; <span className="font-semibold text-gray-700 dark:text-gray-300">{pagination.total}</span> total</>
                  )}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <FaChevronLeft className="text-[9px]" /> Prev
                  </button>

                  {/* Page numbers */}
                  <div className="hidden sm:flex gap-1">
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let page;
                      if (pagination.pages <= 5) page = i + 1;
                      else if (pagination.page <= 3) page = i + 1;
                      else if (pagination.page >= pagination.pages - 2) page = pagination.pages - 4 + i;
                      else page = pagination.page - 2 + i;
                      return (
                        <button key={page}
                          onClick={() => setPagination(p => ({ ...p, page }))}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                            page === pagination.page
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}>
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    Next <FaChevronRight className="text-[9px]" />
                  </button>
                </div>
              </div>
            )}
          </>
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
    </div>
  );
};

export default Transactions;