import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaDownload, FaUpload, FaExchangeAlt } from 'react-icons/fa';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      name: 'Send Money',
      icon: FaPaperPlane,
      color: 'bg-blue-500 hover:bg-blue-600',
      path: '/transfer',
      description: 'Transfer to any bank',
    },
    {
      name: 'Deposit',
      icon: FaDownload,
      color: 'bg-green-500 hover:bg-green-600',
      action: 'deposit',
      description: 'Add money to account',
    },
    {
      name: 'Withdraw',
      icon: FaUpload,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: 'withdraw',
      description: 'Take out money',
    },
    {
      name: 'History',
      icon: FaExchangeAlt,
      color: 'bg-purple-500 hover:bg-purple-600',
      path: '/transactions',
      description: 'View transactions',
    },
  ];

  const handleQuickAction = (action) => {
    if (action.path) {
      navigate(action.path);
    } else {
      // Open modal for deposit/withdraw
      navigate('/transfer', { state: { action: action.action } });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleQuickAction(action)}
            className="group relative p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-all duration-200"
          >
            <div className={`w-12 h-12 mx-auto mb-3 rounded-full ${action.color} flex items-center justify-center text-white transition-transform group-hover:scale-110`}>
              <action.icon className="text-xl" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              {action.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {action.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;