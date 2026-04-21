import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  FaTicketAlt, FaCheck, FaSpinner, FaReply, FaSearch,
  FaUser, FaEnvelope, FaCalendarAlt, FaTag,
  FaTimes, FaPaperPlane, FaSignOutAlt,
  FaShieldAlt, FaInbox, FaClock, FaChevronRight,
  FaExclamationCircle, FaCheckCircle, FaSync,
  FaArrowUp, FaArrowDown, FaEye, FaTrash, FaArchive,
  FaHeadset, FaChartPie, FaUsers, FaComments
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

// Admin emails - must match backend
const ADMIN_EMAILS = ['yxngalhaji02@gmail.com'];

// Status configurations
const STATUS_CONFIG = {
  open: { 
    label: 'Open', 
    color: '#3b82f6', 
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: FaExclamationCircle 
  },
  in_progress: { 
    label: 'In Progress', 
    color: '#f59e0b', 
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: FaSync 
  },
  resolved: { 
    label: 'Resolved', 
    color: '#10b981', 
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: FaCheckCircle 
  },
  closed: { 
    label: 'Closed', 
    color: '#64748b', 
    bg: 'bg-slate-50 dark:bg-slate-900/20',
    border: 'border-slate-200 dark:border-slate-800',
    icon: FaArchive 
  },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#10b981' },
  medium: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#ef4444' },
  urgent: { label: 'Urgent', color: '#dc2626' },
};

