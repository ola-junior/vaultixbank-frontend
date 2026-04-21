import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  FaHeadset, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaQuestionCircle, FaPaperPlane, FaSpinner,
  FaCheckCircle, FaChevronRight, FaClock,
  FaInstagram, FaTwitter, FaFacebook, FaLinkedin,
  FaYoutube, FaWhatsapp, FaTelegram, FaGlobe,
  FaUser, FaComment, FaTimes, FaCopy, FaStar,
  FaCreditCard, FaMoneyBillWave
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';

const Contact = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState('contact');
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general'
  });
  const [submitted, setSubmitted] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: '👋 Hello! Welcome to Vaultix Support. How can I help you today?', time: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');

  const contactInfo = {
    email: 'support@vaultixbank.com',
    phone: '+234 800 123 4567',
    whatsapp: '+234 800 123 4567',
    address: '123 Victoria Island, Lagos, Nigeria',
    hours: '24/7 Customer Support'
  };

  const socialLinks = [
    { icon: FaInstagram, url: 'https://instagram.com/vaultixbank', color: '#E4405F', name: 'Instagram' },
    { icon: FaTwitter, url: 'https://twitter.com/vaultixbank', color: '#1DA1F2', name: 'Twitter' },
    { icon: FaFacebook, url: 'https://facebook.com/vaultixbank', color: '#1877F2', name: 'Facebook' },
    { icon: FaLinkedin, url: 'https://linkedin.com/company/vaultixbank', color: '#0A66C2', name: 'LinkedIn' },
    { icon: FaYoutube, url: 'https://youtube.com/@vaultixbank', color: '#FF0000', name: 'YouTube' },
  ];

  const faqCategories = [
    {
      category: 'Account',
      icon: FaUser,
      questions: [
        { q: 'How do I open an account?', a: 'Download the Vaultix app, click "Sign Up", and follow the verification process with your BVN and valid ID.' },
        { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login screen, enter your email, and follow the reset link sent to your inbox.' },
        { q: 'How do I set up 2FA?', a: 'Go to Security settings, click "Enable 2FA", scan the QR code with Google Authenticator, and enter the verification code.' },
        { q: 'How do I change my PIN?', a: 'Go to Security page, click "Change PIN", enter your current PIN and new PIN.' },
      ]
    },
    {
      category: 'Transactions',
      icon: FaPaperPlane,
      questions: [
        { q: 'How long do transfers take?', a: 'Transfers to Vaultix accounts are instant. Transfers to other banks typically take 1-5 minutes.' },
        { q: 'What are the transfer limits?', a: 'Daily limit: ₦1,000,000. Per transaction: ₦500,000. Upgrade your account for higher limits.' },
        { q: 'How do I check my transaction status?', a: 'Go to the Transactions page to view all your transaction history and current status.' },
        { q: 'Can I cancel a transfer?', a: 'Once a transfer is initiated, it cannot be cancelled. Please double-check recipient details before sending.' },
      ]
    },
    {
      category: 'Cards',
      icon: FaCreditCard,
      questions: [
        { q: 'How do I create a virtual card?', a: 'Go to Cards page, click "Create Card", select "Virtual Card", set your PIN, and fund your card.' },
        { q: 'How do I fund my card?', a: 'Select your card, click "Fund Card", enter the amount, and confirm with your transaction PIN.' },
        { q: 'What if my card is lost or stolen?', a: 'Immediately freeze your card from the Cards page or contact our 24/7 support line.' },
        { q: 'Are there fees for virtual cards?', a: 'Virtual cards are free to create! Only a small maintenance fee of ₦100/month applies.' },
      ]
    },
    {
      category: 'Loans',
      icon: FaMoneyBillWave,
      questions: [
        { q: 'How do I qualify for a loan?', a: 'Loan eligibility is based on your account age, transaction history, and current balance.' },
        { q: 'When do I need to repay?', a: 'Repayment is due on the date specified in your loan agreement, typically 30-180 days.' },
        { q: 'What happens if I miss a payment?', a: 'Late payments may incur penalties and affect your credit score. Contact support for assistance.' },
      ]
    }
  ];

  const quickReplies = [
    'How do I transfer money?',
    'Reset my password',
    'Check my balance',
    'Report a problem',
    'Card issues',
    'Loan application'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/support/contact', {
        ...formData,
        email: user?.email,
        name: user?.name
      });
      setSubmitted(true);
      toast.success('Message sent! We\'ll respond within 24 hours.');
      setFormData({ subject: '', message: '', category: 'general' });
    } catch (err) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;

    const userMessage = { type: 'user', text: chatInput, time: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    setTimeout(() => {
      let response = '';
      const input = chatInput.toLowerCase();
      
      if (input.includes('transfer') || input.includes('send')) {
        response = 'To transfer money: Go to Transfer page, enter recipient details, amount, and your PIN. Transfers are instant! 💸';
      } else if (input.includes('password') || input.includes('reset')) {
        response = 'Reset your password by clicking "Forgot Password" on the login screen. Check your email for the reset link! 📧';
      } else if (input.includes('balance')) {
        response = 'Your balance is displayed on the Dashboard. You can also refresh the page to see updated balance! 💰';
      } else if (input.includes('card')) {
        response = 'For card issues: You can create, freeze, or manage your cards from the Cards page. Virtual cards are available instantly! 💳';
      } else if (input.includes('loan')) {
        response = 'We offer Quick Loans up to ₦100,000, Personal Loans up to ₦500,000, and Business Loans up to ₦2,000,000. Apply from the Loans page! 💵';
      } else if (input.includes('support') || input.includes('help')) {
        response = 'I\'m here to help! You can also email support@vaultixbank.com or call +234 800 123 4567 for immediate assistance. 📞';
      } else if (input.includes('thank')) {
        response = 'You\'re welcome! Is there anything else I can help you with? 😊';
      } else {
        response = 'Thanks for your message! A support agent will respond shortly. For urgent issues, please call +234 800 123 4567.';
      }

      setChatMessages(prev => [...prev, { type: 'bot', text: response, time: new Date() }]);
    }, 1000);
  };

  const handleQuickReply = (reply) => {
    setChatMessages(prev => [...prev, { type: 'user', text: reply, time: new Date() }]);
    
    setTimeout(() => {
      let response = '';
      if (reply.includes('transfer')) {
        response = 'To transfer money: Go to Transfer page, enter recipient details, amount, and your PIN. Transfers are instant! 💸';
      } else if (reply.includes('password')) {
        response = 'Reset your password by clicking "Forgot Password" on the login screen. Check your email for the reset link! 📧';
      } else if (reply.includes('balance')) {
        response = 'Your balance is displayed on the Dashboard. You can also refresh the page to see updated balance! 💰';
      } else if (reply.includes('problem')) {
        response = 'I\'m sorry you\'re experiencing issues. Please describe the problem and I\'ll help resolve it, or call +234 800 123 4567 for immediate support. 🔧';
      } else if (reply.includes('Card')) {
        response = 'For card issues: You can create, freeze, or manage your cards from the Cards page. Virtual cards are available instantly! 💳';
      } else if (reply.includes('Loan')) {
        response = 'We offer loans from ₦5,000 to ₦2,000,000 with flexible repayment terms. Apply now from the Loans page! 💵';
      }

      setChatMessages(prev => [...prev, { type: 'bot', text: response, time: new Date() }]);
    }, 800);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(contactInfo.email);
    toast.success('Email copied!');
  };

  const copyPhone = () => {
    navigator.clipboard.writeText(contactInfo.phone);
    toast.success('Phone number copied!');
  };

  // ✅ REMOVED the duplicate icon definitions that were causing the error

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Help & Support
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          We're here to help you 24/7
        </p>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: FaHeadset, label: 'Live Chat', value: 'Available 24/7', color: 'from-indigo-500 to-blue-500', action: () => setShowChat(true) },
          { icon: FaEnvelope, label: 'Email Us', value: contactInfo.email, color: 'from-emerald-500 to-teal-500', action: copyEmail },
          { icon: FaPhone, label: 'Call Us', value: contactInfo.phone, color: 'from-orange-500 to-red-500', action: copyPhone },
          { icon: FaWhatsapp, label: 'WhatsApp', value: contactInfo.whatsapp, color: 'from-green-500 to-emerald-500', action: () => window.open(`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`, '_blank') },
        ].map((item, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={item.action}
            className={`bg-gradient-to-br ${item.color} rounded-2xl p-5 text-white shadow-xl text-left hover:scale-[1.02] transition-transform`}
          >
            <item.icon className="text-2xl mb-3 opacity-90" />
            <p className="font-semibold">{item.label}</p>
            <p className="text-sm opacity-90 truncate">{item.value}</p>
          </motion.button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'contact', label: 'Contact Us', icon: FaEnvelope },
          { id: 'faq', label: 'FAQ', icon: FaQuestionCircle },
          { id: 'about', label: 'About Us', icon: FaGlobe },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <tab.icon className="text-sm" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contact Form */}
      {activeTab === 'contact' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-green-500 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Thank you for contacting us. We'll get back to you within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="general">General Inquiry</option>
                  <option value="account">Account Issue</option>
                  <option value="transaction">Transaction Problem</option>
                  <option value="card">Card Issue</option>
                  <option value="loan">Loan Inquiry</option>
                  <option value="security">Security Concern</option>
                  <option value="feedback">Feedback/Suggestion</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="What can we help you with?"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows="5"
                  placeholder="Please describe your issue in detail..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
                  required
                />
              </div>

              <div className="flex justify-end">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                  Send Message
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      )}

      {/* FAQ */}
      {activeTab === 'faq' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {faqCategories.map((cat, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <cat.icon className="text-indigo-600 dark:text-indigo-400 text-lg" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{cat.category}</h3>
              </div>
              <div className="space-y-3">
                {cat.questions.map((item, j) => (
                  <details key={j} className="group">
                    <summary className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{item.q}</span>
                      <FaChevronRight className="text-gray-400 text-xs group-open:rotate-90 transition-transform" />
                    </summary>
                    <p className="px-3 pb-3 text-gray-500 dark:text-gray-400 text-sm">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* About Us */}
      {activeTab === 'about' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg space-y-6"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FaGlobe className="text-white text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vaultix Bank</h2>
            <p className="text-gray-500 dark:text-gray-400">Banking Made Simple</p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Vaultix is a modern digital bank committed to making financial services accessible, 
              secure, and convenient for everyone. We offer savings, loans, bill payments, 
              virtual cards, and seamless money transfers.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Users', value: '50K+' },
              { label: 'Transactions', value: '₦5B+' },
              { label: 'Countries', value: '10+' },
              { label: 'Support', value: '24/7' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">Follow Us</h4>
            <div className="flex justify-center gap-4">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: social.color }}
                >
                  <social.icon className="text-xl" />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <FaMapMarkerAlt className="text-indigo-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">{contactInfo.address}</p>
              </div>
              <div>
                <FaEnvelope className="text-indigo-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">{contactInfo.email}</p>
              </div>
              <div>
                <FaPhone className="text-indigo-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">{contactInfo.phone}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Live Chat Widget */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 md:right-8 z-50 w-[380px] max-w-[calc(100vw-32px)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <FaHeadset className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold">Vaultix Support</h4>
                    <p className="text-xs opacity-90 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Online • Replies instantly
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.type === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-[10px] opacity-70 mt-1">
                      {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
              {quickReplies.slice(0, 3).map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickReply(reply)}
                  className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleChatSend}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl"
                >
                  <FaPaperPlane />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      {!showChat && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-4 md:right-8 z-50 w-14 h-14 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full shadow-lg flex items-center justify-center text-white"
        >
          <FaHeadset className="text-xl" />
        </motion.button>
      )}
    </div>
  );
};

export default Contact;