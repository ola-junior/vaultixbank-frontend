import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaPaperPlane, FaDownload, FaUpload, FaMobileAlt,
  FaWifi, FaTv, FaGamepad,
  FaShoppingCart, FaBolt, FaWater,
  FaGraduationCap, FaPlane, FaHospital, FaEllipsisH,
  FaTimes, FaCreditCard, FaTicketAlt, FaMoneyBillWave,
  FaChevronRight, FaHistory, FaGlobe,
} from 'react-icons/fa';
import { MdSportsSoccer, MdLocalGroceryStore, MdOutlineChildCare } from 'react-icons/md';
import { GiTakeMyMoney } from 'react-icons/gi';

// ─── Service definitions ──────────────────────────────────────────────────────
const ALL_SERVICES = [
  { id: 'airtime', label: 'Airtime', icon: FaMobileAlt, gradient: ['#6366f1', '#8b5cf6'], route: '/bills/airtime', category: 'telecom' },
  { id: 'data', label: 'Data', icon: FaWifi, gradient: ['#3b82f6', '#0ea5e9'], route: '/bills/data', category: 'telecom' },
  { id: 'betting', label: 'Betting', icon: MdSportsSoccer, gradient: ['#10b981', '#059669'], route: '/bills/betting', category: 'lifestyle' },
  { id: 'tv', label: 'Cable TV', icon: FaTv, gradient: ['#f59e0b', '#d97706'], route: '/bills/tv', category: 'utility' },
  { id: 'gwealth', label: 'GWealth', icon: FaMoneyBillWave, gradient: ['#ec4899', '#db2777'], route: '/savings', category: 'finance' },
  { id: 'loan', label: 'Loan', icon: GiTakeMyMoney, gradient: ['#f97316', '#ea580c'], route: '/loans', category: 'finance' },
  { id: 'play4achild', label: 'Play4Child', icon: MdOutlineChildCare, gradient: ['#14b8a6', '#0d9488'], route: '/play4achild', category: 'lifestyle' },
  { id: 'history', label: 'History', icon: FaHistory, gradient: ['#8b5cf6', '#6d28d9'], route: '/transactions', category: 'finance' },
  // Extra
  { id: 'electricity', label: 'Electricity', icon: FaBolt, gradient: ['#eab308', '#ca8a04'], route: '/bills/electricity', category: 'utility' },
  { id: 'water', label: 'Water', icon: FaWater, gradient: ['#06b6d4', '#0284c7'], route: '/bills/water', category: 'utility' },
  { id: 'education', label: 'Education', icon: FaGraduationCap, gradient: ['#8b5cf6', '#6d28d9'], route: '/bills/education', category: 'lifestyle' },
  { id: 'internet', label: 'Internet', icon: FaGlobe, gradient: ['#6366f1', '#4f46e5'], route: '/bills/internet', category: 'utility' },
  { id: 'insurance', label: 'Insurance', icon: FaHospital, gradient: ['#ef4444', '#dc2626'], route: null, category: 'finance' },
  { id: 'shopping', label: 'Shopping', icon: MdLocalGroceryStore, gradient: ['#10b981', '#047857'], route: null, category: 'lifestyle' },
  { id: 'gaming', label: 'Gaming', icon: FaGamepad, gradient: ['#a855f7', '#7c3aed'], route: null, category: 'lifestyle' },
  { id: 'events', label: 'Events', icon: FaTicketAlt, gradient: ['#f43f5e', '#e11d48'], route: null, category: 'lifestyle' },
];

// Routes that have real pages built
const LIVE_ROUTES = new Set([
  '/transfer', '/transactions', '/savings',
  '/bills/airtime', '/bills/data', '/bills/tv',
  '/bills/electricity', '/bills/water', '/bills/education',
  '/bills/betting', '/bills/internet',
]);

const QUICK_ACTIONS = [
  { label: 'Send', icon: FaPaperPlane, gradient: ['#6366f1', '#818cf8'], action: (nav) => nav('/transfer', { state: { action: 'transfer' } }) },
  { label: 'Receive', icon: FaDownload, gradient: ['#10b981', '#34d399'], action: () => toast('Share your account number to receive.', { icon: '📋', duration: 4000 }) },
  { label: 'Deposit', icon: FaCreditCard, gradient: ['#3b82f6', '#38bdf8'], action: (nav) => nav('/transfer', { state: { action: 'deposit' } }) },
  { label: 'Withdraw', icon: FaUpload, gradient: ['#f97316', '#fb923c'], action: (nav) => nav('/transfer', { state: { action: 'withdraw' } }) },
];

const VISIBLE = ALL_SERVICES.slice(0, 7);
const EXTRA = ALL_SERVICES.slice(8);

