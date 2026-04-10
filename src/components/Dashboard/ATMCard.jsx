import React, { useState } from 'react';
import { FaWifi, FaCircle, FaCopy } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ATMCard = ({ user }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate card number from account number
  const generateCardNumber = () => {
    const accNum = user?.accountNumber || '0000000000000000';
    // If account number is 16 digits, use it as card number
    if (accNum.length === 16) {
      return `${accNum.slice(0, 4)} ${accNum.slice(4, 8)} ${accNum.slice(8, 12)} ${accNum.slice(12, 16)}`;
    }
    // If shorter, pad with zeros or use as-is
    const padded = accNum.padEnd(16, '0');
    return `${padded.slice(0, 4)} ${padded.slice(4, 8)} ${padded.slice(8, 12)} ${padded.slice(12, 16)}`;
  };
  
  const cardNumber = generateCardNumber();
  
  // Generate expiry date (3 years from now)
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 3);
  const expiry = `${expiryDate.getMonth() + 1}/${expiryDate.getFullYear().toString().slice(-2)}`;

  // Format account number for display
  const formatAccountNumber = (accNum) => {
    if (!accNum) return '•••• •••• •••• ••••';
    const num = accNum.replace(/\s/g, ''); // Remove any existing spaces
    if (num.length <= 10) {
      // For 10-digit account numbers, show masked version
      return num.slice(0, 4) + ' •••• •••• ' + num.slice(-2);
    } else {
      // For longer account numbers, show formatted version
      return `${num.slice(0, 4)} ${num.slice(4, 8)} ${num.slice(8, 12)} ${num.slice(12, 16)}`;
    }
  };

  // Copy account number to clipboard
  const copyAccountNumber = async () => {
    if (!user?.accountNumber) return;
    
    try {
      await navigator.clipboard.writeText(user.accountNumber);
      toast.success('Account number copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy account number:', error);
      toast.error('Failed to copy account number');
    }
  };

  return (
    <div
      className={`relative w-full max-w-md mx-auto lg:mx-0 transform transition-all duration-500 ${
        isHovered ? 'scale-105 -rotate-1' : 'scale-100'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Background with Gradient */}
      <div className="relative h-56 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl shadow-2xl overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white rounded-full"></div>
        </div>
        
        {/* Glow Effect */}
        <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
          isHovered ? 'animate-glow' : ''
        }`}></div>
        
        {/* Card Content */}
        <div className="relative h-full p-6 flex flex-col justify-between text-white">
          {/* Top Section */}
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <FaWifi className="text-2xl transform rotate-90" />
              <span className="text-sm font-semibold tracking-wider">Vaultix</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaCircle className="text-xs text-yellow-400" />
              <FaCircle className="text-xs text-red-400" />
            </div>
          </div>
          
          {/* Chip and Card Number */}
          <div className="space-y-4">
            {/* Chip */}
            <div className="w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md opacity-80 shadow-inner"></div>
            
            {/* Card Number */}
            <div className="text-xl md:text-2xl font-mono tracking-wider">
              {cardNumber}
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs opacity-80 mb-1">Card Holder</p>
              <p className="font-semibold text-base md:text-lg uppercase tracking-wider">
                {user?.name || 'JOHN DOE'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80 mb-1">Expires</p>
              <p className="font-semibold">{expiry}</p>
            </div>
          </div>
        </div>
        
        {/* Shine Effect on Hover */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-all duration-700 ${
            isHovered ? 'opacity-20' : ''
          }`}
          style={{
            transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
          }}
        ></div>
      </div>
      
      {/* Card Details Below */}
      <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Number</p>
            <div className="flex items-center justify-between">
              <p className="font-mono font-semibold text-gray-900 dark:text-white text-lg tracking-wider">
                {user?.accountNumber ? formatAccountNumber(user.accountNumber) : '•••• •••• ••'}
              </p>
              {user?.accountNumber && (
                <button
                  onClick={copyAccountNumber}
                  className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  title="Copy account number"
                >
                  <FaCopy className="text-sm" />
                </button>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bank</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              Vaultix PLC
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Card Type</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            Platinum Debit Card
          </p>
        </div>
      </div>
    </div>
  );
};

export default ATMCard;