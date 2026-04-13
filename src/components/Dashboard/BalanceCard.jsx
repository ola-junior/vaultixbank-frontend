import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const BalanceCard = ({ title, value, icon: Icon, color, change, isBalanceHidden = false }) => {
  // Format the display value
  const displayValue = () => {
    if (isBalanceHidden) {
      return '••••••';
    }
    if (typeof value === 'number') {
      if (title.toLowerCase().includes('balance') || 
          title.toLowerCase().includes('credit') || 
          title.toLowerCase().includes('debit')) {
        return formatCurrency(value);
      }
      return value.toLocaleString();
    }
    return value || '0';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon className="text-white text-lg" />
        </div>
        {change && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            change.startsWith('+') 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {change}
          </span>
        )}
      </div>
      <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {displayValue()}
      </p>
    </div>
  );
};

export default BalanceCard;