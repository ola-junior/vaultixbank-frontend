import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaMobileAlt, FaWifi, FaTv, FaBolt, FaWater,
  FaGraduationCap, FaGlobe, FaArrowRight
} from 'react-icons/fa';
import { MdSportsSoccer } from 'react-icons/md';

const BillsIndex = () => {
  const navigate = useNavigate();

  const categories = [
    { id: 'airtime', label: 'Airtime', icon: FaMobileAlt, gradient: ['#6366f1', '#8b5cf6'], description: 'Buy airtime for any network' },
    { id: 'data', label: 'Data', icon: FaWifi, gradient: ['#3b82f6', '#0ea5e9'], description: 'Purchase data bundles' },
    { id: 'tv', label: 'Cable TV', icon: FaTv, gradient: ['#f59e0b', '#d97706'], description: 'Renew TV subscription' },
    { id: 'electricity', label: 'Electricity', icon: FaBolt, gradient: ['#eab308', '#ca8a04'], description: 'Pay electricity bills' },
    { id: 'water', label: 'Water', icon: FaWater, gradient: ['#06b6d4', '#0284c7'], description: 'Pay water bills' },
    { id: 'education', label: 'Education', icon: FaGraduationCap, gradient: ['#8b5cf6', '#6d28d9'], description: 'Pay exam fees' },
    { id: 'betting', label: 'Betting', icon: MdSportsSoccer, gradient: ['#10b981', '#059669'], description: 'Fund betting account' },
    { id: 'internet', label: 'Internet', icon: FaGlobe, gradient: ['#6366f1', '#4f46e5'], description: 'Pay broadband bills' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Pay Bills
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Select a service to make a payment
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const [c1, c2] = cat.gradient;
          const Icon = cat.icon;
          
          return (
            <motion.button
              key={cat.id}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/bills/${cat.id}`)}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 text-left transition-all group"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ 
                  background: `linear-gradient(135deg, ${c1}, ${c2})`,
                  boxShadow: `0 4px 12px ${c1}40`
                }}
              >
                <Icon className="text-white text-xl" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                {cat.label}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {cat.description}
              </p>
              <div className="flex items-center gap-1 text-sm font-medium"
                style={{ color: c1 }}
              >
                <span>Get Started</span>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Coming Soon Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚀</span>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">More Services Coming Soon!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Insurance, Flights, Shopping, Gaming, and Events payments will be available shortly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillsIndex;