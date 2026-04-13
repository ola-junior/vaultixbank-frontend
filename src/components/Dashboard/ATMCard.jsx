import React, { useState } from 'react';
import { FaWifi, FaCircle, FaCopy, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ATMCard = ({ user }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showFullCardNumber, setShowFullCardNumber] = useState(false);
  
  // Generate card number from account number
  const generateCardNumber = () => {
    const accNum = user?.accountNumber || '0000000000000000';
    if (accNum.length === 16) {
      return accNum;
    }
    return accNum.padEnd(16, '0');
  };
  
  const rawCardNumber = generateCardNumber();
  
  // Format card number for display (masked or full)
  const formatCardDisplay = () => {
    if (showFullCardNumber) {
      return `${rawCardNumber.slice(0, 4)} ${rawCardNumber.slice(4, 8)} ${rawCardNumber.slice(8, 12)} ${rawCardNumber.slice(12, 16)}`;
    }
    // Masked: show first 4 and last 4, mask middle 8
    return `${rawCardNumber.slice(0, 4)} •••• •••• ${rawCardNumber.slice(-4)}`;
  };
  
  const cardNumber = formatCardDisplay();
  
  // Generate expiry date (3 years from now)
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 3);
  const expiry = `${expiryDate.getMonth() + 1}/${expiryDate.getFullYear().toString().slice(-2)}`;

  // Format account number for display (masked)
  const formatAccountNumber = (accNum) => {
    if (!accNum) return '•••• •••• ••';
    const num = accNum.replace(/\s/g, '');
    if (num.length <= 10) {
      return num.slice(0, 4) + ' •••• •••• ' + num.slice(-2);
    }
    return `${num.slice(0, 4)} •••• •••• ${num.slice(-4)}`;
  };

  // Copy account number to clipboard
  const copyAccountNumber = async () => {
    if (!user?.accountNumber) return;
    
    try {
      await navigator.clipboard.writeText(user.accountNumber);
      toast.success('Account number copied!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="w-full">
      {/* Card Container - Centered on mobile, left-aligned on desktop */}
      <div className="flex justify-center lg:justify-start">
        <div
          className={`relative w-full max-w-[400px] transform transition-all duration-500 ${
            isHovered ? 'scale-[1.02] -rotate-0.5' : 'scale-100'
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Card Background with Gradient */}
          <div className="relative h-52 sm:h-56 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl shadow-xl overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white rounded-full"></div>
            </div>
            
            {/* Glow Effect */}
            <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
              isHovered ? 'shadow-[0_0_30px_rgba(79,70,229,0.5)]' : ''
            }`}></div>
            
            {/* Card Content */}
            <div className="relative h-full p-5 sm:p-6 flex flex-col justify-between text-white">
              {/* Top Section */}
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <FaWifi className="text-xl sm:text-2xl transform rotate-90" />
                  <span className="text-xs sm:text-sm font-semibold tracking-wider">Vaultix</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaCircle className="text-[10px] sm:text-xs text-yellow-400" />
                  <FaCircle className="text-[10px] sm:text-xs text-red-400" />
                </div>
              </div>
              
              {/* Chip and Card Number */}
              <div className="space-y-3 sm:space-y-4">
                {/* Chip */}
                <div className="w-10 h-8 sm:w-12 sm:h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md opacity-80 shadow-inner"></div>
                
                {/* Card Number with Eye Toggle */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="text-lg sm:text-xl md:text-2xl font-mono tracking-wider cursor-pointer"
                      onClick={() => setShowFullCardNumber(!showFullCardNumber)}
                    >
                      {cardNumber}
                    </div>
                    <button
                      onClick={() => setShowFullCardNumber(!showFullCardNumber)}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                      title={showFullCardNumber ? "Hide card number" : "Reveal card number"}
                    >
                      {showFullCardNumber ? (
                        <FaEyeSlash className="text-white/70 text-xs" />
                      ) : (
                        <FaEye className="text-white/70 text-xs" />
                      )}
                    </button>
                  </div>
                  <p className="text-white/50 text-[9px] sm:text-[10px]">
                    {showFullCardNumber ? "Card number visible" : "Click to reveal"}
                  </p>
                </div>
              </div>
              
              {/* Bottom Section */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] sm:text-xs opacity-70 mb-0.5">Card Holder</p>
                  <p className="font-semibold text-sm sm:text-base uppercase tracking-wider truncate max-w-[120px] sm:max-w-[150px]">
                    {user?.name || 'JOHN DOE'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] sm:text-xs opacity-70 mb-0.5">Expires</p>
                  <p className="font-semibold text-sm sm:text-base">{expiry}</p>
                </div>
              </div>
            </div>
            
            {/* Shine Effect on Hover */}
            <div 
              className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-all duration-700 ${
                isHovered ? 'opacity-15' : ''
              }`}
              style={{
                transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
              }}
            ></div>
          </div>
          
          {/* Card Details Below */}
          <div className="mt-3 sm:mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">Account Number</p>
                <div className="flex items-center justify-between gap-1">
                  <p className="font-mono font-semibold text-gray-900 dark:text-white text-sm sm:text-base tracking-wider">
                    {user?.accountNumber ? formatAccountNumber(user.accountNumber) : '•••• •••• ••'}
                  </p>
                  {user?.accountNumber && (
                    <button
                      onClick={copyAccountNumber}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                      title="Copy account number"
                    >
                      <FaCopy className="text-xs sm:text-sm" />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">Bank</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                  Vaultix Bank
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Card Type</p>
                <p className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                  Platinum Debit
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-6 h-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded"></span>
                <span className="text-[10px] text-gray-400">Contactless</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATMCard;