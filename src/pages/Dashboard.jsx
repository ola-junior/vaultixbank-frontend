import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ATMCard from '../components/Dashboard/ATMCard';
import BalanceCard from '../components/Dashboard/BalanceCard';
import QuickActions from '../components/Dashboard/QuickActions';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import { 
  FaWallet, FaArrowUp, FaArrowDown, FaExchangeAlt, 
  FaEye, FaEyeSlash, FaSync, FaBell, FaChartLine,
  FaArrowRight, FaShieldAlt
} from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, refreshUser } = useAuth(); // ✅ ADD refreshUser
  const [stats, setStats] = useState({
    totalCredits: 0,
    totalDebits: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');

  const [isBalanceHidden, setIsBalanceHidden] = useState(() => {
    const saved = localStorage.getItem('hideBalance');
    return saved ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('hideBalance', isBalanceHidden.toString());
  }, [isBalanceHidden]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // ✅ Refresh user data when dashboard mounts or becomes visible
  useEffect(() => {
    const refreshUserData = async () => {
      await refreshUser();
    };
    refreshUserData();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // ✅ Refresh user data when tab becomes visible
        await refreshUser();
        setRefreshKey(prev => prev + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const summaryRes = await api.get('/transactions/summary');
      if (summaryRes.data.success) {
        const d = summaryRes.data.data;
        setStats({
          totalCredits: d.credits || 0,
          totalDebits: d.debits || 0,
          totalTransactions: d.totalTransactions || (d.creditCount || 0) + (d.debitCount || 0),
        });
      } else {
        setStats({ totalCredits: 0, totalDebits: 0, totalTransactions: 0 });
      }
    } catch {
      try {
        const txRes = await api.get('/transactions?limit=100');
        const txs = txRes.data.data || [];
        let credits = 0, debits = 0, cc = 0, dc = 0;
        txs.forEach(t => {
          if (t.status === 'successful') {
            if (t.type === 'credit') { credits += t.amount; cc++; }
            else if (t.type === 'debit') { debits += t.amount; dc++; }
          }
        });
        setStats({ totalCredits: credits, totalDebits: debits, totalTransactions: cc + dc });
      } catch {
        setStats({ totalCredits: 0, totalDebits: 0, totalTransactions: 0 });
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // ✅ Refresh user data first
    await refreshUser();
    setRefreshKey(prev => prev + 1);
  };

  const displayBalance = (balance) => {
    if (isBalanceHidden) return '••••••';
    return formatCurrency(balance);
  };

  const statCards = [
    {
      title: 'Available Balance',
      value: user?.balance || 0,
      icon: FaWallet,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      isBalance: true,
    },
    {
      title: 'Total Credits',
      value: stats.totalCredits,
      icon: FaArrowDown,
      color: 'bg-gradient-to-br from-green-500 to-emerald-500',
      isBalance: false,
    },
    {
      title: 'Total Debits',
      value: stats.totalDebits,
      icon: FaArrowUp,
      color: 'bg-gradient-to-br from-red-500 to-rose-500',
      isBalance: false,
    },
    {
      title: 'Transactions',
      value: stats.totalTransactions,
      icon: FaExchangeAlt,
      color: 'bg-gradient-to-br from-purple-500 to-violet-500',
      isBalance: false,
    },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07 } }),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto">
            <FaShieldAlt className="text-red-500 text-xl" />
          </div>
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Welcome Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-3xl p-6 md:p-8 text-white shadow-xl"
      >
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full blur-xl" />
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          {/* Left: greeting + balance */}
          <div>
            <p className="text-white/70 text-sm font-medium mb-1">{greeting} 👋</p>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              {user?.name?.split(' ')[0] || 'Welcome back'}!
            </h1>

            {/* Balance pill - ✅ Now updates automatically when user.balance changes */}
            <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20">
              <div>
                <p className="text-white/60 text-xs mb-0.5">Available Balance</p>
                <p className="text-2xl md:text-3xl font-bold tracking-tight">
                  {displayBalance(user?.balance || 0)}
                </p>
              </div>
              <button
                onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                className="ml-1 p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors"
                aria-label={isBalanceHidden ? 'Show balance' : 'Hide balance'}
              >
                {isBalanceHidden
                  ? <FaEye className="text-white text-base" />
                  : <FaEyeSlash className="text-white text-base" />}
              </button>
            </div>
          </div>

          {/* Right: quick info + refresh */}
          <div className="flex flex-col items-start sm:items-end gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
            >
              <FaSync className={`text-xs ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <FaShieldAlt className="text-white/40 text-xs" />
              <span>Account #{user?.accountNumber ? `****${user.accountNumber.slice(-4)}` : '----'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/60 text-xs font-medium">All systems active</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── ATM Card ── */}
      <motion.div
        custom={1}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <ATMCard user={user} />
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            custom={index + 2}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <BalanceCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              change={stat.change}
              isBalanceHidden={stat.isBalance ? isBalanceHidden : false}
            />
          </motion.div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <motion.div
        custom={6}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <QuickActions />
      </motion.div>

      {/* ── Recent Transactions ── */}
      <motion.div
        custom={7}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <RecentTransactions refreshTrigger={refreshKey} />
      </motion.div>

      {/* Hidden refresh trigger */}
      <button
        onClick={handleRefresh}
        className="hidden"
        id="refresh-dashboard"
      >
        Refresh
      </button>
    </div>
  );
};

export default Dashboard;