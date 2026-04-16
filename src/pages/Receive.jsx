import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  FaCopy, FaShareAlt, FaQrcode, FaDownload,
  FaCheckCircle, FaWallet
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

const Receive = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const accountNumber = user?.accountNumber || '0000000000';
  const accountName = user?.name || 'Account Holder';

  // Generate QR code
  React.useEffect(() => {
    const generateQR = async () => {
      try {
        const qrData = JSON.stringify({
          accountNumber,
          name: accountName,
          bank: 'Vaultix Bank'
        });
        const url = await QRCode.toDataURL(qrData);
        setQrCodeUrl(url);
      } catch (err) {
        console.error('QR generation failed:', err);
      }
    };
    generateQR();
  }, [accountNumber, accountName]);

  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      toast.success('Account number copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const shareAccount = async () => {
    const text = `Send money to my Vaultix account:\nAccount Name: ${accountName}\nAccount Number: ${accountNumber}\nBank: Vaultix Bank`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Account Details', text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Account details copied!');
    }
  };

  const downloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = 'vaultix-account-qr.png';
      link.href = qrCodeUrl;
      link.click();
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FaDownload className="text-white text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Receive Money
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Share your account details to receive payments
          </p>
        </div>

        {/* QR Code */}
        {qrCodeUrl && (
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-2xl shadow-md">
              <img src={qrCodeUrl} alt="Account QR" className="w-48 h-48" />
            </div>
          </div>
        )}

        {/* Account Details Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl p-6 mb-6 border border-indigo-100 dark:border-indigo-800">
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Account Name
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {accountName}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Account Number
            </p>
            <p className="text-3xl font-black text-gray-900 dark:text-white font-mono tracking-widest">
              {accountNumber}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Vaultix Bank
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={copyAccountNumber}
            className="flex flex-col items-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${copied ? 'bg-green-500' : 'bg-indigo-500'}`}>
              {copied ? <FaCheckCircle className="text-white" /> : <FaCopy className="text-white" />}
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {copied ? 'Copied!' : 'Copy'}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={shareAccount}
            className="flex flex-col items-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <FaShareAlt className="text-white" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Share</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={downloadQR}
            className="flex flex-col items-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
              <FaQrcode className="text-white" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Save QR</span>
          </motion.button>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-700 dark:text-yellow-400 text-center">
            ⚡ Transfers to this account are instant and free!
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Receive;