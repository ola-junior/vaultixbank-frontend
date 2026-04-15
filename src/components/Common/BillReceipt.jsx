import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';
import {
  FaCheckCircle, FaTimes, FaShareAlt, FaCopy,
  FaShieldAlt, FaReceipt, FaTimesCircle, FaExclamationCircle,
  FaBolt,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const pad = (n) => String(n).padStart(2, '0');

const fmtDate = (d) => {
  const dt = d ? new Date(d) : new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[dt.getMonth()]} ${pad(dt.getDate())}, ${dt.getFullYear()} · ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
};

const statusConfig = {
  successful: { icon: FaCheckCircle,    label: 'Successful', color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
  pending:    { icon: FaExclamationCircle, label: 'Pending',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
  failed:     { icon: FaTimesCircle,    label: 'Failed',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)' },
};

const Row = ({ label, value, mono, accent, small }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, padding:'6px 0' }}>
    <span style={{ fontSize: small?10.5:11.5, color:'#94a3b8', fontWeight:400, flexShrink:0, textTransform:'uppercase', letterSpacing:'0.05em' }}>
      {label}
    </span>
    <span style={{ fontSize: small?11:12.5, color: accent||'#e2e8f0', fontFamily: mono?"'JetBrains Mono','Fira Mono',monospace":"inherit", fontWeight: mono?500:600, textAlign:'right', wordBreak:'break-all', maxWidth:'64%', lineHeight:1.4 }}>
      {value || '—'}
    </span>
  </div>
);

const DashedDivider = () => (
  <div style={{ position:'relative', margin:'0 -1.5rem', height:24 }}>
    <svg width="100%" height="24"><line x1="20" y1="12" x2="calc(100% - 20)" y2="12" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" strokeDasharray="6 5" /></svg>
    <div style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)', width:20, height:20, borderRadius:'0 50% 50% 0', background:'#0f172a' }} />
    <div style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%)', width:20, height:20, borderRadius:'50% 0 0 50%', background:'#0f172a' }} />
  </div>
);

