import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    FaHeadset, FaEnvelope, FaPhone, FaMapMarkerAlt,
    FaQuestionCircle, FaPaperPlane, FaSpinner,
    FaCheckCircle, FaChevronRight, FaClock,
    FaInstagram, FaTwitter, FaFacebook, FaLinkedin,
    FaYoutube, FaWhatsapp, FaTelegram, FaGlobe,
    FaUser, FaTimes, FaCopy, FaStar,
    FaCreditCard, FaMoneyBillWave, FaTicketAlt,
    FaExclamationCircle, FaChevronDown, FaReply,
    FaInbox, FaShieldAlt, FaTag, FaCalendarAlt,
    FaArrowLeft, FaSearch, FaFilter, FaBolt
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────────────────────

const CONTACT_INFO = {
    email: 'yxngalhaji02@gmail.com',
    phone: '+234 707 402 4165',
    whatsapp: '2347074024165',
    whatsappDisplay: '+234 707 402 4165',
    address: '123 Victoria Island, Lagos, Nigeria',
    hours: '24/7 Customer Support',
};

const SOCIAL_LINKS = [
    { icon: FaInstagram, url: 'https://instagram.com/vaultixbank', color: '#E4405F', name: 'Instagram' },
    { icon: FaTwitter, url: 'https://twitter.com/vaultixbank', color: '#1DA1F2', name: 'Twitter' },
    { icon: FaFacebook, url: 'https://facebook.com/vaultixbank', color: '#1877F2', name: 'Facebook' },
    { icon: FaLinkedin, url: 'https://linkedin.com/company/vaultixbank', color: '#0A66C2', name: 'LinkedIn' },
    { icon: FaYoutube, url: 'https://youtube.com/@vaultixbank', color: '#FF0000', name: 'YouTube' },
    { icon: FaWhatsapp, url: `https://wa.me/${CONTACT_INFO.whatsapp}`, color: '#25D366', name: 'WhatsApp' },
];

const FAQ_CATEGORIES = [
    {
        category: 'Account', icon: FaUser,
        questions: [
            { q: 'How do I open an account?', a: 'Download the Vaultix app, click "Sign Up", and follow the verification process with your BVN and valid ID.' },
            { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login screen, enter your email, and follow the reset link sent to your inbox.' },
            { q: 'How do I set up 2FA?', a: 'Go to Security settings, click "Enable 2FA", scan the QR code with Google Authenticator, and enter the verification code.' },
            { q: 'How do I change my PIN?', a: 'Go to the Security page, click "Change PIN", enter your current PIN and set a new one.' },
        ],
    },
    {
        category: 'Transactions', icon: FaPaperPlane,
        questions: [
            { q: 'How long do transfers take?', a: 'Transfers to Vaultix accounts are instant. Transfers to other banks typically take 1–5 minutes.' },
            { q: 'What are the transfer limits?', a: 'Daily limit: ₦1,000,000. Per transaction: ₦500,000. Upgrade your account for higher limits.' },
            { q: 'How do I check my transaction status?', a: 'Go to the Transactions page to view all your transaction history and current status.' },
            { q: 'Can I cancel a transfer?', a: 'Once a transfer is initiated, it cannot be cancelled. Please double-check recipient details before sending.' },
        ],
    },
    {
        category: 'Cards', icon: FaCreditCard,
        questions: [
            { q: 'How do I create a virtual card?', a: 'Go to Cards page, click "Create Card", select "Virtual Card", set your PIN, and fund your card.' },
            { q: 'How do I fund my card?', a: 'Select your card, click "Fund Card", enter the amount, and confirm with your transaction PIN.' },
            { q: 'What if my card is lost or stolen?', a: 'Immediately freeze your card from the Cards page or contact our 24/7 support line.' },
            { q: 'Are there fees for virtual cards?', a: 'Virtual cards are free to create. A small maintenance fee of ₦100/month applies.' },
        ],
    },
    {
        category: 'Loans', icon: FaMoneyBillWave,
        questions: [
            { q: 'How do I qualify for a loan?', a: 'Loan eligibility is based on your account age, transaction history, and current balance.' },
            { q: 'When do I need to repay?', a: 'Repayment is due on the date specified in your loan agreement, typically 30–180 days.' },
            { q: 'What happens if I miss a payment?', a: 'Late payments may incur penalties and affect your credit score. Contact support immediately for assistance.' },
        ],
    },
];

const TICKET_STATUSES = {
    open: { label: 'Open', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', dot: '#3b82f6' },
    in_progress: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', dot: '#f59e0b' },
    resolved: { label: 'Resolved', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', dot: '#10b981' },
    closed: { label: 'Closed', color: '#64748b', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.3)', dot: '#64748b' },
};

const CATEGORIES = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'account', label: 'Account Issue' },
    { value: 'transaction', label: 'Transaction Problem' },
    { value: 'card', label: 'Card Issue' },
    { value: 'loan', label: 'Loan Inquiry' },
    { value: 'security', label: 'Security Concern' },
    { value: 'feedback', label: 'Feedback / Suggestion' },
];

const QUICK_REPLIES = [
    'How do I transfer money?',
    'Reset my password',
    'Check my balance',
    'Report a problem',
    'Card issues',
    'Loan application',
];

const BOT_RESPONSES = (input) => {
    const i = input.toLowerCase();
    if (i.includes('transfer') || i.includes('send')) return 'To transfer money: Go to the Transfer page, enter recipient details, amount, and your PIN. Transfers are instant! 💸';
    if (i.includes('password') || i.includes('reset')) return 'Reset your password by clicking "Forgot Password" on the login screen. Check your email for the reset link! 📧';
    if (i.includes('balance')) return 'Your balance is displayed on the Dashboard. You can refresh to see the latest balance. 💰';
    if (i.includes('card')) return 'For card issues: Create, freeze, or manage your cards from the Cards page. Virtual cards are available instantly! 💳';
    if (i.includes('loan')) return 'We offer Quick Loans up to ₦100,000, Personal Loans up to ₦500,000, and Business Loans up to ₦2,000,000. Apply from the Loans page! 💵';
    if (i.includes('support') || i.includes('help')) return `I'm here to help! You can also email ${CONTACT_INFO.email} or WhatsApp us at ${CONTACT_INFO.whatsappDisplay} for immediate assistance. 📞`;
    if (i.includes('thank')) return "You're welcome! Is there anything else I can help you with? 😊";
    return 'Thanks for your message! A support agent will respond shortly. For urgent issues, please WhatsApp us at ' + CONTACT_INFO.whatsappDisplay + '.';
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const cfg = TICKET_STATUSES[status] || TICKET_STATUSES.open;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
            background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
            {cfg.label}
        </span>
    );
};

