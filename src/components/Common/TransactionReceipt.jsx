import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';
import {
  FaCheckCircle, FaTimes, FaShareAlt, FaCopy,
  FaArrowUp, FaArrowDown, FaExchangeAlt,
  FaShieldAlt, FaReceipt, FaTimesCircle, FaExclamationCircle,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const pad = (n) => String(n).padStart(2, '0');

const formatReceiptDate = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${pad(d.getDate())}, ${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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
  successful: { Icon: FaCheckCircle,     label: 'Successful', color: '#10b981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)' },
  pending:    { Icon: FaExclamationCircle, label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)' },
  failed:     { Icon: FaTimesCircle,     label: 'Failed',     color: '#ef4444', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.25)' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Small UI pieces
// ─────────────────────────────────────────────────────────────────────────────

const DashedDivider = () => (
  <div style={{ position: 'relative', margin: '0 -1.5rem', height: 24, flexShrink: 0 }}>
    <svg width="100%" height="24" style={{ display: 'block' }}>
      <line x1="20" y1="12" x2="calc(100% - 20)" y2="12"
        stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" strokeDasharray="6 5" />
    </svg>
    <div style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)', width:20, height:20, borderRadius:'0 50% 50% 0', background:'var(--cutout-bg)' }} />
    <div style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%)', width:20, height:20, borderRadius:'50% 0 0 50%', background:'var(--cutout-bg)' }} />
  </div>
);

