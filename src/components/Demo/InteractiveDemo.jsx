import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  FaPlay, FaPause, FaArrowRight, FaArrowLeft, FaTimes,
  FaShieldAlt, FaBolt, FaChartLine, FaLock
} from 'react-icons/fa';

// ─────────────────────────────────────────────────────────────────────────────
// Slide data — rich, cinematic content per slide
// ─────────────────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: 1,
    eyebrow: 'Welcome to Vaultix',
    title: 'Banking, Reimagined\nfor Nigeria',
    subtitle: 'Secure. Instant. Rewarding. The modern bank account that works as hard as you do.',
    accent: '#6366f1',
    accentAlt: '#8b5cf6',
    bg: 'radial-gradient(ellipse at 70% 50%, #1e1b4b 0%, #0f0f1a 55%, #0a0a12 100%)',
    tag: 'Digital Banking Platform',
    visual: 'welcome',
    metrics: [
      { label: 'Customers', value: '2.5M+' },
      { label: 'Transactions', value: '₦150B+' },
      { label: 'Uptime', value: '99.9%' },
    ],
  },
  {
    id: 2,
    eyebrow: 'Smart Dashboard',
    title: 'Your Money,\nCrystal Clear',
    subtitle: 'Real-time balance tracking, spending analytics, and transaction history — all beautifully organized.',
    accent: '#10b981',
    accentAlt: '#059669',
    bg: 'radial-gradient(ellipse at 30% 60%, #052e16 0%, #0d1f13 50%, #080f0a 100%)',
    tag: 'Live Analytics',
    visual: 'dashboard',
    features: ['Real-time balance', 'Spending insights', 'Transaction history', 'ATM card view'],
  },
  {
    id: 3,
    eyebrow: 'Instant Transfers',
    title: 'Send Money\nin Seconds',
    subtitle: 'Transfer to any Nigerian bank account instantly — zero fees, zero waiting, maximum peace of mind.',
    accent: '#3b82f6',
    accentAlt: '#06b6d4',
    bg: 'radial-gradient(ellipse at 60% 40%, #0c1445 0%, #091020 55%, #070910 100%)',
    tag: 'Lightning Fast',
    visual: 'transfer',
    steps: [
      { n: '01', label: 'Enter recipient' },
      { n: '02', label: 'Set amount' },
      { n: '03', label: 'Confirm with PIN' },
      { n: '04', label: 'Done instantly' },
    ],
  },
  {
    id: 4,
    eyebrow: 'Bills & Services',
    title: 'Pay Everything\nFrom One Place',
    subtitle: 'Airtime, data, electricity, TV, water — over 50 billers at your fingertips, paid in one tap.',
    accent: '#a855f7',
    accentAlt: '#ec4899',
    bg: 'radial-gradient(ellipse at 50% 30%, #2d1448 0%, #130d20 55%, #0a0810 100%)',
    tag: '50+ Billers',
    visual: 'bills',
    categories: ['📱 Airtime', '🌐 Data', '⚡ Electricity', '📺 TV', '💧 Water', '🎓 Education', '✈️ Flights', '🎮 Gaming'],
  },
  {
    id: 5,
    eyebrow: 'Virtual ATM Cards',
    title: 'Your Card,\nYour Control',
    subtitle: 'Instantly freeze, unfreeze, set spending limits, and manage your card — all without visiting a branch.',
    accent: '#f97316',
    accentAlt: '#ef4444',
    bg: 'radial-gradient(ellipse at 40% 60%, #1f0a02 0%, #180b05 55%, #0f0805 100%)',
    tag: 'Total Control',
    visual: 'card',
    controls: ['Freeze / Unfreeze', 'Change PIN', 'Set Limits', 'Block Online', 'View CVV', 'Report Lost'],
  },
  {
    id: 6,
    eyebrow: 'High-Yield Savings',
    title: 'Watch Your\nMoney Grow',
    subtitle: 'Earn up to 15% annual interest — the best rate in Nigeria. Daily compounding, no lock-in period.',
    accent: '#f59e0b',
    accentAlt: '#eab308',
    bg: 'radial-gradient(ellipse at 60% 50%, #1c1002 0%, #140f05 55%, #0c0a04 100%)',
    tag: 'Best Rates in Nigeria',
    visual: 'savings',
    stats: [
      { label: 'Annual Interest', value: '15%' },
      { label: 'Compounding', value: 'Daily' },
      { label: 'Lock-in', value: 'None' },
    ],
  },
  {
    id: 7,
    eyebrow: 'Bank-Grade Security',
    title: 'Protected\nAt Every Layer',
    subtitle: 'Biometric login, 256-bit encryption, real-time fraud detection AI — your money has never been safer.',
    accent: '#ef4444',
    accentAlt: '#f43f5e',
    bg: 'radial-gradient(ellipse at 45% 55%, #1f0505 0%, #130404 55%, #0d0303 100%)',
    tag: 'Military-Grade',
    visual: 'security',
    shields: ['Biometric Login', 'AES-256 Encryption', 'Fraud Detection AI', '2-Factor Auth', 'NDIC Insured'],
  },
  {
    id: 8,
    eyebrow: 'Start Today',
    title: 'Join 2.5 Million\nSmart Nigerians',
    subtitle: 'Open your free account in under 5 minutes. No paperwork, no queues, no hidden charges.',
    accent: '#6366f1',
    accentAlt: '#8b5cf6',
    bg: 'radial-gradient(ellipse at 50% 40%, #1e1b4b 0%, #0f0f1a 55%, #0a0a12 100%)',
    tag: 'Open in 5 Minutes',
    visual: 'cta',
    cta: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Noise texture SVG (grain overlay)
// ─────────────────────────────────────────────────────────────────────────────
const GrainOverlay = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none" style={{ zIndex: 2 }}>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#grain)" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Visual renderers per slide type
// ─────────────────────────────────────────────────────────────────────────────

const WelcomeVisual = ({ accent }) => (
  <div className="relative flex items-center justify-center h-full">
    {/* Orbiting rings */}
    {[120, 180, 240].map((size, i) => (
      <motion.div key={i}
        animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
        transition={{ duration: 12 + i * 4, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', width: size, height: size, borderRadius: '50%',
          border: `1px solid ${accent}${i === 0 ? '60' : i === 1 ? '35' : '20'}`,
        }}
      />
    ))}
    {/* Center icon */}
    <motion.div
      animate={{ scale: [1, 1.06, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width: 80, height: 80, borderRadius: 24,
        background: `linear-gradient(135deg, ${accent}, #8b5cf6)`,
        boxShadow: `0 0 40px ${accent}60, 0 0 80px ${accent}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, zIndex: 1,
      }}
    >
      🏦
    </motion.div>
    {/* Floating particles */}
    {[...Array(8)].map((_, i) => (
      <motion.div key={i}
        animate={{ y: [-8, 8, -8], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.25 }}
        style={{
          position: 'absolute',
          width: 6, height: 6, borderRadius: '50%',
          background: accent,
          boxShadow: `0 0 8px ${accent}`,
          left: `${20 + i * 8}%`, top: `${30 + (i % 3) * 20}%`,
        }}
      />
    ))}
  </div>
);

const DashboardVisual = ({ accent }) => (
  <div className="relative flex items-center justify-center h-full px-4">
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        width: '100%', maxWidth: 280,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: '16px',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Balance */}
      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Available Balance</p>
      <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 16 }}>₦245,000.00</p>
      {/* Mini bars */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 48, marginBottom: 12 }}>
        {[60, 85, 45, 92, 70, 55, 88].map((h, i) => (
          <motion.div key={i}
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
            transition={{ delay: 0.1 * i, duration: 0.5 }}
            style={{
              flex: 1, height: `${h}%`, borderRadius: 4,
              background: i === 6 ? accent : `${accent}40`,
              transformOrigin: 'bottom',
            }}
          />
        ))}
      </div>
      {/* Two rows */}
      {[{ l: 'Today\'s spend', v: '₦12,500' }, { l: 'Transactions', v: '8 today' }].map((r, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{r.l}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{r.v}</span>
        </div>
      ))}
    </motion.div>
  </div>
);

const TransferVisual = ({ accent }) => (
  <div className="relative flex items-center justify-center h-full px-4">
    <div style={{ width: '100%', maxWidth: 260 }}>
      {/* From card */}
      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 14px', marginBottom: 8 }}>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>FROM</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>My Vaultix Account</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>****4521 · ₦245,000</p>
      </motion.div>
      {/* Arrow */}
      <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 1.5, repeat: Infinity }}
        style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${accent},#06b6d4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${accent}60` }}>
          <FaArrowRight style={{ color: '#fff', fontSize: 12 }} />
        </div>
      </motion.div>
      {/* To card */}
      <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ background: `${accent}15`, border: `1px solid ${accent}40`, borderRadius: 14, padding: '12px 14px', marginBottom: 12 }}>
        <p style={{ fontSize: 10, color: `${accent}99`, marginBottom: 4 }}>TO</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Chidi Nwosu</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>GTBank · 0123456789</p>
      </motion.div>
      {/* Amount */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        style={{ textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em' }}>₦50,000</p>
        <p style={{ fontSize: 10, color: accent, fontWeight: 600, marginTop: 2 }}>FREE · INSTANT</p>
      </motion.div>
    </div>
  </div>
);

const BillsVisual = ({ accent, categories }) => (
  <div className="flex items-center justify-center h-full px-4">
    <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, maxWidth: 280 }}>
      {categories.map((cat, i) => (
        <motion.div key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.06, type: 'spring', stiffness: 300 }}
          whileHover={{ scale: 1.08 }}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '10px 4px', textAlign: 'center', cursor: 'pointer',
          }}
        >
          <p style={{ fontSize: 18, marginBottom: 3 }}>{cat.split(' ')[0]}</p>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{cat.split(' ').slice(1).join(' ')}</p>
        </motion.div>
      ))}
    </motion.div>
  </div>
);