const BillReceipt = ({ bill, category, onClose }) => {
  const [visible, setVisible] = useState(true);
  const [copied, setCopied]   = useState(false);

  const status = bill?.status || 'successful';
  const cfg    = statusConfig[status] || statusConfig.successful;
  const StatusIcon = cfg.icon;

  const [c1, c2] = category?.gradient || ['#6366f1','#8b5cf6'];
  const Icon = category?.icon;

  const handleClose = () => { setVisible(false); setTimeout(onClose, 260); };

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(bill?.reference || '');
      setCopied(true);
      toast.success('Reference copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error('Could not copy'); }
  };

  const handleShare = async () => {
    const text = `Vaultix Bill Receipt\n${category?.label} — ${formatCurrency(bill?.amount)}\nProvider: ${bill?.providerName}\nRecipient: ${bill?.recipient}\nStatus: ${cfg.label}\nRef: ${bill?.reference}\n${fmtDate(bill?.createdAt)}`;
    if (navigator.share) { try { await navigator.share({ title: 'Bill Receipt', text }); } catch {} }
    else { await navigator.clipboard.writeText(text); toast.success('Receipt copied!'); }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={handleClose}
            style={{ position:'fixed', inset:0, zIndex:9998, background:'rgba(2,6,23,0.85)', backdropFilter:'blur(12px)' }}
          />

          <motion.div
            initial={{ opacity:0, y:60, scale:0.92 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:40, scale:0.95 }}
            transition={{ type:'spring', stiffness:340, damping:30 }}
            style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16, pointerEvents:'none' }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                pointerEvents:'all',
                width:'100%', maxWidth:420, maxHeight:'92vh', overflowY:'auto',
                background:'linear-gradient(160deg,#0f172a 0%,#111827 60%,#0f172a 100%)',
                borderRadius:24, border:'1px solid rgba(148,163,184,0.1)',
                boxShadow:'0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.7)',
                fontFamily:"'DM Sans',sans-serif",
                scrollbarWidth:'none',
                position:'relative',
              }}
            >
              {/* Top glow */}
              <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:260, height:1, background:`linear-gradient(90deg,transparent,${c1}70,transparent)`, borderRadius:999, pointerEvents:'none' }} />

              {/* Header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 20px 14px', borderBottom:'1px solid rgba(148,163,184,0.08)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:32, height:32, borderRadius:10, background:`linear-gradient(135deg,${c1},${c2})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 12px ${c1}50` }}>
                    {Icon && <Icon style={{ color:'#fff', fontSize:13 }} />}
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', lineHeight:1.1, letterSpacing:'-0.01em' }}>Vaultix</p>
                    <p style={{ fontSize:10, color:'#64748b', fontWeight:400, letterSpacing:'0.06em', textTransform:'uppercase' }}>Bill Receipt</p>
                  </div>
                </div>
                <button onClick={handleClose} style={{ width:32, height:32, borderRadius:10, border:'1px solid rgba(148,163,184,0.15)', background:'rgba(148,163,184,0.06)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#64748b' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.1)';e.currentTarget.style.color='#ef4444'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(148,163,184,0.06)';e.currentTarget.style.color='#64748b'}}>
                  <FaTimes style={{ fontSize:11 }} />
                </button>
              </div>

              {/* Amount + Status */}
              <div style={{ padding:'26px 24px 18px', textAlign:'center', position:'relative' }}>
                <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:200, height:180, background:`radial-gradient(circle,${c1}14 0%,transparent 70%)`, pointerEvents:'none' }} />

                <motion.div initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ delay:0.15, type:'spring', stiffness:400, damping:20 }}
                  style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 14px', borderRadius:999, background:cfg.bg, border:`1px solid ${cfg.border}`, marginBottom:14 }}>
                  <StatusIcon style={{ color:cfg.color, fontSize:12 }} />
                  <span style={{ color:cfg.color, fontSize:12, fontWeight:600 }}>{cfg.label}</span>
                </motion.div>

                <motion.p initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                  style={{ fontSize:40, fontWeight:800, color:'#f8fafc', letterSpacing:'-0.03em', lineHeight:1, marginBottom:6 }}>
                  {formatCurrency(bill?.amount || 0)}
                </motion.p>

                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.27 }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:999, background:`${c1}18`, border:`1px solid ${c1}25`, marginBottom:8 }}>
                    {Icon && <Icon style={{ color:c1, fontSize:10 }} />}
                    <span style={{ color:c1, fontSize:11, fontWeight:700 }}>{category?.label}</span>
                    <span style={{ color:'#64748b', fontSize:11 }}>·</span>
                    <span style={{ color:'#94a3b8', fontSize:11 }}>{bill?.providerName}</span>
                  </div>
                  <p style={{ fontSize:11.5, color:'#475569', letterSpacing:'0.02em' }}>{fmtDate(bill?.createdAt)}</p>
                </motion.div>
              </div>

              <DashedDivider />

              {/* Details */}
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.32 }} style={{ padding:'14px 24px' }}>
                {/* Service details */}
                <p style={{ fontSize:10, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Service Details</p>
                <div style={{ background:'rgba(248,250,252,0.04)', border:'1px solid rgba(148,163,184,0.08)', borderRadius:12, padding:'10px 14px', marginBottom:14 }}>
                  <Row label="Provider"  value={bill?.providerName} />
                  {bill?.planName && <Row label="Plan" value={bill.planName} />}
                  <Row label={category?.recipientLabel || 'Recipient'} value={bill?.recipient} mono />
                  {bill?.recipientName && <Row label="Name" value={bill.recipientName} />}
                </div>

                {/* Electricity token */}
                {bill?.token && (
                  <>
                    <p style={{ fontSize:10, fontWeight:700, color:'#eab308', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>⚡ Electricity Token</p>
                    <div style={{ background:'rgba(234,179,8,0.08)', border:'1px solid rgba(234,179,8,0.25)', borderRadius:12, padding:'14px', marginBottom:14, textAlign:'center' }}>
                      <p style={{ fontSize:10, color:'rgba(234,179,8,0.8)', marginBottom:6, letterSpacing:'0.05em', textTransform:'uppercase' }}>Recharge Token</p>
                      <p style={{ fontSize:20, fontWeight:800, color:'#fde68a', fontFamily:"'JetBrains Mono','Fira Mono',monospace", letterSpacing:'0.15em' }}>
                        {bill.token}
                      </p>
                      <p style={{ fontSize:10, color:'rgba(234,179,8,0.6)', marginTop:6 }}>Enter this token on your electricity meter</p>
                    </div>
                  </>
                )}

                {/* Transaction details */}
                <p style={{ fontSize:10, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Transaction</p>
                <div style={{ background:'rgba(248,250,252,0.04)', border:'1px solid rgba(148,163,184,0.08)', borderRadius:12, padding:'10px 14px' }}>
                  {bill?.description && <Row label="Note" value={bill.description} />}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0' }}>
                    <span style={{ fontSize:11.5, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em' }}>Reference</span>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:10.5, color:'#e2e8f0', fontFamily:"'JetBrains Mono','Fira Mono',monospace", fontWeight:500 }}>
                        {(bill?.reference || '').slice(0,20)}{(bill?.reference||'').length>20?'…':''}
                      </span>
                      <button onClick={copyRef} style={{ padding:'2px 7px', borderRadius:6, cursor:'pointer', background: copied?'rgba(16,185,129,0.15)':'rgba(99,102,241,0.15)', border:`1px solid ${copied?'rgba(16,185,129,0.3)':'rgba(99,102,241,0.3)'}`, color: copied?'#10b981':'#a5b4fc', fontSize:10, fontWeight:600 }}>
                        {copied ? '✓' : <FaCopy style={{ fontSize:9 }} />}
                      </button>
                    </div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0' }}>
                    <span style={{ fontSize:11.5, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em' }}>Status</span>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:999, background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color, fontSize:11, fontWeight:600 }}>
                      <StatusIcon style={{ fontSize:9 }} /> {cfg.label}
                    </span>
                  </div>
                  {bill?.balanceAfter !== undefined && (
                    <Row label="Balance After" value={formatCurrency(bill.balanceAfter)} accent="#10b981" />
                  )}
                </div>
              </motion.div>

              <DashedDivider />

              {/* Security */}
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px 24px' }}>
                <FaShieldAlt style={{ color:'#10b981', fontSize:11 }} />
                <p style={{ fontSize:11, color:'#475569', textAlign:'center' }}>
                  Secured & verified by <span style={{ color:'#6366f1', fontWeight:600 }}>Vaultix</span> · 256-bit SSL Encrypted
                </p>
              </motion.div>

              {/* Actions */}
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.42 }}
                style={{ padding:'0 20px 24px', display:'flex', gap:10 }}>
                <button onClick={handleShare}
                  style={{ flex:1, padding:'11px 0', borderRadius:14, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', color:'#a5b4fc', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:7, cursor:'pointer', fontFamily:"inherit" }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(99,102,241,0.22)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(99,102,241,0.12)'}>
                  <FaShareAlt style={{ fontSize:12 }} /> Share
                </button>
                <button onClick={handleClose}
                  style={{ flex:2, padding:'11px 0', borderRadius:14, background:`linear-gradient(135deg,${c1},${c2})`, border:'none', color:'#fff', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:7, cursor:'pointer', boxShadow:`0 4px 20px ${c1}45`, fontFamily:'inherit', letterSpacing:'-0.01em' }}
                  onMouseEnter={e=>e.currentTarget.style.opacity='0.9'}
                  onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
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

export default BillReceipt;