const Row = ({ label, value, mono = false }) => {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, padding:'6px 0' }}>
      <span style={{ fontSize:11, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500, flexShrink:0 }}>
        {label}
      </span>
      <span style={{
        fontSize:12, color:'#e2e8f0', fontWeight:600, textAlign:'right',
        wordBreak:'break-all', maxWidth:'65%', lineHeight:1.4,
        fontFamily: mono ? "'JetBrains Mono','Courier New',monospace" : 'inherit',
      }}>
        {value}
      </span>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div style={{ marginBottom:12 }}>
    <p style={{ fontSize:10, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:6 }}>
      {title}
    </p>
    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(148,163,184,0.08)', borderRadius:12, padding:'8px 12px' }}>
      {children}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const TransactionReceipt = ({ transaction, user, onClose }) => {
  const [visible, setVisible] = useState(true);
  const [copied,  setCopied]  = useState(false);

  const status = transaction?.status || 'successful';
  const cfg = STATUS_CFG[status] || STATUS_CFG.successful;
  const { Icon: StatusIcon } = cfg;

  const txRef     = transaction?.reference || transaction?.transactionId || transaction?._id || genRef();
  const amount    = transaction?.amount || 0;
  const createdAt = transaction?.createdAt || new Date().toISOString();
  const subType   = transaction?.subType;
  const typeLabel = getTypeLabel(transaction?.type, subType);
  const isCredit  = transaction?.type === 'credit';

  const recipientName    = transaction?.recipientName;
  const recipientAccount = transaction?.recipientAccount;
  const recipientBank    = transaction?.recipientBank;
  const senderName       = transaction?.senderName || user?.name;
  const senderAccount    = maskAccount(transaction?.senderAccount || user?.accountNumber);
  const balanceAfter     = transaction?.balanceAfter ?? transaction?.newBalance;

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 260);
  };

  // Close on Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(txRef);
      setCopied(true);
      toast.success('Reference copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error('Could not copy'); }
  };

  const handleShare = async () => {
    const text = [
      'Vaultix Transaction Receipt',
      `Type: ${typeLabel}`,
      `Amount: ${formatCurrency(amount)}`,
      `Status: ${cfg.label}`,
      `Reference: ${txRef}`,
      `Date: ${formatReceiptDate(createdAt)}`,
      recipientName ? `Recipient: ${recipientName}` : '',
    ].filter(Boolean).join('\n');

    if (navigator.share) {
      try { await navigator.share({ title: 'Vaultix Receipt', text }); return; } catch {}
    }
    await navigator.clipboard.writeText(text);
    toast.success('Receipt copied to clipboard!');
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
            style={{
              position:'fixed', inset:0, zIndex:9998,
              background:'rgba(2,6,23,0.82)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
            }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ opacity:0, y:60, scale:0.93 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:40, scale:0.95 }}
            transition={{ type:'spring', stiffness:340, damping:30 }}
            style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16, pointerEvents:'none' }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                '--cutout-bg': '#0f172a',
                pointerEvents:'all',
                width:'100%', maxWidth:420, maxHeight:'92vh', overflowY:'auto',
                background:'linear-gradient(160deg,#0f172a 0%,#111827 60%,#0f172a 100%)',
                borderRadius:24,
                border:'1px solid rgba(148,163,184,0.10)',
                boxShadow:'0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.65), 0 0 100px rgba(99,102,241,0.07)',
                scrollbarWidth:'none',
                position:'relative',
                fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
              {/* Top accent line */}
              <div style={{
                position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
                width:240, height:1,
                background:`linear-gradient(90deg,transparent,${cfg.color}70,transparent)`,
                borderRadius:999, pointerEvents:'none',
              }} />

              {/* ── Header ── */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 20px 14px', borderBottom:'1px solid rgba(148,163,184,0.08)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{
                    width:34, height:34, borderRadius:10,
                    background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow:'0 4px 12px rgba(99,102,241,0.4)',
                  }}>
                    <FaReceipt style={{ color:'#fff', fontSize:14 }} />
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', letterSpacing:'-0.01em', lineHeight:1.1 }}>Vaultix</p>
                    <p style={{ fontSize:10, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.07em' }}>Transaction Receipt</p>
                  </div>
                </div>
                <button onClick={close} style={{
                  width:32, height:32, borderRadius:9, cursor:'pointer',
                  background:'rgba(148,163,184,0.07)', border:'1px solid rgba(148,163,184,0.15)',
                  display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b',
                  transition:'all 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.12)'; e.currentTarget.style.color='#ef4444'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(148,163,184,0.07)'; e.currentTarget.style.color='#64748b'; }}>
                  <FaTimes style={{ fontSize:12 }} />
                </button>
              </div>

              {/* ── Amount + Status ── */}
              <div style={{ padding:'28px 24px 20px', textAlign:'center', position:'relative' }}>
                {/* Glow */}
                <div style={{
                  position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
                  width:220, height:220,
                  background:`radial-gradient(circle,${cfg.color}10 0%,transparent 70%)`,
                  pointerEvents:'none',
                }} />

                {/* Status badge */}
                <motion.div
                  initial={{ scale:0.7, opacity:0 }} animate={{ scale:1, opacity:1 }}
                  transition={{ delay:0.12, type:'spring', stiffness:380, damping:22 }}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:6, marginBottom:16,
                    padding:'5px 14px', borderRadius:999,
                    background:cfg.bg, border:`1px solid ${cfg.border}`,
                  }}
                >
                  <StatusIcon style={{ color:cfg.color, fontSize:12 }} />
                  <span style={{ color:cfg.color, fontSize:12, fontWeight:600, letterSpacing:'0.02em' }}>{cfg.label}</span>
                </motion.div>

                {/* Amount */}
                <motion.p
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18 }}
                  style={{ fontSize:42, fontWeight:800, color:'#f8fafc', letterSpacing:'-0.04em', lineHeight:1, marginBottom:8 }}
                >
                  {isCredit ? '+' : '-'}{formatCurrency(amount)}
                </motion.p>

                {/* Type + date */}
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.24 }}>
                  <p style={{ fontSize:13, color:'#64748b', fontWeight:500, marginBottom:3 }}>{typeLabel}</p>
                  <p style={{ fontSize:11.5, color:'#475569', letterSpacing:'0.02em' }}>{formatReceiptDate(createdAt)}</p>
                </motion.div>
              </div>

              <DashedDivider />

              {/* ── Details ── */}
              <motion.div
                initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.28 }}
                style={{ padding:'14px 22px' }}
              >
                {/* Recipient */}
                {(recipientName || recipientAccount || recipientBank) && (
                  <Section title="Recipient">
                    {recipientName    && <Row label="Name"    value={recipientName} />}
                    {recipientAccount && <Row label="Account" value={maskAccount(recipientAccount)} mono />}
                    {recipientBank    && <Row label="Bank"    value={recipientBank} />}
                  </Section>
                )}

                {/* Sender */}
                {senderName && (
                  <Section title="Sender">
                    <Row label="Name"    value={senderName} />
                    {senderAccount && <Row label="Account" value={senderAccount} mono />}
                  </Section>
                )}

                {/* Transaction meta */}
                <Section title="Transaction Details">
                  <Row label="Type" value={typeLabel} />
                  {transaction?.description && <Row label="Note" value={transaction.description} />}
                  {(balanceAfter !== null && balanceAfter !== undefined) && (
                    <Row label="Balance After" value={formatCurrency(balanceAfter)} />
                  )}

                  {/* Reference row with copy */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0' }}>
                    <span style={{ fontSize:11, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500 }}>
                      Reference
                    </span>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:11, color:'#e2e8f0', fontFamily:"'Courier New',monospace", fontWeight:500, letterSpacing:'0.04em' }}>
                        {txRef.length > 16 ? txRef.slice(0, 16) + '…' : txRef}
                      </span>
                      <button onClick={copyRef} style={{
                        padding:'3px 8px', borderRadius:6, cursor:'pointer', fontSize:10, fontWeight:600,
                        background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
                        border: `1px solid ${copied ? 'rgba(16,185,129,0.35)' : 'rgba(99,102,241,0.35)'}`,
                        color: copied ? '#10b981' : '#a5b4fc', transition:'all 0.18s',
                      }}>
                        {copied ? '✓ Copied' : <><FaCopy style={{ fontSize:9 }} /> Copy</>}
                      </button>
                    </div>
                  </div>

                  {/* Status inline */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0' }}>
                    <span style={{ fontSize:11, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500 }}>Status</span>
                    <span style={{
                      display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:999,
                      background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color, fontSize:11, fontWeight:600,
                    }}>
                      <StatusIcon style={{ fontSize:9 }} />
                      {cfg.label}
                    </span>
                  </div>
                </Section>
              </motion.div>

              <DashedDivider />

              {/* Security stamp */}
              <motion.div
                initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.36 }}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px 24px' }}
              >
                <FaShieldAlt style={{ color:'#10b981', fontSize:11 }} />
                <p style={{ fontSize:11, color:'#475569', textAlign:'center', lineHeight:1.4 }}>
                  Secured by <span style={{ color:'#6366f1', fontWeight:600 }}>Vaultix</span> · 256-bit SSL Encrypted
                </p>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.38 }}
                style={{ padding:'0 20px 24px', display:'flex', gap:10 }}
              >
                <button onClick={handleShare} style={{
                  flex:1, padding:'12px 0', borderRadius:14, cursor:'pointer',
                  background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.28)',
                  color:'#a5b4fc', fontSize:13, fontWeight:600,
                  display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                  transition:'all 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,0.22)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(99,102,241,0.12)'; }}>
                  <FaShareAlt style={{ fontSize:12 }} />
                  Share
                </button>

                <button onClick={close} style={{
                  flex:2, padding:'12px 0', borderRadius:14, cursor:'pointer', border:'none',
                  background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color:'#fff', fontSize:13, fontWeight:700,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 4px 20px rgba(99,102,241,0.4)', transition:'opacity 0.18s',
                  letterSpacing:'-0.01em',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                  Done
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