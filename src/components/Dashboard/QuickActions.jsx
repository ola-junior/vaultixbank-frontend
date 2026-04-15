import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaPaperPlane, FaDownload, FaUpload, FaMobileAlt,
  FaWifi, FaTv, FaGamepad, FaHandHoldingUsd,
  FaShoppingCart, FaUtensils, FaBolt, FaWater,
  FaGraduationCap, FaPlane, FaHospital, FaEllipsisH,
  FaTimes, FaCreditCard, FaTicketAlt, FaMoneyBillWave,
  FaChevronRight, FaExchangeAlt, FaHistory
} from 'react-icons/fa';
import { MdSportsSoccer, MdLocalGroceryStore, MdOutlineChildCare } from 'react-icons/md';
import { GiTakeMyMoney } from 'react-icons/gi';

// Service definitions
const ALL_SERVICES = [
  // Row 1 — always visible
  { id: 'airtime', label: 'Airtime', icon: FaMobileAlt, gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', shadow: 'rgba(99,102,241,0.35)', route: '/bills/airtime', color: '#8b5cf6' },
  { id: 'data', label: 'Data', icon: FaWifi, gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)', shadow: 'rgba(59,130,246,0.35)', route: '/bills/data', color: '#3b82f6' },
  { id: 'betting', label: 'Betting', icon: MdSportsSoccer, gradient: 'linear-gradient(135deg, #10b981, #059669)', shadow: 'rgba(16,185,129,0.35)', route: '/bills/betting', color: '#10b981' },
  { id: 'tv', label: 'TV', icon: FaTv, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', shadow: 'rgba(245,158,11,0.35)', route: '/bills/tv', color: '#f59e0b' },
  // Row 2 — always visible
  { id: 'gwealth', label: 'GWealth', icon: FaMoneyBillWave, gradient: 'linear-gradient(135deg, #ec4899, #db2777)', shadow: 'rgba(236,72,153,0.35)', route: '/savings', color: '#ec4899' },
  { id: 'loan', label: 'Loan', icon: GiTakeMyMoney, gradient: 'linear-gradient(135deg, #f97316, #ea580c)', shadow: 'rgba(249,115,22,0.35)', route: '/loans', color: '#f97316' },
  { id: 'play4achild', label: 'Play4aChild', icon: MdOutlineChildCare, gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)', shadow: 'rgba(20,184,166,0.35)', route: '/play4achild', color: '#14b8a6' },
  { id: 'history', label: 'History', icon: FaHistory, gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', shadow: 'rgba(139,92,246,0.35)', route: '/transactions', color: '#8b5cf6' },
  // More button
  { id: 'more', label: 'More', icon: FaEllipsisH, gradient: 'linear-gradient(135deg, #64748b, #475569)', shadow: 'rgba(100,116,139,0.35)', route: null, color: '#64748b', isMore: true },
  // Extra services
  { id: 'electricity', label: 'Electricity', icon: FaBolt, gradient: 'linear-gradient(135deg, #eab308, #ca8a04)', shadow: 'rgba(234,179,8,0.35)', route: '/bills/electricity', color: '#eab308' },
  { id: 'water', label: 'Water', icon: FaWater, gradient: 'linear-gradient(135deg, #06b6d4, #0284c7)', shadow: 'rgba(6,182,212,0.35)', route: '/bills/water', color: '#06b6d4' },
  { id: 'education', label: 'Education', icon: FaGraduationCap, gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', shadow: 'rgba(139,92,246,0.35)', route: '/bills/education', color: '#8b5cf6' },
  { id: 'flights', label: 'Flights', icon: FaPlane, gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', shadow: 'rgba(59,130,246,0.35)', route: '/bills/flights', color: '#3b82f6' },
  { id: 'insurance', label: 'Insurance', icon: FaHospital, gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', shadow: 'rgba(239,68,68,0.35)', route: '/bills/insurance', color: '#ef4444' },
  { id: 'shopping', label: 'Shopping', icon: MdLocalGroceryStore, gradient: 'linear-gradient(135deg, #10b981, #047857)', shadow: 'rgba(16,185,129,0.35)', route: '/bills/shopping', color: '#10b981' },
  { id: 'gaming', label: 'Gaming', icon: FaGamepad, gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)', shadow: 'rgba(168,85,247,0.35)', route: '/bills/gaming', color: '#a855f7' },
  { id: 'events', label: 'Events', icon: FaTicketAlt, gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)', shadow: 'rgba(244,63,94,0.35)', route: '/bills/events', color: '#f43f5e' },
];

const VISIBLE_SERVICES = ALL_SERVICES.slice(0, 7);
const EXTRA_SERVICES = ALL_SERVICES.slice(9);
const MORE_BTN = ALL_SERVICES.find(s => s.isMore);

// Service Tile Component
const ServiceTile = ({ service, onClick, compact = false }) => {
  const [pressed, setPressed] = useState(false);
  const Icon = service.icon;
  const size = compact ? 36 : 44;

  return (
    <motion.button
      type="button"
      whileHover={{ y: -3, scale: 1.04 }}
      whileTap={{ scale: 0.93 }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={() => onClick(service)}
      className="flex flex-col items-center gap-2 group focus:outline-none"
    >
      <div
        style={{
          width: size + 8, height: size + 8, borderRadius: 18,
          background: service.gradient,
          boxShadow: pressed ? `0 2px 8px ${service.shadow}` : `0 6px 18px ${service.shadow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'box-shadow 0.2s', position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'rgba(255,255,255,0.15)', borderRadius: '18px 18px 50% 50%', pointerEvents: 'none' }} />
        <Icon style={{ color: '#fff', fontSize: compact ? 16 : 20, position: 'relative' }} />
      </div>
      <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-center leading-tight max-w-[56px]">
        {service.label}
      </span>
    </motion.button>
  );
};

// More Modal Component
const MoreModal = ({ isOpen, onClose, onSelect }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }} transition={{ type: 'spring', stiffness: 320, damping: 30 }} className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" /></div>
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
            <div><h3 className="text-base font-bold text-gray-900 dark:text-white">All Services</h3><p className="text-xs text-gray-500 dark:text-gray-400">Pay bills, buy services & more</p></div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><FaTimes className="text-xs" /></button>
          </div>
          <div className="p-5 grid grid-cols-4 gap-y-6 gap-x-2">
            {EXTRA_SERVICES.map((svc, i) => (
              <motion.div key={svc.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex justify-center">
                <ServiceTile service={svc} onClick={onSelect} compact />
              </motion.div>
            ))}
          </div>
          <div className="h-6" />
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// Live routes that actually work
const LIVE_ROUTES = ['/transfer', '/transactions', '/bills/airtime', '/bills/data'];

const handleServiceClick = (service, navigate, setMoreOpen) => {
  if (service.isMore) { setMoreOpen(true); return; }
  if (!service.route) { toast('Coming soon!', { icon: '🚀' }); return; }
  if (LIVE_ROUTES.includes(service.route)) { navigate(service.route); }
  else { toast(`${service.label} — Coming soon!`, { icon: '🚀', style: { background: '#1e293b', color: '#f1f5f9', borderRadius: '12px' } }); }
};

// Main QuickActions Component
const QuickActions = () => {
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const onClick = (service) => handleServiceClick(service, navigate, setMoreOpen);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="text-sm font-bold text-gray-800 dark:text-white tracking-tight">Quick Actions</h2>
          <button onClick={() => setMoreOpen(true)} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors">
            See all <FaChevronRight className="text-[9px]" />
          </button>
        </div>

        {/* Top 4 quick-action buttons */}
        <div className="grid grid-cols-4 gap-2 px-4 pt-2 pb-4 border-b border-gray-100 dark:border-gray-700">
          {[
            { label: 'Send', icon: FaPaperPlane, gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', shadow: 'rgba(99,102,241,0.35)', action: () => navigate('/transfer', { state: { action: 'transfer' } }) },
            { label: 'Receive', icon: FaDownload, gradient: 'linear-gradient(135deg,#10b981,#059669)', shadow: 'rgba(16,185,129,0.35)', action: () => toast('Share your account number to receive money.', { icon: '📋', duration: 4000 }) },
            { label: 'Deposit', icon: FaCreditCard, gradient: 'linear-gradient(135deg,#3b82f6,#06b6d4)', shadow: 'rgba(59,130,246,0.35)', action: () => navigate('/transfer', { state: { action: 'deposit' } }) },
            { label: 'Withdraw', icon: FaUpload, gradient: 'linear-gradient(135deg,#f97316,#ef4444)', shadow: 'rgba(249,115,22,0.35)', action: () => navigate('/transfer', { state: { action: 'withdraw' } }) },
          ].map((btn) => (
            <motion.button key={btn.label} type="button" whileHover={{ y: -2, scale: 1.04 }} whileTap={{ scale: 0.92 }} onClick={btn.action} className="flex flex-col items-center gap-2 focus:outline-none">
              <div style={{ width: 48, height: 48, borderRadius: 16, background: btn.gradient, boxShadow: `0 6px 18px ${btn.shadow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'rgba(255,255,255,0.15)', borderRadius: '16px 16px 50% 50%', pointerEvents: 'none' }} />
                <btn.icon style={{ color: '#fff', fontSize: 18, position: 'relative' }} />
              </div>
              <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{btn.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Bills & Services grid */}
        <div className="px-4 pt-4 pb-5">
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Bills & Services</p>
          <div className="grid grid-cols-4 gap-y-5 gap-x-1">
            {VISIBLE_SERVICES.map(svc => <div key={svc.id} className="flex justify-center"><ServiceTile service={svc} onClick={onClick} /></div>)}
            <div className="flex justify-center"><ServiceTile service={MORE_BTN} onClick={onClick} /></div>
          </div>
        </div>
      </motion.div>

      <MoreModal isOpen={moreOpen} onClose={() => setMoreOpen(false)} onSelect={(svc) => { setMoreOpen(false); handleServiceClick(svc, navigate, setMoreOpen); }} />
    </>
  );
};

export default QuickActions;