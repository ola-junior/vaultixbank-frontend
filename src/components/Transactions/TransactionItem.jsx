import React from 'react';
import { FaArrowUp, FaArrowDown, FaReceipt, FaCopy } from 'react-icons/fa';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const TransactionItem = ({ transaction, onClick, detailed = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'successful':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Copy account number to clipboard
  const copyAccountNumber = async (accountNumber) => {
    if (!accountNumber) return;
    
    try {
      await navigator.clipboard.writeText(accountNumber);
      toast.success('Account number copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy account number:', error);
      toast.error('Failed to copy account number');
    }
  };

  if (detailed) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-full ${
              transaction.type === 'credit' 
                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {transaction.type === 'credit' ? (
                <FaArrowDown className="text-2xl" />
              ) : (
                <FaArrowUp className="text-2xl" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {transaction.description || 
                  (transaction.type === 'credit' ? 'Money Received' : 'Money Sent')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(transaction.createdAt)}
              </p>
            </div>
          </div>
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
            {transaction.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Transaction Type</p>
            <p className="font-semibold text-gray-900 dark:text-white capitalize">
              {transaction.type}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amount</p>
            <p className={`text-2xl font-bold ${
              transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </p>
          </div>
          {transaction.recipientName && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Recipient</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {transaction.recipientName}
              </p>
              <div className="flex items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                  {transaction.recipientAccount}
                </p>
                <button
                  onClick={() => copyAccountNumber(transaction.recipientAccount)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Copy account number"
                >
                  <FaCopy className="text-xs" />
                </button>
              </div>
            </div>
          )}
          {transaction.senderName && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sender</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {transaction.senderName}
              </p>
              <div className="flex items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                  {transaction.senderAccount}
                </p>
                <button
                  onClick={() => copyAccountNumber(transaction.senderAccount)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Copy account number"
                >
                  <FaCopy className="text-xs" />
                </button>
              </div>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reference</p>
            <p className="font-mono text-sm text-gray-900 dark:text-white">
              {transaction.reference}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Balance After</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(transaction.balanceAfter)}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
            Download Receipt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${
          transaction.type === 'credit' 
            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {transaction.type === 'credit' ? (
            <FaArrowDown className="text-sm" />
          ) : (
            <FaArrowUp className="text-sm" />
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {transaction.description || 
              (transaction.type === 'credit' ? 'Money Received' : 'Money Sent')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(transaction.createdAt)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${
          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
        }`}>
          {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
        </p>
        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
          {transaction.status}
        </span>
      </div>
    </div>
  );
};

export default TransactionItem;