const AdminSupport = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const searchTimeout = useRef(null);

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/dashboard');
      return;
    }
    fetchTickets();
  }, [statusFilter, priorityFilter, sortBy, isAdmin, navigate]);

  useEffect(() => {
    // Debounced search
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchTickets();
    }, 500);
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (sortBy) params.append('sort', sortBy);
      
      const res = await api.get(`/support/admin/tickets?${params.toString()}`);
      setTickets(res.data.data || []);
      setStats(res.data.stats || {});
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Admin access required');
        navigate('/dashboard');
      } else {
        toast.error('Failed to load tickets');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await api.put(`/support/admin/tickets/${ticketId}`, { status: newStatus });
      toast.success(`Ticket marked as ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
      fetchTickets();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handlePriorityChange = async (ticketId, newPriority) => {
    try {
      await api.put(`/support/admin/tickets/${ticketId}`, { priority: newPriority });
      toast.success(`Priority updated to ${PRIORITY_CONFIG[newPriority]?.label}`);
      fetchTickets();
    } catch (err) {
      toast.error('Failed to update priority');
    }
  };

  const handleAdminReply = async (ticketId) => {
    if (!reply.trim()) {
      toast.error('Please enter a reply');
      return;
    }
    
    setSending(true);
    try {
      await api.post(`/support/admin/tickets/${ticketId}/reply`, { message: reply });
      toast.success('Reply sent successfully!');
      setReply('');
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/support/admin/tickets/${ticketId}`);
      toast.success('Ticket deleted successfully');
      fetchTickets();
      if (selectedTicket === ticketId) setSelectedTicket(null);
      if (expandedTicket === ticketId) setExpandedTicket(null);
    } catch (err) {
      toast.error('Failed to delete ticket');
    }
  };

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md"
        >
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaShieldAlt className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You don't have permission to view the admin panel.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaHeadset className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Support Admin
                  <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs rounded-full font-medium">
                    Admin
                  </span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Manage and respond to customer support tickets
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3"
        >
          {[
            { label: 'Total Tickets', value: stats.total || 0, color: '#6366f1', icon: FaTicketAlt },
            { label: 'Open', value: stats.open || 0, color: '#3b82f6', icon: FaExclamationCircle },
            { label: 'In Progress', value: stats.in_progress || 0, color: '#f59e0b', icon: FaSync },
            { label: 'Resolved', value: stats.resolved || 0, color: '#10b981', icon: FaCheckCircle },
            { label: 'Closed', value: stats.closed || 0, color: '#64748b', icon: FaArchive },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="text-lg" style={{ color: stat.color }} />
                <span className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, subject, or ticket ID..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority</option>
              </select>
              <button
                onClick={fetchTickets}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <FaSync className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tickets List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <FaSpinner className="animate-spin text-4xl text-indigo-500" />
          </div>
        ) : tickets.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-16 text-center shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaInbox className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tickets found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'All caught up! No pending support tickets.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket, index) => {
              const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
              const priorityCfg = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
              const isExpanded = expandedTicket === ticket.ticketId;
              const StatusIcon = statusCfg.icon;
              
              return (
                <motion.div
                  key={ticket._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all ${
                    isExpanded ? 'border-indigo-300 dark:border-indigo-700 shadow-md' : 'border-gray-100 dark:border-gray-700'
                  }`}
                >
                  {/* Ticket Summary Row */}
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Priority Indicator */}
                      <div 
                        className="w-1 self-stretch rounded-full flex-shrink-0"
                        style={{ backgroundColor: priorityCfg.color }}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <span className="font-mono text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                            {ticket.ticketId}
                          </span>
                          
                          <span 
                            className="px-2 py-1 rounded-full text-[10px] font-bold"
                            style={{ 
                              backgroundColor: priorityCfg.color + '15',
                              color: priorityCfg.color
                            }}
                          >
                            {priorityCfg.label}
                          </span>
                          
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${statusCfg.bg} ${statusCfg.border}`}>
                            <StatusIcon style={{ color: statusCfg.color, fontSize: 8 }} />
                            <span style={{ color: statusCfg.color }}>{statusCfg.label}</span>
                          </span>
                          
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <FaUser className="text-gray-400" />
                            {ticket.name}
                          </span>
                          
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <FaClock className="text-gray-400" />
                            {getTimeAgo(ticket.createdAt)}
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                          {ticket.subject}
                        </h3>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {ticket.message}
                        </p>
                        
                        {/* Replies Preview */}
                        {ticket.replies?.length > 0 && (
                          <div className="mt-3 flex items-center gap-2">
                            <FaComments className="text-gray-400 text-xs" />
                            <span className="text-xs text-gray-500">
                              {ticket.replies.length} {ticket.replies.length === 1 ? 'reply' : 'replies'}
                            </span>
                            {ticket.replies.some(r => !r.isAdmin) && (
                              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" title="Customer replied" />
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setExpandedTicket(isExpanded ? null : ticket.ticketId)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          <FaChevronRight className={`text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-gray-100 dark:border-gray-700"
                      >
                        <div className="p-5 bg-gray-50 dark:bg-gray-800/50 space-y-4">
                          {/* Ticket Details Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customer</p>
                              <p className="font-medium text-gray-900 dark:text-white">{ticket.name}</p>
                              <p className="text-xs text-gray-500">{ticket.email}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</p>
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs">
                                <FaTag className="text-gray-400" />
                                {ticket.category || 'General'}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {new Date(ticket.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Updated</p>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {new Date(ticket.updatedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          {/* Admin Controls */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <select
                              value={ticket.status}
                              onChange={(e) => handleStatusChange(ticket.ticketId, e.target.value)}
                              className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-white"
                            >
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                            
                            <select
                              value={ticket.priority || 'medium'}
                              onChange={(e) => handlePriorityChange(ticket.ticketId, e.target.value)}
                              className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-white"
                            >
                              <option value="low">Low Priority</option>
                              <option value="medium">Medium Priority</option>
                              <option value="high">High Priority</option>
                              <option value="urgent">Urgent</option>
                            </select>
                            
                            <button
                              onClick={() => handleDeleteTicket(ticket.ticketId)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm transition-colors flex items-center gap-1"
                            >
                              <FaTrash className="text-xs" />
                              Delete
                            </button>
                          </div>
                          
                          {/* Replies Thread */}
                          {ticket.replies?.length > 0 && (
                            <div className="space-y-3">
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Conversation History
                              </p>
                              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                {/* Original Message */}
                                <div className="flex gap-3 justify-end">
                                  <div className="max-w-[80%]">
                                    <div className="bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-3">
                                      <p className="text-sm">{ticket.message}</p>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 text-right">
                                      {ticket.name} · {getTimeAgo(ticket.createdAt)}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Replies */}
                                {ticket.replies.map((r, i) => (
                                  <div key={i} className={`flex gap-3 ${r.isAdmin ? 'justify-start' : 'justify-end'}`}>
                                    {r.isAdmin && (
                                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                                        <FaHeadset className="text-white text-xs" />
                                      </div>
                                    )}
                                    <div className={`max-w-[80%] ${r.isAdmin ? 'order-2' : ''}`}>
                                      <div className={`rounded-2xl px-4 py-3 ${
                                        r.isAdmin
                                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                                          : 'bg-indigo-600 text-white rounded-br-sm'
                                      }`}>
                                        {r.isAdmin && (
                                          <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                                            Vaultix Support
                                          </p>
                                        )}
                                        <p className="text-sm">{r.message}</p>
                                      </div>
                                      <p className="text-[10px] text-gray-400 mt-1">
                                        {getTimeAgo(r.repliedAt || r.createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Reply Input */}
                          <div className="flex gap-2 pt-2">
                            <input
                              type="text"
                              value={selectedTicket === ticket.ticketId ? reply : ''}
                              onChange={(e) => {
                                setReply(e.target.value);
                                setSelectedTicket(ticket.ticketId);
                              }}
                              onFocus={() => setSelectedTicket(ticket.ticketId)}
                              placeholder="Type your reply..."
                              className="flex-1 px-4 py-3 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                              onClick={() => handleAdminReply(ticket.ticketId)}
                              disabled={sending || (selectedTicket !== ticket.ticketId ? false : !reply.trim())}
                              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                              {sending && selectedTicket === ticket.ticketId ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaPaperPlane />
                              )}
                              Send
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupport;