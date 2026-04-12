import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfileImageUrl, getUserInitials } from '../utils/imageUrl';
import { 
  FaShieldAlt, 
  FaBolt, 
  FaGlobe, 
  FaChartLine, 
  FaCreditCard,
  FaArrowRight,
  FaStar,
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaTachometerAlt,
  FaCheckCircle,
  FaPlay,
  FaApple,
  FaGooglePlay,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaQuoteRight,
  FaMoneyBillWave,
  FaMobileAlt,
  FaChevronLeft,
  FaChevronRight,
  FaLock,
  FaUsers,
  FaGlobeAmericas,
  FaShieldVirus,
  FaFingerprint,
  FaChartPie,
  FaSun,
  FaMoon,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { motion, useInView } from 'framer-motion';
import { getProfileImageUrl, getUserInitials } from '../utils/imageUrl';
import toast from 'react-hot-toast';

const Landing = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Refs for animations
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);
  const securityRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });
  const statsInView = useInView(statsRef, { once: true });
  const testimonialsInView = useInView(testimonialsRef, { once: true });
  const ctaInView = useInView(ctaRef, { once: true });
  const securityInView = useInView(securityRef, { once: true });

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const features = [
    {
      icon: FaBolt,
      title: 'Instant Transfers',
      description: 'Send and receive money instantly to any bank account in Nigeria with zero hidden fees.',
      iconBg: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FaShieldAlt,
      title: 'Bank-Grade Security',
      description: 'Your money is protected with 256-bit encryption, biometric login, and real-time fraud detection.',
      iconBg: 'from-indigo-500 to-purple-500',
    },
    {
      icon: FaChartPie,
      title: 'Smart Analytics',
      description: 'Track your spending habits with AI-powered insights and personalized financial recommendations.',
      iconBg: 'from-pink-500 to-rose-500',
    },
    {
      icon: FaGlobeAmericas,
      title: 'Global Access',
      description: 'Bank from anywhere in the world with our secure mobile app and web platform.',
      iconBg: 'from-emerald-500 to-teal-500',
    },
    {
      icon: FaMoneyBillWave,
      title: 'High-Yield Savings',
      description: 'Earn up to 15% annual interest on your savings with our flexible savings plans.',
      iconBg: 'from-amber-500 to-orange-500',
    },
    {
      icon: FaMobileAlt,
      title: 'Virtual Cards',
      description: 'Create virtual dollar and naira cards for secure online shopping and subscriptions.',
      iconBg: 'from-purple-500 to-violet-500',
    },
  ];

  const stats = [
    { value: '2.5M+', label: 'Happy Customers', icon: FaUsers },
    { value: '₦150B+', label: 'Transactions', icon: FaChartLine },
    { value: '99.9%', label: 'Uptime', icon: FaShieldAlt },
    { value: '15%', label: 'Interest Rate', icon: FaMoneyBillWave },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Business Owner',
      content: 'Vaultix has completely transformed how I manage my business finances. The instant transfers are a game-changer!',
      rating: 5,
      image: 'https://i.pravatar.cc/150?img=1',
      verified: true,
    },
    {
      name: 'Michael Okonkwo',
      role: 'Software Engineer',
      content: 'The security features give me peace of mind. I can send money knowing my funds are 100% protected.',
      rating: 5,
      image: 'https://i.pravatar.cc/150?img=2',
      verified: true,
    },
    {
      name: 'Amina Bello',
      role: 'Student',
      content: 'I love the savings feature! I\'ve been able to save more money in 3 months than I did all of last year.',
      rating: 5,
      image: 'https://i.pravatar.cc/150?img=3',
      verified: true,
    },
  ];

  const securityFeatures = [
    { icon: FaShieldVirus, title: 'Fraud Detection AI', description: 'Real-time monitoring' },
    { icon: FaFingerprint, title: 'Biometric Login', description: 'Face ID & Touch ID' },
    { icon: FaLock, title: '256-bit Encryption', description: 'Military-grade security' },
    { icon: FaShieldAlt, title: 'Multi-Signature', description: 'Dual authorization' },
  ];

  const partners = [
    { name: 'Mastercard', logo: '💳' },
    { name: 'Visa', logo: '💳' },
    { name: 'Verve', logo: '💳' },
    { name: 'CBN', logo: '🏦' },
    { name: 'NDIC', logo: '🛡️' },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const handleDemoClick = () => {
    toast.success('Demo video coming soon!');
  };

  const handleAppStoreClick = () => {
    toast.success('App Store link coming soon!');
  };

  const handleGooglePlayClick = () => {
    toast.success('Google Play link coming soon!');
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                  <FaCreditCard className="text-white text-lg md:text-2xl" />
                </div>
              </div>
              <span className="ml-3 text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Vaultix
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a>
              <a href="#security" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Security</a>
              <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Testimonials</a>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <FaSun className="text-base md:text-lg" />
                ) : (
                  <FaMoon className="text-base md:text-lg" />
                )}
              </button>

              {/* Desktop Auth Section */}
              <div className="hidden md:flex items-center space-x-3">
                {isAuthenticated && user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                        {getProfileImageUrl(user?.profilePicture) ? (
                          <img 
                            src={getProfileImageUrl(user.profilePicture)}
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-base">{getUserInitials(user?.name)}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.name?.split(' ')[0] || 'User'}
                      </span>
                    </button>

                    {showDropdown && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-40 overflow-hidden">
                          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                          </div>
                          
                          <div className="py-1">
                            {[
                              { to: '/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
                              { to: '/profile', icon: FaUser, label: 'Profile' },
                              { to: '/settings', icon: FaCog, label: 'Settings' },
                            ].map((item) => (
                              <Link
                                key={item.to}
                                to={item.to}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setShowDropdown(false)}
                              >
                                <item.icon className="mr-3 text-gray-400" />
                                {item.label}
                              </Link>
                            ))}
                          </div>
                          
                          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                            <button
                              onClick={handleLogout}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <FaSignOutAlt className="mr-3" />
                              Logout
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
                      <span className="relative inline-flex items-center px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold shadow-lg">
                        Open Account
                        <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <FaTimes className="text-xl" />
                ) : (
                  <FaBars className="text-xl" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700"
            >
              <nav className="flex flex-col space-y-2">
                <a 
                  href="#features" 
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#security" 
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Security
                </a>
                <a 
                  href="#testimonials" 
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Testimonials
                </a>
                
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-4 py-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FaTachometerAlt className="mr-3 text-gray-400" />
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FaUser className="mr-3 text-gray-400" />
                        Profile
                      </Link>
                      <button
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <FaSignOutAlt className="mr-3" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col space-y-2 px-2">
                      <Link
                        to="/login"
                        className="px-4 py-2 text-center text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        className="px-4 py-2 text-center bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Open Account
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-24 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-900/20"></div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/30 rounded-full opacity-40 blur-3xl"
          />
          <motion.div 
            animate={{ scale: [1.2, 1, 1.2], rotate: [45, 0, 45] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200 dark:bg-blue-900/30 rounded-full opacity-40 blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div 
            variants={staggerChildren}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 backdrop-blur-sm rounded-full px-4 py-2 mb-6 md:mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trusted by 2.5M+ Nigerians
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 leading-tight">
                Bank Smarter,{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Live Better
                </span>
              </h1>
              
              <p className="text-base md:text-xl text-gray-600 dark:text-gray-400 mb-6 md:mb-8 leading-relaxed">
                Join millions who trust Vaultix for instant transfers, high-yield savings, 
                and smart financial management.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
                <Link to="/register" className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl md:rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl md:rounded-2xl font-semibold shadow-2xl text-base md:text-lg w-full sm:w-auto">
                    Get Started Free
                    <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <button 
                  onClick={handleDemoClick}
                  className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl md:rounded-2xl font-semibold border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-600 dark:hover:border-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
                >
                  <FaPlay className="mr-2 text-indigo-600" />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center gap-4 md:gap-8">
                <div className="flex -space-x-2 md:-space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/50?img=${i}`}
                      alt=""
                      className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 md:border-3 border-white dark:border-gray-900"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400 text-xs md:text-sm" />
                    ))}
                    <span className="ml-2 font-semibold text-sm md:text-base text-gray-900 dark:text-white">4.9/5</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    From 50,000+ reviews
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Content - App Mockup */}
            <motion.div variants={fadeInUp} className="relative">
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-3xl p-1 shadow-2xl">
                  <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl p-6 md:p-8">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full"></div>
                        <div>
                          <div className="w-20 md:w-24 h-2 md:h-3 bg-white/30 rounded-full mb-1"></div>
                          <div className="w-14 md:w-16 h-1.5 md:h-2 bg-white/20 rounded-full"></div>
                        </div>
                      </div>
                      <FaCreditCard className="text-white/70 text-xl md:text-2xl" />
                    </div>
                    
                    <div className="mb-4 md:mb-6">
                      <p className="text-white/60 text-xs md:text-sm mb-1">Available Balance</p>
                      <p className="text-3xl md:text-4xl font-bold text-white">₦245,000.00</p>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-4 md:mb-6">
                      {['Send', 'Request', 'Pay', 'More'].map((action) => (
                        <button key={action} className="p-2 md:p-3 bg-white/10 rounded-xl text-white text-xs md:text-sm font-medium hover:bg-white/20 transition-colors">
                          {action}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2 md:space-y-3">
                      <div className="flex items-center justify-between p-2 md:p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <FaArrowRight className="text-green-400 transform rotate-180 text-sm md:text-base" />
                          </div>
                          <div>
                            <p className="text-white text-xs md:text-sm font-medium">Salary Deposit</p>
                            <p className="text-white/40 text-[10px] md:text-xs">Today, 10:30 AM</p>
                          </div>
                        </div>
                        <span className="text-green-400 text-xs md:text-sm font-semibold">+₦150,000</span>
                      </div>
                      <div className="flex items-center justify-between p-2 md:p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                            <FaArrowRight className="text-red-400 text-sm md:text-base" />
                          </div>
                          <div>
                            <p className="text-white text-xs md:text-sm font-medium">Shopping</p>
                            <p className="text-white/40 text-[10px] md:text-xs">Yesterday</p>
                          </div>
                        </div>
                        <span className="text-red-400 text-xs md:text-sm font-semibold">-₦25,500</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Partners */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="relative max-w-7xl mx-auto mt-16 md:mt-20 pt-8 md:pt-12 border-t border-gray-200 dark:border-gray-800"
        >
          <p className="text-center text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-6 md:mb-8">
            Trusted by leading financial institutions
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            {partners.map((partner, index) => (
              <div key={index} className="text-2xl md:text-3xl opacity-50 hover:opacity-100 transition-opacity">
                {partner.logo}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={staggerChildren}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="text-center mb-12 md:mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
              Powerful Features for{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Modern Banking
              </span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Everything you need to manage your finances, all in one place
            </motion.p>
          </motion.div>

          <motion.div 
            variants={staggerChildren}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${feature.iconBg} rounded-xl md:rounded-2xl flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="text-white text-xl md:text-2xl" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" ref={securityRef} className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={staggerChildren}
            initial="hidden"
            animate={securityInView ? "visible" : "hidden"}
            className="text-center mb-12 md:mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Bank-Grade
              </span>{' '}
              Security
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Your assets are protected by the most advanced security infrastructure
            </motion.p>
          </motion.div>

          <motion.div 
            variants={staggerChildren}
            initial="hidden"
            animate={securityInView ? "visible" : "hidden"}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-xl md:rounded-2xl p-4 md:p-6 text-center border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg">
                  <feature.icon className="text-white text-lg md:text-xl" />
                </div>
                <h4 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={staggerChildren}
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center text-white"
              >
                <div className="inline-flex p-3 md:p-4 bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl mb-4 md:mb-6">
                  <stat.icon className="text-2xl md:text-3xl" />
                </div>
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold mb-1 md:mb-2">
                  {stat.value}
                </div>
                <p className="text-white/80 text-sm md:text-lg">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" ref={testimonialsRef} className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={staggerChildren}
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            className="text-center mb-12 md:mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
              What Our{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Customers
              </span>{' '}
              Say
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Join millions of satisfied customers who trust Vaultix
            </motion.p>
          </motion.div>

          <div className="relative">
            <motion.div 
              key={currentTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-xl max-w-4xl mx-auto"
            >
              <div className="flex items-center gap-1 mb-3 md:mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-sm md:text-base" />
                ))}
              </div>
              <FaQuoteRight className="text-3xl md:text-4xl text-indigo-200 dark:text-indigo-900 mb-3 md:mb-4" />
              <p className="text-gray-600 dark:text-gray-300 text-base md:text-xl leading-relaxed mb-4 md:mb-6">
                "{testimonials[currentTestimonial].content}"
              </p>
              <div className="flex items-center gap-3 md:gap-4">
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-900"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                      {testimonials[currentTestimonial].name}
                    </p>
                    {testimonials[currentTestimonial].verified && (
                      <FaCheckCircle className="text-blue-500 text-xs md:text-sm" />
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    {testimonials[currentTestimonial].role}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Navigation Buttons */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 lg:-translate-x-12 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FaChevronLeft className="text-gray-600 dark:text-gray-400 text-sm md:text-base" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 lg:translate-x-12 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FaChevronRight className="text-gray-600 dark:text-gray-400 text-sm md:text-base" />
            </button>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6 md:mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-2 md:h-2.5 rounded-full transition-all duration-300 ${
                    currentTestimonial === index
                      ? 'bg-indigo-600 w-6 md:w-8'
                      : 'bg-gray-300 dark:bg-gray-600 w-2 md:w-2.5 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={ctaInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl md:rounded-4xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-8 md:p-12 lg:p-16 shadow-2xl"
          >
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
                Ready to Transform Your Banking?
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto">
                Join over 2.5 million Nigerians who are already banking smarter with Vaultix.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-white text-indigo-600 rounded-xl md:rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-xl text-base md:text-lg"
                >
                  Open Your Free Account
                  <FaArrowRight className="ml-2" />
                </Link>
                <div className="flex gap-3 md:gap-4 justify-center">
                  <button 
                    onClick={handleAppStoreClick}
                    className="inline-flex items-center justify-center px-5 md:px-6 py-3 md:py-4 bg-black/20 backdrop-blur-sm text-white rounded-xl md:rounded-2xl font-semibold hover:bg-black/30 transition-all duration-200 text-sm md:text-base"
                  >
                    <FaApple className="text-xl md:text-2xl mr-2" />
                    App Store
                  </button>
                  <button 
                    onClick={handleGooglePlayClick}
                    className="inline-flex items-center justify-center px-5 md:px-6 py-3 md:py-4 bg-black/20 backdrop-blur-sm text-white rounded-xl md:rounded-2xl font-semibold hover:bg-black/30 transition-all duration-200 text-sm md:text-base"
                  >
                    <FaGooglePlay className="text-xl md:text-2xl mr-2" />
                    Google Play
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8 md:mb-12">
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <FaCreditCard className="text-white text-xl" />
                </div>
                <span className="ml-2 text-2xl font-bold text-white">Vaultix</span>
              </div>
              <p className="text-gray-400 mb-6 text-sm md:text-base">
                Modern banking for the digital age. Secure, fast, and reliable.
              </p>
              <div className="flex space-x-4">
                {[FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaYoutube].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-colors">
                    <Icon className="text-gray-400 hover:text-white text-lg" />
                  </a>
                ))}
              </div>
            </div>
            
            {['Products', 'Company', 'Resources'].map((section, i) => (
              <div key={i}>
                <h4 className="font-semibold mb-4 text-base md:text-lg">{section}</h4>
                <ul className="space-y-2 text-gray-400 text-sm md:text-base">
                  {['Personal', 'Business', 'Developer', 'Pricing'].map((item, j) => (
                    <li key={j}>
                      <a href="#" className="hover:text-white transition-colors">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-xs md:text-sm text-center md:text-left">
              © 2024 Vaultix. All rights reserved.
            </p>
            <div className="flex space-x-4 md:space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-xs md:text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-xs md:text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-xs md:text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .rounded-4xl {
          border-radius: 2rem;
        }
      `}</style>
    </div>
  );
};

export default Landing;