const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
};

// ─────────────────────────────────────────────────────────────────────────────
// FAQ Accordion Item
// ─────────────────────────────────────────────────────────────────────────────

const FaqItem = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={`border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden transition-all ${open ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : 'bg-white dark:bg-gray-800'}`}>
            <button
                onClick={() => setOpen(p => !p)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
            >
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 pr-4">{q}</span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <FaChevronDown className={`text-xs flex-shrink-0 ${open ? 'text-indigo-500' : 'text-gray-400'}`} />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <p className="px-4 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Ticket Detail View
// ─────────────────────────────────────────────────────────────────────────────

const TicketDetail = ({ ticket, onBack, onReply }) => {
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [ticket?.replies]);

    const handleSend = async () => {
        if (!reply.trim()) return;
        setSending(true);
        await onReply(ticket._id, reply);
        setReply('');
        setSending(false);
    };

    if (!ticket) return null;
    const status = TICKET_STATUSES[ticket.status] || TICKET_STATUSES.open;

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <FaArrowLeft className="text-xs" />
                </button>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">{ticket.subject}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">#{ticket._id?.slice(-8).toUpperCase() || 'TKT00001'} · {formatDate(ticket.createdAt)}</p>
                </div>
                <StatusBadge status={ticket.status} />
            </div>

            {/* Message thread */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Category info bar */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 flex gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5">
                        <FaTag className="text-indigo-400 text-[10px]" />
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            {CATEGORIES.find(c => c.value === ticket.category)?.label || 'General Inquiry'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <FaCalendarAlt className="text-indigo-400 text-[10px]" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(ticket.createdAt)}</span>
                    </div>
                </div>

                {/* Messages */}
                <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                    {/* Original message */}
                    <div className="flex gap-3 justify-end">
                        <div className="max-w-[80%]">
                            <div className="bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-3">
                                <p className="text-sm leading-relaxed">{ticket.message}</p>
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right">{formatTime(ticket.createdAt)}</p>
                        </div>
                    </div>

                    {/* Replies */}
                    {ticket.replies?.map((r, i) => (
                        <div key={i} className={`flex gap-3 ${r.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {r.from === 'support' && (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                                    <FaHeadset style={{ color: '#fff', fontSize: 11 }} />
                                </div>
                            )}
                            <div className="max-w-[80%]">
                                <div className={`rounded-2xl px-4 py-3 ${r.from === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-sm'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                                    }`}>
                                    {r.from === 'support' && <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 mb-1">Vaultix Support</p>}
                                    <p className="text-sm leading-relaxed">{r.message}</p>
                                </div>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{formatTime(r.createdAt)}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* Reply input */}
                {ticket.status !== 'closed' && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={reply}
                                onChange={e => setReply(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                placeholder="Type your reply…"
                                className="flex-1 px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                            <button onClick={handleSend} disabled={sending || !reply.trim()}
                                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center gap-2">
                                {sending ? <FaSpinner className="animate-spin text-sm" /> : <FaPaperPlane className="text-sm" />}
                            </button>
                        </div>
                    </div>
                )}
                {ticket.status === 'closed' && (
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">This ticket is closed. Open a new ticket if you need further assistance.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const Contact = () => {
    const { user } = useAuth();

    // UI state
    const [activeTab, setActiveTab] = useState('contact');
    const [showChat, setShowChat] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [ticketFilter, setTicketFilter] = useState('all');
    const [ticketSearch, setTicketSearch] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);

    // Data state
    const [formData, setFormData] = useState({ subject: '', message: '', category: 'general' });
    const [myTickets, setMyTickets] = useState([]);
    const [ticketStats, setTicketStats] = useState({});
    const [replyLoading, setReplyLoading] = useState(false);

    // Chat state
    const [chatMessages, setChatMessages] = useState([
        { type: 'bot', text: `👋 Hello${user?.name ? `, ${user.name.split(' ')[0]}` : ''}! Welcome to Vaultix Support. How can I help you today?`, time: new Date() },
    ]);
    const [chatInput, setChatInput] = useState('');
    const chatBottomRef = useRef(null);

    // Tabs definition
    const TABS = [
        { id: 'contact', label: 'Contact Us', icon: FaEnvelope },
        { id: 'tickets', label: 'My Tickets', icon: FaTicketAlt },
        { id: 'faq', label: 'FAQ', icon: FaQuestionCircle },
        { id: 'about', label: 'About Us', icon: FaGlobe },
    ];

    // ── Fetch data ────────────────────────────────────────────────────────────
    useEffect(() => {
        fetchMyTickets();
        fetchTicketStats();
    }, []);

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const fetchMyTickets = async () => {
        try {
            const res = await api.get('/support/tickets');
            if (res.data.success) setMyTickets(res.data.data || []);
        } catch { /* silently fail — user may not have tickets */ }
    };

    const fetchTicketStats = async () => {
        try {
            const res = await api.get('/support/stats');
            if (res.data.success) setTicketStats(res.data.data || {});
        } catch { /* silently fail */ }
    };

    // ── Submit support form ───────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.subject.trim() || !formData.message.trim()) {
            toast.error('Please fill in all fields'); return;
        }
        setLoading(true);
        try {
            await api.post('/support/contact', { ...formData, email: user?.email, name: user?.name });
            setSubmitted(true);
            toast.success("Message sent! We'll respond within 24 hours.");
            setFormData({ subject: '', message: '', category: 'general' });
            fetchMyTickets(); // refresh tickets after submitting
        } catch {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Reply to ticket ───────────────────────────────────────────────────────
    const handleReply = async (ticketId, message) => {
        setReplyLoading(true);
        try {
            await api.post(`/support/tickets/${ticketId}/reply`, { message });
            toast.success('Reply sent!');
            await fetchMyTickets();
            // Update selected ticket
            const updated = myTickets.find(t => t._id === ticketId);
            if (updated) setSelectedTicket(updated);
        } catch {
            toast.error('Failed to send reply.');
        } finally {
            setReplyLoading(false);
        }
    };

    // ── Chat ──────────────────────────────────────────────────────────────────
    const sendChatMessage = (text) => {
        if (!text.trim()) return;
        setChatMessages(prev => [...prev, { type: 'user', text, time: new Date() }]);
        setChatInput('');
        setTimeout(() => {
            setChatMessages(prev => [...prev, { type: 'bot', text: BOT_RESPONSES(text), time: new Date() }]);
        }, 900);
    };

    // ── Copy helpers ──────────────────────────────────────────────────────────
    const copy = (text, label) => {
        navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied!`));
    };

    // ── Filtered tickets ──────────────────────────────────────────────────────
    const filteredTickets = myTickets.filter(t => {
        const matchStatus = ticketFilter === 'all' || t.status === ticketFilter;
        const matchSearch = !ticketSearch ||
            t.subject?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
            t.category?.toLowerCase().includes(ticketSearch.toLowerCase());
        return matchStatus && matchSearch;
    });

    // ── Stat summary from ticketStats or computed ─────────────────────────────
    const statSummary = {
        total: ticketStats.total ?? myTickets.length,
        open: ticketStats.open ?? myTickets.filter(t => t.status === 'open').length,
        resolved: ticketStats.resolved ?? myTickets.filter(t => t.status === 'resolved').length,
        inProgress: ticketStats.inProgress ?? myTickets.filter(t => t.status === 'in_progress').length,
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-5xl mx-auto space-y-5 pb-24">

            {/* ── Page Header ── */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Help & Support</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">We're here for you, 24 hours a day</p>
            </motion.div>

            {/* ── Quick contact cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { icon: FaHeadset, label: 'Live Chat', sub: 'Instant reply', color: 'from-indigo-500 to-blue-600', action: () => setShowChat(true) },
                    { icon: FaEnvelope, label: 'Email', sub: CONTACT_INFO.email, color: 'from-emerald-500 to-teal-600', action: () => copy(CONTACT_INFO.email, 'Email') },
                    { icon: FaPhone, label: 'Call Us', sub: CONTACT_INFO.phone, color: 'from-orange-500 to-red-500', action: () => copy(CONTACT_INFO.phone, 'Phone number') },
                    { icon: FaWhatsapp, label: 'WhatsApp', sub: CONTACT_INFO.whatsappDisplay, color: 'from-green-500 to-emerald-600', action: () => window.open(`https://wa.me/${CONTACT_INFO.whatsapp}`, '_blank') },
                ].map((item, i) => (
                    <motion.button key={i}
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={item.action}
                        className={`bg-gradient-to-br ${item.color} rounded-2xl p-4 text-white shadow-lg text-left`}
                    >
                        <item.icon className="text-xl mb-2.5 opacity-90" />
                        <p className="text-sm font-bold">{item.label}</p>
                        <p className="text-xs opacity-75 mt-0.5 truncate">{item.sub}</p>
                    </motion.button>
                ))}
            </div>

            {/* ── Tab bar ── */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === tab.id
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <tab.icon className="text-[11px]" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        {tab.id === 'tickets' && myTickets.length > 0 && (
                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                                {myTickets.length > 9 ? '9+' : myTickets.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ══════════════════════════════════════
          CONTACT FORM TAB
      ══════════════════════════════════════ */}
            <AnimatePresence mode="wait">
                {activeTab === 'contact' && (
                    <motion.div key="contact" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                                <h2 className="text-base font-bold text-gray-900 dark:text-white">Send us a message</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">We'll get back to you within 24 hours</p>
                            </div>

                            {submitted ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-6">
                                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                                        <FaCheckCircle className="text-emerald-500 text-2xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Message Sent!</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">We'll get back to you at <span className="font-semibold text-gray-700 dark:text-gray-300">{user?.email}</span> within 24 hours.</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setSubmitted(false)} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                                            Send Another
                                        </button>
                                        <button onClick={() => setActiveTab('tickets')} className="px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                            View My Tickets
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Your Name</label>
                                            <input type="text" value={user?.name || ''} disabled
                                                className="w-full px-3 py-3 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Your Email</label>
                                            <input type="email" value={user?.email || ''} disabled
                                                className="w-full px-3 py-3 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Category</label>
                                        <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                                            className="w-full px-3 py-3 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                                            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Subject</label>
                                        <input type="text" value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                                            placeholder="What can we help you with?"
                                            className="w-full px-3 py-3 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                            required />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Message</label>
                                        <textarea value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                                            rows="5" placeholder="Please describe your issue in detail…"
                                            className="w-full px-3 py-3 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                                            required />
                                        <p className="text-xs text-gray-400 mt-1 text-right">{formData.message.length}/1000</p>
                                    </div>

                                    <div className="flex justify-end">
                                        <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 hover:opacity-90 transition-all disabled:opacity-50">
                                            {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane className="text-xs" />}
                                            Send Message
                                        </motion.button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ══════════════════════════════════════
            MY TICKETS TAB
        ══════════════════════════════════════ */}
                {activeTab === 'tickets' && (
                    <motion.div key="tickets" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

                        {selectedTicket ? (
                            <TicketDetail
                                ticket={selectedTicket}
                                onBack={() => setSelectedTicket(null)}
                                onReply={handleReply}
                            />
                        ) : (
                            <>
                                {/* Stats row */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { label: 'Total Tickets', value: statSummary.total, color: '#6366f1' },
                                        { label: 'Open', value: statSummary.open, color: '#3b82f6' },
                                        { label: 'In Progress', value: statSummary.inProgress, color: '#f59e0b' },
                                        { label: 'Resolved', value: statSummary.resolved, color: '#10b981' },
                                    ].map((s, i) => (
                                        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm text-center">
                                            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{s.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Search + filter */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 relative">
                                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                        <input type="text" value={ticketSearch} onChange={e => setTicketSearch(e.target.value)}
                                            placeholder="Search tickets…"
                                            className="w-full pl-8 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all" />
                                    </div>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {['all', 'open', 'in_progress', 'resolved', 'closed'].map(s => (
                                            <button key={s} onClick={() => setTicketFilter(s)}
                                                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${ticketFilter === s
                                                    ? 'bg-indigo-600 text-white shadow-md'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    }`}>
                                                {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Ticket list */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                                    {filteredTickets.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
                                            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                                                <FaInbox className="text-gray-400 text-xl" />
                                            </div>
                                            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">No tickets found</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
                                                {myTickets.length === 0
                                                    ? "You haven't raised any support tickets yet. Send us a message from the Contact tab!"
                                                    : 'Try changing your filter or search term.'}
                                            </p>
                                            {myTickets.length === 0 && (
                                                <button onClick={() => setActiveTab('contact')}
                                                    className="mt-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors">
                                                    Contact Support
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {/* Table header */}
                                            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50/70 dark:bg-gray-700/30">
                                                {['Ticket', 'Category', 'Date', 'Status'].map(h => (
                                                    <p key={h} className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{h}</p>
                                                ))}
                                            </div>

                                            {filteredTickets.map((ticket, i) => (
                                                <motion.button key={ticket._id || i}
                                                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.04 }}
                                                    onClick={() => setSelectedTicket(ticket)}
                                                    className="w-full text-left px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors group"
                                                >
                                                    <div className="grid sm:grid-cols-[1fr_auto_auto_auto] gap-3 sm:gap-4 items-center">
                                                        {/* Subject + replies */}
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                {ticket.subject}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                                                    {ticket.message?.slice(0, 60)}{ticket.message?.length > 60 ? '…' : ''}
                                                                </p>
                                                                {ticket.replies?.length > 0 && (
                                                                    <span className="flex items-center gap-1 text-[10px] text-indigo-500 font-semibold flex-shrink-0">
                                                                        <FaReply className="text-[9px]" /> {ticket.replies.length}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {/* Category */}
                                                        <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                                                            {CATEGORIES.find(c => c.value === ticket.category)?.label || 'General'}
                                                        </p>
                                                        {/* Date */}
                                                        <p className="hidden sm:block text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                                                            {formatDate(ticket.createdAt)}
                                                        </p>
                                                        {/* Status */}
                                                        <div className="flex items-center gap-2">
                                                            <StatusBadge status={ticket.status} />
                                                            <FaChevronRight className="text-gray-300 dark:text-gray-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {/* ══════════════════════════════════════
            FAQ TAB
        ══════════════════════════════════════ */}
                {activeTab === 'faq' && (
                    <motion.div key="faq" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                        {FAQ_CATEGORIES.map((cat, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                                        <cat.icon className="text-indigo-600 dark:text-indigo-400 text-sm" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{cat.category}</h3>
                                    <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{cat.questions.length} questions</span>
                                </div>
                                <div className="p-3 space-y-1.5">
                                    {cat.questions.map((item, j) => <FaqItem key={j} q={item.q} a={item.a} />)}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* ══════════════════════════════════════
            ABOUT US TAB
        ══════════════════════════════════════ */}
                {activeTab === 'about' && (
                    <motion.div key="about" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                        {/* Hero card */}
                        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-8 text-white text-center shadow-xl relative overflow-hidden">
                            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FaGlobe className="text-white text-2xl" />
                                </div>
                                <h2 className="text-2xl font-black mb-1">Vaultix Bank</h2>
                                <p className="text-white/70 text-sm">Banking Made Simple for Every Nigerian</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed text-center">
                                Vaultix is a modern digital bank committed to making financial services accessible, secure, and convenient for everyone in Nigeria. We offer savings, loans, bill payments, virtual cards, and seamless money transfers — all from one beautiful app.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Active Users', value: '2.5M+', icon: '👥' },
                                { label: 'Transactions', value: '₦150B+', icon: '💸' },
                                { label: 'Uptime', value: '99.9%', icon: '⚡' },
                                { label: 'Support', value: '24/7', icon: '🛡️' },
                            ].map((s, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 text-center">
                                    <p className="text-2xl mb-1">{s.icon}</p>
                                    <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{s.value}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Social links */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 text-center">Follow Us</h4>
                            <div className="flex justify-center gap-3 flex-wrap">
                                {SOCIAL_LINKS.map((s, i) => (
                                    <motion.a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                                        whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}
                                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md transition-shadow hover:shadow-lg"
                                        style={{ background: s.color }}
                                        title={s.name}>
                                        <s.icon className="text-lg" />
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        {/* Contact info */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Contact Information</h4>
                            <div className="space-y-3">
                                {[
                                    { icon: FaMapMarkerAlt, label: 'Address', value: CONTACT_INFO.address, copy: false },
                                    { icon: FaEnvelope, label: 'Email', value: CONTACT_INFO.email, copy: true },
                                    { icon: FaPhone, label: 'Phone', value: CONTACT_INFO.phone, copy: true },
                                    { icon: FaWhatsapp, label: 'WhatsApp', value: CONTACT_INFO.whatsappDisplay, copy: true },
                                    { icon: FaClock, label: 'Hours', value: CONTACT_INFO.hours, copy: false },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                                            <item.icon className="text-indigo-600 dark:text-indigo-400 text-sm" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">{item.label}</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">{item.value}</p>
                                        </div>
                                        {item.copy && (
                                            <button onClick={() => copy(item.value, item.label)}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                                                <FaCopy className="text-xs" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══════════════════════════════════════
          LIVE CHAT WIDGET
      ══════════════════════════════════════ */}
            <AnimatePresence>
                {showChat && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="fixed bottom-24 right-4 sm:right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
                    >
                        {/* Chat header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                                        <FaHeadset className="text-white text-base" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Vaultix Support</h4>
                                        <p className="text-[11px] text-white/80 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />
                                            Online · Replies instantly
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setShowChat(false)}
                                    className="w-7 h-7 bg-white/15 hover:bg-white/25 rounded-lg flex items-center justify-center text-white transition-colors">
                                    <FaTimes className="text-xs" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-800/50">
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.type === 'bot' && (
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                                            <FaBolt style={{ color: '#fff', fontSize: 9 }} />
                                        </div>
                                    )}
                                    <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm ${msg.type === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-sm'
                                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-600'
                                        }`}>
                                        {msg.text}
                                        <p className="text-[10px] opacity-60 mt-1">{msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatBottomRef} />
                        </div>

                        {/* Quick replies */}
                        <div className="px-3 pt-2 pb-1 border-t border-gray-100 dark:border-gray-700 flex gap-1.5 flex-wrap">
                            {QUICK_REPLIES.slice(0, 3).map((r, i) => (
                                <button key={i} onClick={() => sendChatMessage(r)}
                                    className="text-[11px] px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
                                    {r}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex gap-2">
                                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendChatMessage(chatInput)}
                                    placeholder="Type a message…"
                                    className="flex-1 px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                                <motion.button whileTap={{ scale: 0.95 }} onClick={() => sendChatMessage(chatInput)}
                                    disabled={!chatInput.trim()}
                                    className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                                    <FaPaperPlane className="text-xs" />
                                </motion.button>
                            </div>
                            <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                                Or WhatsApp us at <a href={`https://wa.me/${CONTACT_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 font-semibold hover:underline">{CONTACT_INFO.whatsappDisplay}</a>
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Floating chat button ── */}
            {!showChat && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowChat(true)}
                    className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full shadow-xl flex items-center justify-center text-white"
                >
                    <FaHeadset className="text-xl" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                </motion.button>
            )}
        </div>
    );
};

export default Contact;