const CardVisual = ({ accent }) => (
  <div className="flex items-center justify-center h-full px-4">
    <div style={{ position: 'relative', width: 260 }}>
      {/* Card shadow behind */}
      <div style={{ position: 'absolute', top: 12, left: 12, right: -12, bottom: -12, borderRadius: 20, background: `${accent}20`, filter: 'blur(8px)' }} />
      {/* ATM Card */}
      <motion.div
        initial={{ rotateY: -15, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.7, type: 'spring' }}
        style={{
          position: 'relative', borderRadius: 20,
          background: `linear-gradient(135deg,${accent},#8b5cf6 60%,#6366f1)`,
          padding: '20px', height: 158,
          boxShadow: `0 20px 60px ${accent}40, 0 0 0 1px rgba(255,255,255,0.1)`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.12em' }}>VAULTIX</p>
          </div>
          <div style={{ width: 32, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: 9, color: '#fff', fontWeight: 800 }}>VISA</p>
          </div>
        </div>
        {/* Chip */}
        <div style={{ width: 36, height: 26, borderRadius: 6, background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', marginTop: 12, marginBottom: 12 }} />
        <p style={{ fontFamily: 'monospace', fontSize: 14, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.15em' }}>**** **** **** 4521</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>EMEKA OKAFOR</p>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>12/28</p>
        </div>
      </motion.div>
      {/* Freeze button */}
      <motion.div
        animate={{ y: [-2, 2, -2] }} transition={{ duration: 2, repeat: Infinity }}
        style={{
          position: 'absolute', bottom: -16, right: -8,
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 12, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6,
          backdropFilter: 'blur(12px)',
        }}
      >
        <span style={{ fontSize: 14 }}>❄️</span>
        <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>Freeze Card</span>
      </motion.div>
    </div>
  </div>
);

const SavingsVisual = ({ accent }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(67), 400);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="flex items-center justify-center h-full px-4">
      <div style={{ width: '100%', maxWidth: 260 }}>
        {/* Interest counter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 20 }}
        >
          <p style={{ fontSize: 10, color: `${accent}99`, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Earning Right Now</p>
          <motion.p
            animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            style={{ fontSize: 36, fontWeight: 800, color: accent, letterSpacing: '-0.04em' }}
          >15% APY</motion.p>
        </motion.div>
        {/* Savings goal card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>🎯 Emergency Fund</p>
            <p style={{ fontSize: 11, color: accent, fontWeight: 700 }}>{progress}%</p>
          </div>
          {/* Progress bar */}
          <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              style={{ height: '100%', background: `linear-gradient(90deg,${accent},#eab308)`, borderRadius: 4 }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>₦167,500 saved</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Goal: ₦250,000</p>
          </div>
        </div>
        {/* Daily interest earned */}
        <motion.div
          animate={{ y: [-2, 2, -2] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ marginTop: 10, background: `${accent}15`, border: `1px solid ${accent}30`, borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Today's interest</p>
          <p style={{ fontSize: 13, fontWeight: 800, color: accent }}>+₦68.49</p>
        </motion.div>
      </div>
    </div>
  );
};

const SecurityVisual = ({ accent, shields }) => (
  <div className="flex items-center justify-center h-full px-4">
    <div style={{ position: 'relative', width: 220 }}>
      {/* Central shield */}
      <motion.div
        animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 3, repeat: Infinity }}
        style={{ textAlign: 'center', marginBottom: 16 }}
      >
        <div style={{
          width: 72, height: 72, margin: '0 auto', borderRadius: '50%',
          background: `linear-gradient(135deg,${accent},#f43f5e)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 40px ${accent}50, 0 0 80px ${accent}20`,
        }}>
          <FaShieldAlt style={{ color: '#fff', fontSize: 28 }} />
        </div>
      </motion.div>
      {shields.map((shield, i) => (
        <motion.div key={i}
          initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10, padding: '8px 12px', marginBottom: 6,
          }}
        >
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaLock style={{ color: accent, fontSize: 9 }} />
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{shield}</p>
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}
          />
        </motion.div>
      ))}
    </div>
  </div>
);

const CtaVisual = ({ accent }) => (
  <div className="flex items-center justify-center h-full">
    <div style={{ textAlign: 'center' }}>
      <motion.div
        animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ fontSize: 80, marginBottom: 16 }}
      >✨</motion.div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {['Free Account', 'Instant Setup', 'No Paperwork', 'Zero Fees'].map((tag, i) => (
          <motion.div key={i}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.1 * i, type: 'spring' }}
            style={{
              padding: '6px 14px', borderRadius: 999,
              background: `${accent}20`, border: `1px solid ${accent}50`,
              fontSize: 12, fontWeight: 600, color: '#fff',
            }}
          >
            {tag}
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

const SlideVisual = ({ slide }) => {
  const props = { accent: slide.accent };
  switch (slide.visual) {
    case 'welcome':   return <WelcomeVisual {...props} />;
    case 'dashboard': return <DashboardVisual {...props} />;
    case 'transfer':  return <TransferVisual {...props} />;
    case 'bills':     return <BillsVisual {...props} categories={slide.categories} />;
    case 'card':      return <CardVisual {...props} />;
    case 'savings':   return <SavingsVisual {...props} />;
    case 'security':  return <SecurityVisual {...props} shields={slide.shields} />;
    case 'cta':       return <CtaVisual {...props} />;
    default:          return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Progress bar for auto-play (thin, accent-colored)
// ─────────────────────────────────────────────────────────────────────────────

const AutoPlayBar = ({ isPlaying, accent, duration = 5000, slideKey }) => {
  const [w, setW] = useState(0);
  useEffect(() => {
    setW(0);
    if (!isPlaying) return;
    const start = Date.now();
    const id = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / duration) * 100);
      setW(pct);
      if (pct >= 100) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [isPlaying, slideKey]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.08)', zIndex: 20 }}>
      <div style={{ height: '100%', width: `${w}%`, background: accent, transition: 'background 0.3s', borderRadius: '0 2px 2px 0' }} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const DURATION = 5000;

const InteractiveDemo = ({ onClose }) => {
  const [idx, setIdx]         = useState(0);
  const [dir, setDir]         = useState(1);
  const [playing, setPlaying] = useState(true);
  const intervalRef           = useRef(null);

  const slide = SLIDES[idx];

  const go = useCallback((nextIdx, direction) => {
    setDir(direction);
    setIdx((nextIdx + SLIDES.length) % SLIDES.length);
  }, []);

  const next = useCallback(() => { go(idx + 1, 1);  setPlaying(false); }, [idx, go]);
  const prev = useCallback(() => { go(idx - 1, -1); setPlaying(false); }, [idx, go]);

  // Auto-advance
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (playing) {
      intervalRef.current = setInterval(() => {
        setDir(1);
        setIdx(p => (p + 1) % SLIDES.length);
      }, DURATION);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, idx]);

  // Keyboard nav
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'ArrowRight') { next(); }
      if (e.key === 'ArrowLeft')  { prev(); }
      if (e.key === 'Escape')     { onClose(); }
      if (e.key === ' ')          { e.preventDefault(); setPlaying(p => !p); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [next, prev, onClose]);

  const variants = {
    enter:  (d) => ({ x: d > 0 ? '30%' : '-30%', opacity: 0, scale: 0.96 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit:   (d) => ({ x: d > 0 ? '-20%' : '20%', opacity: 0, scale: 0.98 }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', width: '100%', maxWidth: 860,
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: `0 0 0 1px rgba(255,255,255,0.07), 0 40px 100px rgba(0,0,0,0.7), 0 0 80px ${slide.accent}15`,
        }}
      >
        <AutoPlayBar isPlaying={playing} accent={slide.accent} duration={DURATION} slideKey={idx} />

        {/* ── Main slide area ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 420 }}>

          {/* LEFT — Text */}
          <div
            style={{
              position: 'relative', overflow: 'hidden',
              background: slide.bg, padding: '48px 40px',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}
          >
            <GrainOverlay />
            {/* Ambient glow */}
            <div style={{
              position: 'absolute', bottom: -40, left: -40, width: 240, height: 240,
              background: `radial-gradient(circle,${slide.accent}25,transparent 70%)`,
              pointerEvents: 'none',
            }} />

            <AnimatePresence mode="wait" custom={dir}>
              <motion.div key={idx} custom={dir} variants={variants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ position: 'relative', zIndex: 3 }}
              >
                {/* Eyebrow */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '5px 12px', borderRadius: 999, marginBottom: 20,
                  background: `${slide.accent}18`, border: `1px solid ${slide.accent}35`,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: slide.accent }} />
                  <p style={{ fontSize: 11, fontWeight: 700, color: slide.accent, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {slide.eyebrow}
                  </p>
                </div>

                {/* Title */}
                <h2 style={{
                  fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 900, color: '#f8fafc',
                  letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16,
                  whiteSpace: 'pre-line',
                }}>
                  {slide.title}
                </h2>

                {/* Subtitle */}
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: 24, fontWeight: 400 }}>
                  {slide.subtitle}
                </p>

                {/* Slide-specific extras */}
                {slide.steps && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {slide.steps.map((s, i) => (
                      <motion.div key={i}
                        initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 * i }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 800, color: slide.accent, fontFamily: 'monospace', minWidth: 24 }}>{s.n}</span>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{s.label}</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {slide.stats && (
                  <div style={{ display: 'flex', gap: 20 }}>
                    {slide.stats.map((s, i) => (
                      <div key={i}>
                        <p style={{ fontSize: 22, fontWeight: 900, color: slide.accent, letterSpacing: '-0.04em' }}>{s.value}</p>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {slide.features && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {slide.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: slide.accent, flexShrink: 0 }} />
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{f}</p>
                      </div>
                    ))}
                  </div>
                )}

                {slide.controls && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {slide.controls.map((c, i) => (
                      <div key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 500 }}>
                        {c}
                      </div>
                    ))}
                  </div>
                )}

                {slide.shields && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {slide.shields.slice(0, 3).map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FaShieldAlt style={{ color: slide.accent, fontSize: 10, flexShrink: 0 }} />
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{s}</p>
                      </div>
                    ))}
                  </div>
                )}

                {slide.cta && (
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { onClose(); window.location.href = '/register'; }}
                    style={{
                      padding: '12px 28px', borderRadius: 14, border: 'none', cursor: 'pointer',
                      background: `linear-gradient(135deg,${slide.accent},${slide.accentAlt})`,
                      color: '#fff', fontSize: 14, fontWeight: 800,
                      boxShadow: `0 8px 24px ${slide.accent}50`,
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    Open Free Account <FaArrowRight style={{ fontSize: 11 }} />
                  </motion.button>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Slide tag */}
            <div style={{ position: 'relative', zIndex: 3 }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {slide.tag}
              </p>
            </div>
          </div>

          {/* RIGHT — Visual */}
          <div style={{
            position: 'relative', overflow: 'hidden', minHeight: 420,
            background: `radial-gradient(ellipse at center, ${slide.accent}12 0%, #060810 60%)`,
            borderLeft: '1px solid rgba(255,255,255,0.05)',
          }}>
            <GrainOverlay />
            {/* Grid lines */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}>
              {[...Array(8)].map((_, i) => (
                <line key={`v${i}`} x1={`${i * 14.3}%`} y1="0" x2={`${i * 14.3}%`} y2="100%" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
              ))}
              {[...Array(8)].map((_, i) => (
                <line key={`h${i}`} x1="0" y1={`${i * 14.3}%`} x2="100%" y2={`${i * 14.3}%`} stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
              ))}
            </svg>

            <AnimatePresence mode="wait" custom={dir}>
              <motion.div key={`visual-${idx}`} custom={dir} variants={variants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ height: '100%', position: 'relative', zIndex: 2 }}
              >
                <SlideVisual slide={slide} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Bottom controls ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px',
          background: 'rgba(6,8,16,0.96)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          {/* Dot nav */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {SLIDES.map((s, i) => (
              <button key={i}
                onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i); setPlaying(false); }}
                style={{
                  width: i === idx ? 24 : 6, height: 6, borderRadius: 3, border: 'none', cursor: 'pointer',
                  background: i === idx ? slide.accent : 'rgba(255,255,255,0.18)',
                  transition: 'all 0.25s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>

          {/* Center counter */}
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.04em' }}>
            {String(idx + 1).padStart(2,'0')} / {String(SLIDES.length).padStart(2,'0')}
          </p>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Prev */}
            <button onClick={prev} style={{
              width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.6)', transition: 'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}>
              <FaArrowLeft style={{ fontSize: 11 }} />
            </button>

            {/* Play/Pause */}
            <button onClick={() => setPlaying(p => !p)} style={{
              width: 44, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: `linear-gradient(135deg,${slide.accent},${slide.accentAlt})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 16px ${slide.accent}40`, transition: 'transform 0.18s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              {playing
                ? <FaPause style={{ color: '#fff', fontSize: 10 }} />
                : <FaPlay  style={{ color: '#fff', fontSize: 10, marginLeft: 1 }} />
              }
            </button>

            {/* Next */}
            <button onClick={next} style={{
              width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.6)', transition: 'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}>
              <FaArrowRight style={{ fontSize: 11 }} />
            </button>

            {/* Close */}
            <button onClick={onClose} style={{
              width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(239,68,68,0.25)',
              background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(239,68,68,0.7)', transition: 'all 0.18s', marginLeft: 4,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'rgba(239,68,68,0.7)'; }}>
              <FaTimes style={{ fontSize: 11 }} />
            </button>
          </div>
        </div>

        {/* Keyboard hint */}
        <div style={{
          background: 'rgba(6,8,16,0.96)', padding: '6px 24px 10px',
          borderTop: '1px solid rgba(255,255,255,0.03)',
          display: 'flex', gap: 16, justifyContent: 'center',
        }}>
          {[['←→', 'Navigate'], ['Space', 'Play/Pause'], ['Esc', 'Close']].map(([key, label]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <kbd style={{
                fontSize: 9, padding: '2px 6px', borderRadius: 5,
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontWeight: 600,
              }}>{key}</kbd>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InteractiveDemo;