import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ATMCard from '../components/Dashboard/ATMCard';
import BalanceCard from '../components/Dashboard/BalanceCard';
import QuickActions from '../components/Dashboard/QuickActions';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import { FaWallet, FaArrowUp, FaArrowDown, FaExchangeAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCredits: 0,
    totalDebits: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // ✅ Balance privacy toggle - default to hidden (true = hidden)
  const [isBalanceHidden, setIsBalanceHidden] = useState(() => {
    const saved = localStorage.getItem('hideBalance');
    return saved ? saved === 'true' : true; // Default to hidden for privacy
  });

  // Save preference to localStorage
  useEffect(() => {
    localStorage.setItem('hideBalance', isBalanceHidden.toString());
  }, [isBalanceHidden]);

  // Refresh when component mounts or when navigating back
  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]);

  // Listen for visibility change (when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setRefreshKey(prev => prev + 1);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Also refresh when component gains focus (react-router navigation)
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching dashboard data...');
      
      // Fetch summary
      const summaryRes = await api.get('/transactions/summary');
      
      console.log('Summary response:', summaryRes.data);
      
      if (summaryRes.data.success) {
        const summaryData = summaryRes.data.data;
        console.log('Summary data received:', summaryData);
        
        setStats({
          totalCredits: summaryData.credits || 0,
          totalDebits: summaryData.debits || 0,
          totalTransactions: summaryData.totalTransactions || 
                            (summaryData.creditCount || 0) + (summaryData.debitCount || 0),
        });
      } else {
        console.log('Summary API returned success: false');
        setStats({
          totalCredits: 0,
          totalDebits: 0,
          totalTransactions: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Even if summary fails, try to calculate from transactions
      try {
        const transactionsRes = await api.get('/transactions?limit=100');
        const transactions = transactionsRes.data.data || [];
        
        let credits = 0, debits = 0, creditCount = 0, debitCount = 0;
        
        transactions.forEach(t => {
          if (t.status === 'successful') {
            if (t.type === 'credit') {
              credits += t.amount;
              creditCount++;
            } else if (t.type === 'debit') {
              debits += t.amount;
              debitCount++;
            }
          }
        });
        
        setStats({
          totalCredits: credits,
          totalDebits: debits,
          totalTransactions: creditCount + debitCount,
        });
      } catch (secondError) {
        console.error('Fallback calculation also failed:', secondError);
        setStats({
          totalCredits: 0,
          totalDebits: 0,
          totalTransactions: 0,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper function to display balance (hidden or actual)
  const displayBalance = (balance) => {
    if (isBalanceHidden) {
      return '••••••';
    }
    return formatCurrency(balance);
  };

  const statCards = [
    {
      title: 'Available Balance',
      value: user?.balance || 0,
      icon: FaWallet,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      change: null,
      isBalance: true, // ✅ Mark as balance card
    },
    {
      title: 'Total Credits',
      value: stats.totalCredits,
      icon: FaArrowDown,
      color: 'bg-gradient-to-br from-green-500 to-emerald-500',
      change: null,
      isBalance: false,
    },
    {
      title: 'Total Debits',
      value: stats.totalDebits,
      icon: FaArrowUp,
      color: 'bg-gradient-to-br from-red-500 to-rose-500',
      change: null,
      isBalance: false,
    },
    {
      title: 'Transactions',
      value: stats.totalTransactions,
      icon: FaExchangeAlt,
      color: 'bg-gradient-to-br from-purple-500 to-violet-500',
      change: null,
      isBalance: false,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-3xl p-6 md:p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full"></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-white/80">
            Here's your financial overview for today.
          </p>
          
          {/* ✅ Quick Balance Display with Eye Toggle */}
          <div className="mt-4 inline-block bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm text-white/70">Available Balance</p>
                <p className="text-3xl font-bold">
                  {displayBalance(user?.balance || 0)}
                </p>
              </div>
              <button
                onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                aria-label={isBalanceHidden ? "Show balance" : "Hide balance"}
              >
                {isBalanceHidden ? (
                  <FaEye className="text-white text-lg" />
                ) : (
                  <FaEyeSlash className="text-white text-lg" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ATM Card */}
      <div className="mb-6">
        <ATMCard user={user} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <BalanceCard 
            key={index} 
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            change={stat.change}
            isBalanceHidden={stat.isBalance ? isBalanceHidden : false}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Transactions */}
      <RecentTransactions refreshTrigger={refreshKey} />

      {/* Refresh Button */}
      <button
        onClick={() => setRefreshKey(prev => prev + 1)}
        className="hidden"
        id="refresh-dashboard"
      >
        Refresh
      </button>
    </div>
  );
};

export default Dashboard;