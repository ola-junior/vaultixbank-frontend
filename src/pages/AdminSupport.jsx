import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  FaTicketAlt, FaCheck, FaSpinner, FaReply, FaSearch,
  FaFilter, FaUser, FaEnvelope, FaCalendarAlt, FaTag,
  FaChevronDown, FaTimes, FaPaperPlane, FaSignOutAlt,
  FaShieldAlt, FaChartBar, FaInbox, FaClock
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// Admin emails - must match backend
const ADMIN_EMAILS = ['yxngalhaji02@gmail.com'];

const AdminSupport = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);

  // Check if user is admin
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/dashboard');
      return;
    }
    fetchTickets();
  }, [statusFilter, searchTerm, isAdmin, navigate]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
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
      toast.success(`Ticket marked as ${newStatus.replace('_', ' ')}`);
      fetchTickets();
    } catch (err) {
      toast.error('Failed to update status');
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
      toast.success('Reply sent!');
      setReply('');
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: '#3b82f6',
      in_progress: '#f59e0b',
      resolved: '#10b981',
      closed: '#64748b'
    };
    return colors[status] || '#64748b';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      urgent: '#dc2626'
    };
    return colors[priority] || '#64748b';
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaShieldAlt className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-500 dark:text-gray-400">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Admin Support Panel
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage all support tickets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full font-medium">
            {user?.email}
          </span>
          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total || 0, color: '#6366f1' },
          { label: 'Open', value: stats.open || 0, color: '#3b82f6' },
          { label: 'In Progress', value: stats.in_progress || 0, color: '#f59e0b' },
          { label: 'Resolved', value: stats.resolved || 0, color: '#10b981' },
          { label: 'Closed', value: stats.closed || 0, color: '#64748b' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3">
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
          <button
            onClick={fetchTickets}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <FaSpinner className="animate-spin text-3xl text-indigo-500" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <FaInbox className="text-5xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <motion.div
              key={ticket._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              {/* Ticket Header */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                        #{ticket.ticketId}
                      </span>
                      <span 
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ 
                          backgroundColor: getPriorityColor(ticket.priority) + '20',
                          color: getPriorityColor(ticket.priority)
                        }}
                      >
                        {ticket.priority?.toUpperCase() || 'MEDIUM'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <FaUser className="text-gray-400" />
                        {ticket.name}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <FaEnvelope className="text-gray-400" />
                        {ticket.email}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <FaCalendarAlt className="text-gray-400" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                      {ticket.subject}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {ticket.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.ticketId, e.target.value)}
                      className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-gray-50 dark:bg-gray-700 dark:text-white"
                      style={{ borderColor: getStatusColor(ticket.status) }}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button
                      onClick={() => setSelectedTicket(selectedTicket === ticket.ticketId ? null : ticket.ticketId)}
                      className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                      <FaReply className="text-xs" />
                    </button>
                  </div>
                </div>

                {/* Replies History */}
                {ticket.replies?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      Replies ({ticket.replies.length})
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {ticket.replies.map((r, i) => (
                        <div key={i} className={`text-sm p-3 rounded-lg ${r.isAdmin ? 'bg-indigo-50 dark:bg-indigo-900/20 ml-4' : 'bg-gray-50 dark:bg-gray-700/50 mr-4'}`}>
                          <p className="text-gray-700 dark:text-gray-300">{r.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {r.repliedBy} · {new Date(r.repliedAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Input */}
              <AnimatePresence>
                {selectedTicket === ticket.ticketId && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 p-4"
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAdminReply(ticket.ticketId)}
                        placeholder="Type your reply as admin..."
                        className="flex-1 px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleAdminReply(ticket.ticketId)}
                        disabled={sending || !reply.trim()}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                        Send
                      </button>
                      <button
                        onClick={() => setSelectedTicket(null)}
                        className="px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSupport;