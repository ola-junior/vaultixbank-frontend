import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { formatCurrency } from '../../utils/formatters';
import {
  FaCheckCircle, FaTimes, FaShareAlt, FaCopy,
  FaShieldAlt, FaReceipt, FaTimesCircle, FaExclamationCircle,
  FaSpinner, FaDownload
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// Helpers
const pad = (n) => String(n).padStart(2, '0');

const formatReceiptDate = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${pad(d.getDate())}, ${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const maskAccount = (acc) => {
  if (!acc) return '—';
  const s = String(acc);
  return s.length > 6 ? s.slice(0, 3) + '••••' + s.slice(-3) : s;
};

const genRef = () =>
  'VTX' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();

const getTypeLabel = (type, subType) => {
  if (subType === 'deposit') return 'Deposit';
  if (subType === 'withdraw') return 'Withdrawal';
  if (type === 'credit') return 'Money Received';
  return 'Transfer Sent';
};

const STATUS_CFG = {
  successful: { Icon: FaCheckCircle, label: 'Successful', color: '#10b981', bgLight: 'rgba(16,185,129,0.08)', bgDark: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)' },
  pending: { Icon: FaExclamationCircle, label: 'Pending', color: '#f59e0b', bgLight: 'rgba(245,158,11,0.08)', bgDark: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)' },
  failed: { Icon: FaTimesCircle, label: 'Failed', color: '#ef4444', bgLight: 'rgba(239,68,68,0.08)', bgDark: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.25)' },
};

// Detect dark mode
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);
  
  return isDark;
};

const DashedDivider = ({ isDark }) => (
  <div className="relative my-0 -mx-6 h-6 flex-shrink-0">
    <svg width="100%" height="24" className="block">
      <line x1="20" y1="12" x2="calc(100% - 20)" y2="12"
        stroke={isDark ? "rgba(148,163,184,0.3)" : "rgba(100,116,139,0.2)"}
        strokeWidth="1.5" strokeDasharray="6 5" />
    </svg>
    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-r-full ${isDark ? 'bg-[#0f172a]' : 'bg-white'}`} />
    <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-l-full ${isDark ? 'bg-[#0f172a]' : 'bg-white'}`} />
  </div>
);

const Row = ({ label, value, mono = false, isDark }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-start gap-3 py-1.5">
      <span className={`text-[11px] uppercase tracking-wider font-medium flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
        {label}
      </span>
      <span className={`text-sm font-semibold text-right break-all max-w-[65%] leading-relaxed ${isDark ? 'text-slate-200' : 'text-gray-800'}`}
        style={{ fontFamily: mono ? "'JetBrains Mono','Courier New',monospace" : 'inherit' }}>
        {value}
      </span>
    </div>
  );
};

const Section = ({ title, children, isDark }) => (
  <div className="mb-3">
    <p className={`text-[10px] font-bold uppercase tracking-[0.12em] mb-1.5 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
      {title}
    </p>
    <div className={`rounded-xl p-3 border ${isDark ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-gray-50 border-gray-200'}`}>
      {children}
    </div>
  </div>
);

const TransactionReceipt = ({ transaction, user, onClose }) => {
  const [visible, setVisible] = useState(true);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [sharing, setSharing] = useState(false);
  const receiptRef = useRef(null);
  const isDark = useDarkMode();

  const status = transaction?.status || 'successful';
  const cfg = STATUS_CFG[status] || STATUS_CFG.successful;
  const { Icon: StatusIcon } = cfg;
  const bgColor = isDark ? cfg.bgDark : cfg.bgLight;

  const txRef = transaction?.reference || transaction?.transactionId || transaction?._id || genRef();
  const amount = transaction?.amount || 0;
  const createdAt = transaction?.createdAt || new Date().toISOString();
  const subType = transaction?.subType;
  const typeLabel = getTypeLabel(transaction?.type, subType);
  const isCredit = transaction?.type === 'credit';

  const recipientName = transaction?.recipientName;
  const recipientAccount = transaction?.recipientAccount;
  const recipientBank = transaction?.recipientBank;
  const senderName = transaction?.senderName || user?.name;
  const senderAccount = maskAccount(transaction?.senderAccount || user?.accountNumber);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 260);
  };

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(txRef);
      setCopiedRef(true);
      toast.success('Reference copied!');
      setTimeout(() => setCopiedRef(false), 2000);
    } catch { 
      toast.error('Could not copy'); 
    }
  };

  // Copy entire receipt as text
  const copyReceiptAsText = async () => {
    const receiptText = `
═══════════════════════════════════════
           VAULTIX TRANSACTION RECEIPT
═══════════════════════════════════════

Status: ${cfg.label}
Amount: ${isCredit ? '+' : '-'}${formatCurrency(amount)}
Type: ${typeLabel}
Date: ${formatReceiptDate(createdAt)}

${recipientName || recipientAccount ? '─ RECIPIENT ─' : ''}
${recipientName ? `Name: ${recipientName}` : ''}
${recipientAccount ? `Account: ${maskAccount(recipientAccount)}` : ''}
${recipientBank ? `Bank: ${recipientBank}` : ''}

─ SENDER ─
Name: ${senderName}
Account: ${senderAccount}

─ TRANSACTION DETAILS ─
Type: ${typeLabel}
${transaction?.description ? `Note: ${transaction.description}` : ''}
Reference: ${txRef}
Status: ${cfg.label}

═══════════════════════════════════════
Secured by Vaultix · 256-bit SSL Encrypted
═══════════════════════════════════════
    `;

    try {
      await navigator.clipboard.writeText(receiptText);
      setCopiedReceipt(true);
      toast.success('Receipt copied to clipboard!');
      setTimeout(() => setCopiedReceipt(false), 2000);
    } catch {
      toast.error('Could not copy receipt');
    }
  };

  // Share as Image (like OPay)
  const handleShareAsImage = async () => {
    if (!receiptRef.current) {
      toast.error('Could not capture receipt');
      return;
    }

    setSharing(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `Vaultix-Receipt-${txRef.slice(0, 8)}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Vaultix Transaction Receipt',
          text: `${typeLabel} - ${formatCurrency(amount)}`,
          files: [file]
        });
        toast.success('Receipt shared!');
      } else {
        const link = document.createElement('a');
        link.download = `Vaultix-Receipt-${txRef.slice(0, 8)}.png`;
        link.href = dataUrl;
        link.click();
        toast.success('Receipt downloaded!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
        try {
          const dataUrl = await toPng(receiptRef.current, {
            quality: 1.0,
            pixelRatio: 2,
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
          });
          const link = document.createElement('a');
          link.download = `Vaultix-Receipt-${txRef.slice(0, 8)}.png`;
          link.href = dataUrl;
          link.click();
          toast.success('Receipt downloaded!');
        } catch (e) {
          toast.error('Could not save receipt');
        }
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[9998] bg-black/50 dark:bg-[#020617]/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-[420px] max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl relative"
              style={{ scrollbarWidth: 'none' }}
            >
              {/* Receipt Content (captured for sharing) */}
              <div
                ref={receiptRef}
                className={`relative ${isDark ? 'bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#0f172a]' : 'bg-white'}`}
                style={{ borderRadius: 24 }}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-0.5 rounded-full pointer-events-none"
                  style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}70, transparent)` }} />

                {/* Header */}
                <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <FaReceipt className="text-white text-sm" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Vaultix</p>
                      <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Transaction Receipt</p>
                    </div>
                  </div>
                  <button onClick={close} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-white/10 border-white/20 text-slate-400 hover:bg-red-500/20 hover:text-red-400' : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-red-100 hover:text-red-500'}`}>
                    <FaTimes className="text-xs" />
                  </button>
                </div>

                {/* Amount + Status */}
                <div className="relative px-6 pt-7 pb-5 text-center">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-56 pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${cfg.color}10 0%, transparent 70%)` }} />

                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.12 }}
                    className="inline-flex items-center gap-1.5 mb-4 px-4 py-1.5 rounded-full"
                    style={{ background: bgColor, border: `1px solid ${cfg.border}` }}
                  >
                    <StatusIcon style={{ color: cfg.color, fontSize: 12 }} />
                    <span style={{ color: cfg.color, fontSize: 12, fontWeight: 600 }}>{cfg.label}</span>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                    className={`text-4xl font-black tracking-tight mb-2 ${isDark ? 'text-slate-50' : 'text-gray-900'}`}
                  >
                    {isCredit ? '+' : '-'}{formatCurrency(amount)}
                  </motion.p>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.24 }}>
                    <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-500' : 'text-gray-600'}`}>{typeLabel}</p>
                    <p className={`text-xs tracking-wide ${isDark ? 'text-slate-600' : 'text-gray-500'}`}>{formatReceiptDate(createdAt)}</p>
                  </motion.div>
                </div>

                <DashedDivider isDark={isDark} />

                {/* Details */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
                  className="px-5 py-3"
                >
                  {/* Recipient */}
                  {(recipientName || recipientAccount || recipientBank) && (
                    <Section title="Recipient" isDark={isDark}>
                      {recipientName && <Row label="Name" value={recipientName} isDark={isDark} />}
                      {recipientAccount && <Row label="Account" value={maskAccount(recipientAccount)} mono isDark={isDark} />}
                      {recipientBank && <Row label="Bank" value={recipientBank} isDark={isDark} />}
                    </Section>
                  )}

                  {/* Sender */}
                  {senderName && (
                    <Section title="Sender" isDark={isDark}>
                      <Row label="Name" value={senderName} isDark={isDark} />
                      {senderAccount && <Row label="Account" value={senderAccount} mono isDark={isDark} />}
                    </Section>
                  )}

                  {/* Transaction meta - BALANCE REMOVED */}
                  <Section title="Transaction Details" isDark={isDark}>
                    <Row label="Type" value={typeLabel} isDark={isDark} />
                    {transaction?.description && <Row label="Note" value={transaction.description} isDark={isDark} />}
                    
                    {/* ✅ BALANCE REMOVED - No longer shown on receipt */}

                    {/* Reference row */}
                    <div className="flex justify-between items-center py-1.5">
                      <span className={`text-[11px] uppercase tracking-wider font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        Reference
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-mono font-medium tracking-wider ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                          {txRef.length > 16 ? txRef.slice(0, 16) + '…' : txRef}
                        </span>
                        <button onClick={copyReference} className="px-2 py-1 rounded-md text-[10px] font-semibold transition-all"
                          style={{
                            background: copiedRef ? 'rgba(16,185,129,0.15)' : isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
                            border: `1px solid ${copiedRef ? 'rgba(16,185,129,0.35)' : 'rgba(99,102,241,0.35)'}`,
                            color: copiedRef ? '#10b981' : '#6366f1',
                          }}>
                          {copiedRef ? '✓ Copied' : <><FaCopy className="text-[9px] mr-0.5" /> Copy</>}
                        </button>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex justify-between items-center py-1.5">
                      <span className={`text-[11px] uppercase tracking-wider font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Status</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{ background: bgColor, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                        <StatusIcon className="text-[9px]" />
                        {cfg.label}
                      </span>
                    </div>
                  </Section>
                </motion.div>

                <DashedDivider isDark={isDark} />

                {/* Security stamp */}
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.36 }}
                  className="flex items-center justify-center gap-1.5 py-3 px-6"
                >
                  <FaShieldAlt className="text-green-500 text-[11px]" />
                  <p className={`text-[11px] text-center ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                    Secured by <span className="text-indigo-500 dark:text-indigo-400 font-semibold">Vaultix</span> · 256-bit SSL Encrypted
                  </p>
                </motion.div>
              </div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
                className="grid grid-cols-3 gap-2 px-5 pb-6 pt-2 bg-transparent"
              >
                {/* Copy Receipt Button */}
                <button
                  onClick={copyReceiptAsText}
                  className="py-3 rounded-xl font-semibold text-xs flex flex-col items-center justify-center gap-1 transition-all"
                  style={{
                    background: copiedReceipt ? 'rgba(16,185,129,0.15)' : isDark ? 'rgba(148,163,184,0.1)' : 'rgba(148,163,184,0.08)',
                    border: `1px solid ${copiedReceipt ? 'rgba(16,185,129,0.35)' : 'rgba(148,163,184,0.25)'}`,
                    color: copiedReceipt ? '#10b981' : isDark ? '#94a3b8' : '#64748b',
                  }}
                >
                  <FaCopy className="text-xs" />
                  <span>{copiedReceipt ? 'Copied!' : 'Copy'}</span>
                </button>

                {/* Share Image Button */}
                <button
                  onClick={handleShareAsImage}
                  disabled={sharing}
                  className="py-3 rounded-xl font-semibold text-xs flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-60"
                  style={{
                    background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    color: '#6366f1',
                  }}
                >
                  {sharing ? <FaSpinner className="animate-spin text-xs" /> : <FaShareAlt className="text-xs" />}
                  <span>{sharing ? 'Sharing...' : 'Share'}</span>
                </button>

                {/* Done Button */}
                <button
                  onClick={close}
                  className="py-3 rounded-xl font-bold text-xs text-white flex flex-col items-center justify-center gap-1 shadow-lg shadow-indigo-500/30"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  <FaCheckCircle className="text-xs" />
                  <span>Done</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TransactionReceipt;