// ─── Tile ─────────────────────────────────────────────────────────────────────
const Tile = ({ service, onPress, compact = false }) => {
  const [active, setActive] = useState(false);
  const Icon = service.icon;
  const sz = compact ? 40 : 48;
  const [c1, c2] = service.gradient;

  return (
    <motion.button
      type="button"
      whileHover={{ y: -2, scale: 1.06 }}
      whileTap={{ scale: 0.88 }}
      onPointerDown={() => setActive(true)}
      onPointerUp={() => setActive(false)}
      onPointerLeave={() => setActive(false)}
      onClick={() => onPress(service)}
      className="flex flex-col items-center gap-[7px] focus:outline-none min-w-0"
      aria-label={service.label}
    >
      <div style={{
        width: sz, height: sz, borderRadius: sz * 0.38,
        background: `linear-gradient(145deg, ${c1}, ${c2})`,
        boxShadow: active ? `0 2px 6px ${c1}50` : `0 5px 16px ${c1}45, inset 0 1px 0 rgba(255,255,255,0.22)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'box-shadow 0.18s ease', position: 'relative', overflow: 'hidden', flexShrink: 0,
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(255,255,255,0.26) 0%,rgba(255,255,255,0) 55%)', pointerEvents: 'none', borderRadius: 'inherit' }} />
        <Icon style={{ color: '#fff', fontSize: compact ? 15 : 19, position: 'relative', zIndex: 1 }} />
      </div>
      <span className="text-[10.5px] font-semibold text-gray-500 dark:text-gray-400 text-center leading-tight w-full truncate px-0.5"
        style={{ letterSpacing: '0.01em' }}>
        {service.label}
      </span>
    </motion.button>
  );
};

// ─── Action Card ──────────────────────────────────────────────────────────────
const ActionCard = ({ btn, navigate }) => {
  const [ripple, setRipple] = useState(null);
  const Icon = btn.icon;
  const [c1, c2] = btn.gradient;

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setRipple(null), 500);
    btn.action(navigate);
  };

  return (
    <motion.button
      type="button"
      whileHover={{ y: -3, scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="relative flex flex-col items-center gap-2.5 focus:outline-none overflow-hidden"
      style={{ borderRadius: 20, padding: '14px 8px 12px', background: `linear-gradient(148deg,${c1}18,${c2}10)`, border: `1.5px solid ${c1}30`, flex: 1, minWidth: 0, cursor: 'pointer' }}
    >
      <AnimatePresence>
        {ripple && (
          <motion.span initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 8, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            style={{ position: 'absolute', left: ripple.x, top: ripple.y, width: 20, height: 20, borderRadius: '50%', background: c1, transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 0 }} />
        )}
      </AnimatePresence>
      <div style={{ width: 46, height: 46, borderRadius: 15, background: `linear-gradient(145deg,${c1},${c2})`, boxShadow: `0 6px 20px ${c1}50,inset 0 1px 0 rgba(255,255,255,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(255,255,255,0.3) 0%,transparent 50%)', borderRadius: 'inherit', pointerEvents: 'none' }} />
        <Icon style={{ color: '#fff', fontSize: 18, position: 'relative', zIndex: 1 }} />
      </div>
      <span className="text-[12px] font-bold text-gray-700 dark:text-gray-200 relative z-10" style={{ letterSpacing: '-0.01em' }}>{btn.label}</span>
    </motion.button>
  );
};

// ─── Category filter ──────────────────────────────────────────────────────────
const CATEGORIES = ['all', 'telecom', 'utility', 'finance', 'lifestyle'];
const CAT_LABELS = { all: 'All', telecom: 'Telecom', utility: 'Utility', finance: 'Finance', lifestyle: 'Lifestyle' };

// ─── More Modal ───────────────────────────────────────────────────────────────
const MoreModal = ({ isOpen, onClose, onSelect }) => {
  const [cat, setCat] = useState('all');
  const filtered = cat === 'all' ? EXTRA : EXTRA.filter(s => s.category === cat);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}
            onClick={onClose} className="fixed inset-0 z-40" style={{ background: 'rgba(2,6,23,0.7)', backdropFilter: 'blur(6px)' }} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 overflow-hidden" style={{ borderRadius: '28px 28px 0 0', maxHeight: '86vh' }}>
            <div className="flex justify-center pt-3"><div className="w-9 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" /></div>
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white" style={{ letterSpacing: '-0.02em' }}>All Services</h3>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{EXTRA.length} services available</p>
              </div>
              <motion.button whileTap={{ scale: 0.88 }} onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center focus:outline-none"
                style={{ background: 'rgba(148,163,184,0.12)', border: '1px solid rgba(148,163,184,0.2)' }}>
                <FaTimes className="text-gray-500 dark:text-gray-400" style={{ fontSize: 11 }} />
              </motion.button>
            </div>
            <div className="flex gap-2 px-5 pb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {CATEGORIES.map(c => (
                <motion.button key={c} whileTap={{ scale: 0.94 }} onClick={() => setCat(c)}
                  className="flex-shrink-0 text-[11px] font-semibold focus:outline-none"
                  style={{ padding: '6px 14px', borderRadius: 999, background: cat === c ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(148,163,184,0.1)', color: cat === c ? '#fff' : '#64748b', border: cat === c ? 'none' : '1px solid rgba(148,163,184,0.18)', boxShadow: cat === c ? '0 4px 12px rgba(99,102,241,0.35)' : 'none' }}>
                  {CAT_LABELS[c]}
                </motion.button>
              ))}
            </div>
            <div className="px-5 overflow-y-auto pb-10" style={{ maxHeight: 'calc(86vh - 160px)', scrollbarWidth: 'none' }}>
              <AnimatePresence mode="wait">
                <motion.div key={cat} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
                  className="grid grid-cols-4 gap-x-2 gap-y-6">
                  {filtered.map((svc, i) => (
                    <motion.div key={svc.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.032 }} className="flex justify-center">
                      <Tile service={svc} onPress={(s) => { onClose(); onSelect(s); }} compact />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-sm text-gray-400">No services in this category</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Main QuickActions ────────────────────────────────────────────────────────
const QuickActions = () => {
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const handleService = (service) => {
    if (!service.route) {
      toast(`${service.label} — Coming soon!`, { icon: '🚀', style: { background: '#1e293b', color: '#f1f5f9', borderRadius: '14px', fontWeight: 600, fontSize: 13 } });
      return;
    }
    navigate(service.route);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white dark:bg-gray-900 overflow-hidden"
        style={{ borderRadius: 24, border: '1px solid rgba(148,163,184,0.12)', boxShadow: '0 1px 3px rgba(0,0,0,0.04),0 8px 32px rgba(0,0,0,0.06)' }}>

        {/* Header + actions */}
        <div className="px-4 pt-5 pb-2">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-bold text-gray-800 dark:text-white" style={{ letterSpacing: '-0.02em' }}>Quick Actions</span>
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => setMoreOpen(true)}
              className="flex items-center gap-1 text-[11.5px] font-semibold text-indigo-500 dark:text-indigo-400 focus:outline-none">
              See all <FaChevronRight style={{ fontSize: 8 }} />
            </motion.button>
          </div>
          <div className="flex gap-2.5">
            {QUICK_ACTIONS.map(btn => <ActionCard key={btn.label} btn={btn} navigate={navigate} />)}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 px-5 mt-4">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.12em] whitespace-nowrap">Bills & Services</span>
          <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
        </div>

        {/* Services grid */}
        <div className="px-4 pt-4 pb-5">
          <div className="grid grid-cols-4 gap-y-5 gap-x-1">
            {VISIBLE.map((svc, i) => (
              <motion.div key={svc.id} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.04 + i * 0.03, type: 'spring', stiffness: 400, damping: 22 }} className="flex justify-center">
                <Tile service={svc} onPress={handleService} />
              </motion.div>
            ))}
            {/* More button */}
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.04 + 7 * 0.03, type: 'spring', stiffness: 400, damping: 22 }} className="flex justify-center">
              <motion.button type="button" whileHover={{ y: -2, scale: 1.06 }} whileTap={{ scale: 0.88 }}
                onClick={() => setMoreOpen(true)} className="flex flex-col items-center gap-[7px] focus:outline-none">
                <div style={{ width: 48, height: 48, borderRadius: 18, background: 'rgba(148,163,184,0.1)', border: '1.5px dashed rgba(148,163,184,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="flex items-center gap-0.5">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} animate={{ scale: [1, 1.35, 1] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.18 }}
                        style={{ width: 4, height: 4, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }} />
                    ))}
                  </div>
                </div>
                <span className="text-[10.5px] font-semibold text-gray-500 dark:text-gray-400">More</span>
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Promo strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mx-4 mb-4 rounded-2xl overflow-hidden relative"
          style={{ background: 'linear-gradient(125deg,#6366f1 0%,#8b5cf6 45%,#a78bfa 100%)', padding: '14px 16px' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 30, bottom: -30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider inline-block mb-1" style={{ background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)', padding: '2px 8px', borderRadius: 999 }}>🎉 Promo</span>
              <p className="text-white font-bold text-[13.5px]" style={{ letterSpacing: '-0.01em' }}>Zero fees on transfers</p>
              <p className="text-purple-200 text-[11px] mt-0.5">Send money for free this week only</p>
            </div>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/transfer', { state: { action: 'transfer' } })}
              className="flex-shrink-0 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '8px 14px', borderRadius: 12, letterSpacing: '0.01em' }}>
              Send now →
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <MoreModal isOpen={moreOpen} onClose={() => setMoreOpen(false)} onSelect={handleService} />
    </>
  );
};

export default QuickActions;