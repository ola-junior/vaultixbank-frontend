import React from 'react';
import { FaDownload, FaTimes, FaCheckCircle, FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const TransactionReceipt = ({ transaction, user, onClose }) => {
  const handleDownload = () => {
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Vaultix Receipt - ${transaction.reference || transaction._id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .receipt { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 20px; }
          .logo { font-size: 28px; font-weight: bold; color: #4f46e5; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-top: 10px; }
          .status.success { background: #10b981; color: white; }
          .amount { font-size: 36px; font-weight: bold; text-align: center; margin: 20px 0; }
          .credit { color: #10b981; }
          .debit { color: #ef4444; }
          .details { margin: 20px 0; }
          .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .label { color: #6b7280; }
          .value { font-weight: 600; color: #1f2937; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="logo">🏦 Vaultix</div>
            <div class="status success">${transaction.status?.toUpperCase() || 'SUCCESSFUL'}</div>
          </div>
          
          <div class="amount ${transaction.type === 'credit' ? 'credit' : 'debit'}">
            ${transaction.type === 'credit' ? '+' : '-'}${formatCurrency(transaction.amount)}
          </div>
          
          <div class="details">
            <div class="row">
              <span class="label">Transaction ID</span>
              <span class="value">${transaction.reference || transaction._id}</span>
            </div>
            <div class="row">
              <span class="label">Date & Time</span>
              <span class="value">${formatDateTime(transaction.createdAt)}</span>
            </div>
            <div class="row">
              <span class="label">Type</span>
              <span class="value">${transaction.type?.toUpperCase()}</span>
            </div>
            ${transaction.recipientName ? `
            <div class="row">
              <span class="label">Recipient</span>
              <span class="value">${transaction.recipientName}</span>
            </div>
            ` : ''}
            ${transaction.senderName ? `
            <div class="row">
              <span class="label">Sender</span>
              <span class="value">${transaction.senderName}</span>
            </div>
            ` : ''}
            ${transaction.description ? `
            <div class="row">
              <span class="label">Description</span>
              <span class="value">${transaction.description}</span>
            </div>
            ` : ''}
            <div class="row">
              <span class="label">Balance After</span>
              <span class="value">${formatCurrency(transaction.balanceAfter)}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for banking with Vaultix</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vaultix-Receipt-${transaction.reference || transaction._id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const isCredit = transaction.type === 'credit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <FaTimes />
        </button>

        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isCredit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {isCredit ? <FaArrowDown className="text-2xl" /> : <FaArrowUp className="text-2xl" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transaction Receipt
          </h2>
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              <FaCheckCircle className="mr-1" />
              {transaction.status?.toUpperCase() || 'SUCCESSFUL'}
            </span>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className={`text-3xl font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
            {isCredit ? '+' : '-'}{formatCurrency(transaction.amount)}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Transaction ID</span>
            <span className="font-mono text-sm text-gray-900 dark:text-white">
              {transaction.reference?.slice(0, 12) || transaction._id?.slice(0, 12)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Date & Time</span>
            <span className="text-gray-900 dark:text-white">
              {formatDateTime(transaction.createdAt)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Type</span>
            <span className="text-gray-900 dark:text-white uppercase">
              {transaction.type}
            </span>
          </div>
          {transaction.recipientName && (
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Recipient</span>
              <span className="text-gray-900 dark:text-white">
                {transaction.recipientName}
              </span>
            </div>
          )}
          {transaction.senderName && (
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Sender</span>
              <span className="text-gray-900 dark:text-white">
                {transaction.senderName}
              </span>
            </div>
          )}
          {transaction.description && (
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Description</span>
              <span className="text-gray-900 dark:text-white">
                {transaction.description}
              </span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Balance After</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(transaction.balanceAfter)}
            </span>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center"
        >
          <FaDownload className="mr-2" />
          Download Receipt
        </button>
      </div>
    </div>
  );
};

export default TransactionReceipt;