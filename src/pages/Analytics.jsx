import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { 
  FaChartLine, 
  FaChartBar, 
  FaChartPie, 
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaDownload,
  FaFilter,
  FaWallet,
  FaExchangeAlt,
  FaMoneyBillWave
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year
  const [stats, setStats] = useState({
    totalCredits: 0,
    totalDebits: 0,
    transactionCount: 0,
    averageTransaction: 0,
    largestTransaction: 0,
    dailyTransactions: [],
    categoryBreakdown: [],
    weeklyTrend: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all transactions
      const response = await api.get('/transactions?limit=1000');
      const transactions = response.data.data || [];
      
      // Calculate stats based on time range
      const filteredTransactions = filterByTimeRange(transactions, timeRange);
      const analytics = calculateAnalytics(filteredTransactions);
      
      setStats(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const filterByTimeRange = (transactions, range) => {
    const now = new Date();
    const cutoff = new Date();
    
    switch (range) {
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoff.setMonth(now.getMonth() - 1);
    }
    
    return transactions.filter(t => new Date(t.createdAt) >= cutoff);
  };

  const calculateAnalytics = (transactions) => {
    let totalCredits = 0;
    let totalDebits = 0;
    let creditCount = 0;
    let debitCount = 0;
    let largest = 0;
    
    // Daily aggregation
    const dailyMap = new Map();
    const categoryMap = new Map();
    
    transactions.forEach(t => {
      if (t.status !== 'successful') return;
      
      const date = new Date(t.createdAt).toLocaleDateString('en-NG', { weekday: 'short' });
      
      if (t.type === 'credit') {
        totalCredits += t.amount;
        creditCount++;
        dailyMap.set(date, (dailyMap.get(date) || 0) + t.amount);
      } else {
        totalDebits += t.amount;
        debitCount++;
        dailyMap.set(date, (dailyMap.get(date) || 0) - t.amount);
      }
      
      // Track largest transaction
      if (t.amount > largest) {
        largest = t.amount;
      }
      
      // Category breakdown
      const category = t.description?.includes('Transfer') ? 'Transfers' : 
                      t.description?.includes('Deposit') ? 'Deposits' :
                      t.description?.includes('Withdrawal') ? 'Withdrawals' : 'Other';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    
    const totalTransactions = creditCount + debitCount;
    const averageTransaction = totalTransactions > 0 
      ? (totalCredits + totalDebits) / totalTransactions 
      : 0;
    
    return {
      totalCredits,
      totalDebits,
      transactionCount: totalTransactions,
      averageTransaction,
      largestTransaction: largest,
      dailyTransactions: Array.from(dailyMap.entries()).map(([day, amount]) => ({ day, amount })),
      categoryBreakdown: Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })),
      weeklyTrend: transactions.slice(0, 7).reverse()
    };
  };

  const handleExport = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Credits', formatCurrency(stats.totalCredits)],
      ['Total Debits', formatCurrency(stats.totalDebits)],
      ['Total Transactions', stats.transactionCount],
      ['Average Transaction', formatCurrency(stats.averageTransaction)],
      ['Largest Transaction', formatCurrency(stats.largestTransaction)],
      ['Time Range', timeRange],
      ['Generated', new Date().toLocaleString()]
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaultix-analytics-${timeRange}-${Date.now()}.csv`;
    a.click();
    
    toast.success('Analytics exported successfully!');
  };

  // Chart data
  const lineChartData = {
    labels: stats.dailyTransactions.map(d => d.day).slice(-7),
    datasets: [
      {
        label: 'Net Flow',
        data: stats.dailyTransactions.map(d => d.amount).slice(-7),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const barChartData = {
    labels: ['Credits', 'Debits'],
    datasets: [
      {
        label: 'Amount (₦)',
        data: [stats.totalCredits, stats.totalDebits],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderRadius: 8
      }
    ]
  };

  const doughnutData = {
    labels: stats.categoryBreakdown.map(c => c.name),
    datasets: [
      {
        data: stats.categoryBreakdown.map(c => c.value),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => '₦' + value.toLocaleString()
        }
      }
    }
  };

  const statCards = [
    {
      title: 'Total Credits',
      value: formatCurrency(stats.totalCredits),
      icon: FaArrowDown,
      color: 'from-green-500 to-emerald-500',
      change: null
    },
    {
      title: 'Total Debits',
      value: formatCurrency(stats.totalDebits),
      icon: FaArrowUp,
      color: 'from-red-500 to-rose-500',
      change: null
    },
    {
      title: 'Total Transactions',
      value: stats.transactionCount,
      icon: FaExchangeAlt,
      color: 'from-blue-500 to-cyan-500',
      change: null
    },
    {
      title: 'Average Transaction',
      value: formatCurrency(stats.averageTransaction),
      icon: FaChartBar,
      color: 'from-purple-500 to-violet-500',
      change: null
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Financial Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track your spending and income patterns
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  timeRange === range
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Export Button */}
          <button
            onClick={handleExport}
            className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaDownload />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="text-white text-lg" />
              </div>
            </div>
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line Chart - Spending Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-indigo-500" />
            Spending Trend
          </h3>
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Bar Chart - Credits vs Debits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaChartBar className="text-indigo-500" />
            Income vs Expenses
          </h3>
          <div className="h-64">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Doughnut Chart - Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-2"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaChartPie className="text-indigo-500" />
            Transaction Categories
          </h3>
          <div className="h-64">
            <Doughnut 
              data={doughnutData} 
              options={{
                ...chartOptions,
                plugins: {
                  legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                      color: document.documentElement.classList.contains('dark') ? '#fff' : '#1f2937'
                    }
                  }
                }
              }} 
            />
          </div>
        </motion.div>
      </div>

      {/* Quick Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white"
      >
        <h3 className="text-lg font-bold mb-3">💡 Quick Insights</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-white/70 text-sm">Net Flow</p>
            <p className={`text-2xl font-bold ${stats.totalCredits - stats.totalDebits >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {formatCurrency(stats.totalCredits - stats.totalDebits)}
            </p>
          </div>
          <div>
            <p className="text-white/70 text-sm">Largest Transaction</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.largestTransaction)}</p>
          </div>
          <div>
            <p className="text-white/70 text-sm">Savings Rate</p>
            <p className="text-2xl font-bold">
              {stats.totalCredits > 0 
                ? Math.round((1 - stats.totalDebits / stats.totalCredits) * 100) 
                : 0}%
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;