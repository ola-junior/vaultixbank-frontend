import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfileImageUrl, getUserInitials } from '../utils/imageUrl';
import { 
  FaShieldAlt, FaBolt, FaChartLine, FaCreditCard,
  FaArrowRight, FaStar, FaUser, FaSignOutAlt, FaCog,
  FaTachometerAlt, FaCheckCircle, FaApple, FaGooglePlay,
  FaTwitter, FaFacebook, FaInstagram, FaLinkedin,
  FaQuoteRight, FaMoneyBillWave, FaMobileAlt,
  FaChevronLeft, FaChevronRight, FaLock, FaUsers,
  FaGlobeAmericas, FaShieldVirus, FaFingerprint,
  FaChartPie, FaSun, FaMoon, FaBars, FaTimes,
  FaPlay, FaCheck, FaArrowUp, FaPause, FaStepForward, FaStepBackward
} from 'react-icons/fa';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Interactive Demo Component
const InteractiveDemo = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState(0);

  const DEMO_SLIDES = [
    {
      id: 1,
      title: "Welcome to Vaultix",
      description: "The future of Nigerian banking - secure, instant, and rewarding",
      icon: "🏦",
      gradient: "from-indigo-600 to-blue-600",
      feature: "Modern Digital Banking"
    },
    {
      id: 2,
      title: "Beautiful Dashboard",
      description: "View your balance, recent transactions, and financial insights at a glance",
      icon: "📊",
      gradient: "from-emerald-600 to-teal-600",
      feature: "Real-time Analytics"
    },
    {
      id: 3,
      title: "Instant Money Transfer",
      description: "Send money to any Nigerian bank instantly with zero fees",
      icon: "💸",
      gradient: "from-blue-600 to-cyan-600",
      feature: "Lightning Fast",
      steps: ["Enter recipient", "Add amount", "Confirm with PIN", "Done!"]
    },
    {
      id: 4,
      title: "Pay Bills Easily",
      description: "Airtime, data, electricity, TV subscriptions - all in one place",
      icon: "📱",
      gradient: "from-purple-600 to-pink-600",
      feature: "50+ Billers",
      categories: ["Airtime", "Data", "Electricity", "TV", "Water", "Education"]
    },
    {
      id: 5,
      title: "Smart ATM Cards",
      description: "Virtual and physical cards with instant freeze/unfreeze",
      icon: "💳",
      gradient: "from-orange-600 to-red-600",
      feature: "Total Control"
    },
    {
      id: 6,
      title: "High-Yield Savings",
      description: "Earn up to 15% interest on your savings with flexible plans",
      icon: "💰",
      gradient: "from-amber-600 to-yellow-600",
      feature: "Best Rates in Nigeria",
      stats: ["15% APY", "Daily Interest", "No Lock-in"]
    },
    {
      id: 7,
      title: "Bank-Grade Security",
      description: "2FA, biometric login, and 256-bit encryption protect your money",
      icon: "🔒",
      gradient: "from-red-600 to-pink-600",
      feature: "Military-Grade Protection"
    },
    {
      id: 8,
      title: "Ready to Get Started?",
      description: "Join 2.5M+ Nigerians banking smarter with Vaultix",
      icon: "✨",
      gradient: "from-indigo-600 to-purple-600",
      feature: "Open Account in 5 Minutes",
      cta: "Sign Up Now"
    }
  ];

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % DEMO_SLIDES.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, DEMO_SLIDES.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setDirection(-1);
        setCurrentSlide((prev) => (prev - 1 + DEMO_SLIDES.length) % DEMO_SLIDES.length);
        setIsPlaying(false);
      } else if (e.key === 'ArrowRight') {
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % DEMO_SLIDES.length);
        setIsPlaying(false);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [DEMO_SLIDES.length, onClose]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % DEMO_SLIDES.length);
    setIsPlaying(false);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + DEMO_SLIDES.length) % DEMO_SLIDES.length);
    setIsPlaying(false);
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0
    })
  };

  const slide = DEMO_SLIDES[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <FaTimes />
        </button>

        {/* Main content area */}
        <div className={`relative h-[500px] bg-gradient-to-br ${slide.gradient} overflow-hidden`}>
          {/* Animated background patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          {/* Floating icons background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-white/10 text-4xl"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * 500,
                  rotate: 0
                }}
                animate={{
                  y: [null, -30, 30, -30],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 10 + i,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
              >
                {slide.icon}
              </motion.div>
            ))}
          </div>

          {/* Slide content with animation */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
              className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center p-8"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="text-8xl mb-6 drop-shadow-2xl"
              >
                {slide.icon}
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                {slide.title}
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl text-white/90 max-w-md"
              >
                {slide.description}
              </motion.p>

              {/* Feature-specific content */}
              {slide.steps && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 flex gap-3 flex-wrap justify-center"
                >
                  {slide.steps.map((step, idx) => (
                    <div key={idx} className="bg-white/20 backdrop-blur rounded-full px-4 py-2 text-sm">
                      {idx + 1}. {step}
                    </div>
                  ))}
                </motion.div>
              )}

              {slide.categories && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 grid grid-cols-2 gap-2"
                >
                  {slide.categories.map((cat, idx) => (
                    <div key={idx} className="bg-white/20 backdrop-blur rounded-lg px-3 py-1.5 text-sm">
                      {cat}
                    </div>
                  ))}
                </motion.div>
              )}

              {slide.stats && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 flex gap-6"
                >
                  {slide.stats.map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-2xl font-bold">{stat}</div>
                    </div>
                  ))}
                </motion.div>
              )}

              {slide.cta && (
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => {
                    onClose();
                    window.location.href = '/register';
                  }}
                  className="mt-8 px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
                >
                  {slide.cta}
                </motion.button>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Feature badge */}
          <div className="absolute bottom-4 left-4 z-20 bg-black/50 backdrop-blur rounded-full px-3 py-1 text-xs text-white">
            {slide.feature}
          </div>
        </div>

        {/* Controls bar */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800">
          {/* Progress indicators */}
          <div className="flex gap-1 mb-6">
            {DEMO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentSlide ? 1 : -1);
                  setCurrentSlide(idx);
                  setIsPlaying(false);
                }}
                className={`flex-1 h-1 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'bg-indigo-600 h-1.5'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 shadow-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <FaStepBackward className="text-gray-600 dark:text-gray-300" />
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform"
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 shadow-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <FaStepForward className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Slide counter */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            {currentSlide + 1} / {DEMO_SLIDES.length} • {isPlaying ? 'Auto-playing' : 'Paused'}
          </p>

          {/* Keyboard hints */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
            ← → keys to navigate • ESC to close
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// Main Landing Component
const Landing = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);
  const securityRef = useRef(null);
  const pricingRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });
  const statsInView = useInView(statsRef, { once: true });
  const testimonialsInView = useInView(testimonialsRef, { once: true });
  const ctaInView = useInView(ctaRef, { once: true });
  const securityInView = useInView(securityRef, { once: true });
  const pricingInView = useInView(pricingRef, { once: true });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close demo with ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showDemo) setShowDemo(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDemo]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const features = [
    { icon: FaBolt, title: 'Instant Transfers', description: 'Send and receive money instantly to any Nigerian bank with zero hidden fees and real-time confirmation.', color: 'from-blue-500 to-cyan-500', light: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-800' },
    { icon: FaShieldAlt, title: 'Bank-Grade Security', description: 'Your money is protected with 256-bit encryption, biometric login, and AI-powered fraud detection.', color: 'from-indigo-500 to-purple-500', light: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-800' },
    { icon: FaChartPie, title: 'Smart Analytics', description: 'Track spending habits with AI-powered insights and personalized financial recommendations.', color: 'from-pink-500 to-rose-500', light: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-100 dark:border-pink-800' },
    { icon: FaGlobeAmericas, title: 'Global Access', description: 'Bank from anywhere in the world with our secure mobile app and web platform, 24/7.', color: 'from-emerald-500 to-teal-500', light: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800' },
    { icon: FaMoneyBillWave, title: 'High-Yield Savings', description: 'Earn up to 15% annual interest on your savings with our flexible and transparent savings plans.', color: 'from-amber-500 to-orange-500', light: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-100 dark:border-amber-800' },
    { icon: FaMobileAlt, title: 'Virtual Cards', description: 'Create virtual dollar and naira cards instantly for secure online shopping and subscriptions.', color: 'from-purple-500 to-violet-500', light: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-100 dark:border-purple-800' },
  ];

  const stats = [
    { value: '2.5M+', label: 'Happy Customers', sub: 'Across Nigeria', icon: FaUsers },
    { value: '₦150B+', label: 'Transactions', sub: 'Processed safely', icon: FaChartLine },
    { value: '99.9%', label: 'Uptime', sub: 'Always available', icon: FaShieldAlt },
    { value: '15%', label: 'Interest Rate', sub: 'Annual savings yield', icon: FaMoneyBillWave },
  ];

  const testimonials = [
    { name: 'Sarah Johnson', role: 'Business Owner, Lagos', content: 'Vaultix has completely transformed how I manage my business finances. The instant transfers save me hours every week and the analytics help me understand my cash flow like never before.', rating: 5, image: 'https://i.pravatar.cc/150?img=1' },
    { name: 'Michael Okonkwo', role: 'Software Engineer, Abuja', content: 'The security features are outstanding. I can send large amounts knowing my funds are protected. The biometric login is seamless and the 24/7 support is incredibly responsive.', rating: 5, image: 'https://i.pravatar.cc/150?img=2' },
    { name: 'Amina Bello', role: 'Student, Kano', content: 'I\'ve saved more in 3 months with Vaultix than I did all of last year. The 15% interest rate is real, and the savings tracker keeps me motivated to hit my goals.', rating: 5, image: 'https://i.pravatar.cc/150?img=3' },
    { name: 'Chidi Nwosu', role: 'Entrepreneur, Port Harcourt', content: 'Opening a business account was completely paperless and took less than 10 minutes. The team payroll features have made managing my 30-person team so much simpler.', rating: 5, image: 'https://i.pravatar.cc/150?img=4' },
  ];

  const securityFeatures = [
    { icon: FaShieldVirus, title: 'Fraud Detection AI', description: 'Real-time monitoring on every transaction' },
    { icon: FaFingerprint, title: 'Biometric Login', description: 'Face ID & Touch ID support' },
    { icon: FaLock, title: '256-bit Encryption', description: 'Military-grade data protection' },
    { icon: FaShieldAlt, title: 'Multi-Signature', description: 'Dual authorization on large transfers' },
  ];

  const plans = [
    { name: 'Personal', price: 'Free', desc: 'For individuals getting started', features: ['Instant transfers', 'Virtual debit card', 'Basic analytics', '5% savings rate', '24/7 support'], cta: 'Open Free Account', highlight: false },
    { name: 'Premium', price: '₦2,500/mo', desc: 'For power users and families', features: ['Everything in Personal', 'Up to 15% savings rate', 'Smart budgeting tools', 'Priority support', 'Multiple sub-accounts', 'International transfers'], cta: 'Start Premium', highlight: true },
    { name: 'Business', price: '₦9,999/mo', desc: 'For growing businesses', features: ['Everything in Premium', 'Unlimited team members', 'Payroll management', 'Business analytics', 'API access', 'Dedicated account manager'], cta: 'Go Business', highlight: false },
  ];

  const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
  const staggerChildren = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const profileImageUrl = getProfileImageUrl(user?.profilePicture);

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">

        {/* ── NAVBAR ── */}
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={`fixed top-0 w-full z-50 transition-all duration-300 ${
            isScrolled
              ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-800/50'
              : 'bg-transparent'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              {/* Logo */}
              <Link to="/" className="flex items-center group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity" />
                  <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                    <FaCreditCard className="text-white text-lg" />
                  </div>
                </div>
                <div className="ml-2.5">
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">Vaultix</span>
                  <span className="block text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] -mt-1 font-semibold">Digital Bank</span>
                </div>
              </Link>

              {/* Desktop nav links */}
              <div className="hidden md:flex items-center space-x-1">
                {[['#features', 'Features'], ['#security', 'Security'], ['#pricing', 'Pricing'], ['#testimonials', 'Reviews']].map(([href, label]) => (
                  <a key={href} href={href} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-medium">
                    {label}
                  </a>
                ))}
              </div>

              {/* Right */}
              <div className="flex items-center gap-2">
                <button onClick={toggleDarkMode} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {isDarkMode ? <FaSun className="text-amber-400 text-lg" /> : <FaMoon className="text-indigo-600 text-lg" />}
                </button>

                <div className="hidden md:flex items-center gap-3">
                  {isAuthenticated && user ? (
                    <div className="relative">
                      <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden shadow">
                          {profileImageUrl ? (
                            <img key={user?.profilePicture} src={profileImageUrl} alt={user.name} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                          ) : null}
                          <span className={`text-white text-xs font-bold ${profileImageUrl ? 'hidden' : ''}`}>{getUserInitials(user?.name)}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.name?.split(' ')[0]}</span>
                      </button>
                      <AnimatePresence>
                        {showDropdown && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-40 overflow-hidden">
                              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                              </div>
                              {[{ to: '/dashboard', icon: FaTachometerAlt, label: 'Dashboard' }, { to: '/profile', icon: FaUser, label: 'Profile' }, { to: '/settings', icon: FaCog, label: 'Settings' }].map(item => (
                                <Link key={item.to} to={item.to} onClick={() => setShowDropdown(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                  <item.icon className="mr-3 text-gray-400 text-sm" />{item.label}
                                </Link>
                              ))}
                              <div className="border-t border-gray-200 dark:border-gray-700">
                                <button onClick={handleLogout} className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                  <FaSignOutAlt className="mr-3" />Logout
                                </button>
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <>
                      <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        Sign In
                      </Link>
                      <Link to="/register" className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl blur-md opacity-60 group-hover:opacity-90 transition-opacity" />
                        <span className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg">
                          Open Account <FaArrowRight className="text-xs group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </Link>
                    </>
                  )}
                </div>

                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden pb-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col gap-1 pt-3">
                    {[['#features', 'Features'], ['#security', 'Security'], ['#pricing', 'Pricing'], ['#testimonials', 'Reviews']].map(([href, label]) => (
                      <a key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium">{label}</a>
                    ))}
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                      {isAuthenticated && user ? (
                        <>
                          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm"><FaTachometerAlt className="mr-3 text-gray-400" />Dashboard</Link>
                          <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center w-full px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"><FaSignOutAlt className="mr-3" />Logout</button>
                        </>
                      ) : (
                        <div className="flex flex-col gap-2 px-2">
                          <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 text-center text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-sm">Sign In</Link>
                          <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 text-center bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold text-sm">Open Account</Link>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.nav>

        {/* ── HERO ── */}
        <section ref={heroRef} className="relative pt-28 md:pt-36 pb-20 md:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/30" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-100/60 to-transparent dark:from-indigo-900/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/40 to-transparent dark:from-blue-900/10 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div className="relative max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
              {/* Left */}
              <motion.div variants={staggerChildren} initial="hidden" animate={heroInView ? 'visible' : 'hidden'}>
                <motion.div variants={fadeInUp} className="inline-flex items-center gap-2.5 bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900/50 rounded-full px-4 py-2 mb-8 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Trusted by 2.5M+ Nigerians</span>
                  <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-full uppercase tracking-wide">CBN Licensed</span>
                </motion.div>

                <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-[1.05] tracking-tight mb-6">
                  The future of<br />
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">Nigerian</span>
                  </span>{' '}
                  banking
                </motion.h1>

                <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-8 max-w-lg">
                  Bank smarter with instant transfers, 15% savings rates, AI-powered insights, and bank-grade security — all in one beautiful app.
                </motion.p>

                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 mb-10">
                  <Link to="/register" className="relative group inline-flex">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity" />
                    <span className="relative flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-semibold shadow-2xl text-base w-full sm:w-auto">
                      Get Started — It's Free
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                  <button 
                    onClick={() => setShowDemo(true)} 
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:border-indigo-400 hover:shadow-lg transition-all text-base"
                  >
                    <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                      <FaPlay className="text-indigo-600 dark:text-indigo-400 text-xs ml-0.5" />
                    </div>
                    Watch Demo
                  </button>
                </motion.div>

                {/* Social proof */}
                <motion.div variants={fadeInUp} className="flex items-center gap-5">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <img key={i} src={`https://i.pravatar.cc/50?img=${i + 5}`} alt="" className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-900 shadow-sm" />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => <FaStar key={i} className="text-amber-400 text-xs" />)}
                      <span className="ml-1.5 font-bold text-gray-900 dark:text-white text-sm">4.9</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">From 50,000+ verified reviews</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right — App mockup */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-3xl blur-3xl" />
                
                {/* Phone mockup */}
                <div className="relative bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl border border-gray-700/50 w-[320px] mx-auto">
                  <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 rounded-[2rem] overflow-hidden">
                    {/* Status bar */}
                    <div className="flex items-center justify-between px-6 py-3">
                      <span className="text-white/70 text-xs font-medium">9:41</span>
                      <div className="w-28 h-5 bg-gray-900 rounded-full mx-auto" />
                      <div className="flex gap-1 items-center">
                        <div className="w-4 h-2 border border-white/50 rounded-sm"><div className="w-3/4 h-full bg-white/70 rounded-sm" /></div>
                      </div>
                    </div>
                    
                    {/* App content */}
                    <div className="px-6 pb-8 pt-2 space-y-5">
                      <div>
                        <p className="text-white/60 text-xs mb-1">Good morning, Emeka 👋</p>
                        <p className="text-white/50 text-xs">Your financial overview</p>
                      </div>

                      {/* Balance card */}
                      <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                        <p className="text-white/60 text-xs mb-1">Total Balance</p>
                        <p className="text-white text-3xl font-bold">₦245,000</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-green-300 text-xs">↑ 12.5%</span>
                          <span className="text-white/40 text-xs">this month</span>
                        </div>
                      </div>

                      {/* Quick actions */}
                      <div className="grid grid-cols-4 gap-2">
                        {['Send', 'Receive', 'Pay', 'More'].map(a => (
                          <div key={a} className="bg-white/10 rounded-xl p-2.5 text-center">
                            <div className="w-8 h-8 bg-white/20 rounded-full mx-auto mb-1.5" />
                            <p className="text-white text-[10px] font-medium">{a}</p>
                          </div>
                        ))}
                      </div>

                      {/* Transactions */}
                      <div>
                        <p className="text-white/60 text-xs mb-2.5">Recent Activity</p>
                        <div className="space-y-2">
                          {[
                            { label: 'Salary Credit', amount: '+₦150,000', color: 'text-green-300', bg: 'bg-green-500/20', time: 'Today' },
                            { label: 'Online Shopping', amount: '-₦25,500', color: 'text-red-300', bg: 'bg-red-500/20', time: 'Yesterday' },
                            { label: 'Savings Interest', amount: '+₦3,125', color: 'text-blue-300', bg: 'bg-blue-500/20', time: 'Mon' },
                          ].map((t, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-2.5">
                              <div className={`w-8 h-8 ${t.bg} rounded-full flex-shrink-0`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-medium">{t.label}</p>
                                <p className="text-white/40 text-[10px]">{t.time}</p>
                              </div>
                              <span className={`text-xs font-bold ${t.color}`}>{t.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating cards */}
                <motion.div
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="absolute -left-12 top-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-3.5 border border-gray-100 dark:border-gray-700 w-44"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="text-green-600 text-xs" />
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">Transfer Sent!</p>
                  </div>
                  <p className="text-gray-500 text-[10px]">₦50,000 → GTBank</p>
                  <p className="text-green-600 text-[10px] font-medium mt-0.5">Instant • Free</p>
                </motion.div>

                <motion.div
                  animate={{ y: [4, -4, 4] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }}
                  className="absolute -right-8 bottom-32 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-3.5 border border-gray-100 dark:border-gray-700 w-44"
                >
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Savings goal</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">iPhone 16 Pro</p>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <div className="w-2/3 h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full" />
                  </div>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium">67% reached 🎯</p>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Trusted by */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="relative max-w-7xl mx-auto mt-20 pt-10 border-t border-gray-200/70 dark:border-gray-800"
          >
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-medium mb-8">Licensed & regulated by</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {['CBN', 'NDIC', 'NIBSS', 'Mastercard', 'Verve'].map((name, i) => (
                <div key={i} className="text-gray-400 dark:text-gray-600 font-bold text-sm md:text-base tracking-wide hover:text-gray-600 dark:hover:text-gray-400 transition-colors">{name}</div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" ref={featuresRef} className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gray-50/70 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto">
            <motion.div variants={staggerChildren} initial="hidden" animate={featuresInView ? 'visible' : 'hidden'} className="text-center mb-16">
              <motion.p variants={fadeInUp} className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Everything you need</motion.p>
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                Powerful features for<br />
                <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">modern banking</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">From instant transfers to AI-powered analytics — everything in one place, designed for Nigerians.</motion.p>
            </motion.div>

            <motion.div variants={staggerChildren} initial="hidden" animate={featuresInView ? 'visible' : 'hidden'} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div key={i} variants={fadeInUp} whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className={`group relative bg-white dark:bg-gray-800/80 rounded-2xl p-7 border ${f.border} hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-300`}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className="text-white text-lg" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── SECURITY ── */}
        <section id="security" ref={securityRef} className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={securityInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6 }}>
                <p className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Your protection</p>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-5 tracking-tight">
                  Security you can<br />
                  <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">actually trust</span>
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                  We use the same security infrastructure as the world's top banks — because your money deserves nothing less.
                </p>
                <div className="space-y-4">
                  {['₦50M NDIC deposit insurance', 'Real-time transaction alerts', '5-minute account freeze on suspicious activity', 'Zero liability fraud protection'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaCheck className="text-indigo-600 dark:text-indigo-400 text-[10px]" />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={securityInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="grid grid-cols-2 gap-4"
              >
                {securityFeatures.map((f, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors group">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                      <f.icon className="text-white text-lg" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{f.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{f.description}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section ref={statsRef} className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          
          <div className="relative max-w-7xl mx-auto">
            <motion.div variants={staggerChildren} initial="hidden" animate={statsInView ? 'visible' : 'hidden'} className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {stats.map((s, i) => (
                <motion.div key={i} variants={fadeInUp} className="text-center text-white">
                  <div className="inline-flex p-3 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                    <s.icon className="text-2xl text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold mb-1">{s.value}</div>
                  <p className="text-white/90 font-semibold text-sm md:text-base">{s.label}</p>
                  <p className="text-white/50 text-xs mt-0.5">{s.sub}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" ref={pricingRef} className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gray-50/70 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto">
            <motion.div variants={staggerChildren} initial="hidden" animate={pricingInView ? 'visible' : 'hidden'} className="text-center mb-16">
              <motion.p variants={fadeInUp} className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Simple pricing</motion.p>
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                Plans for <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">every stage</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-gray-500 dark:text-gray-400">Start free, upgrade when you're ready. No hidden fees, ever.</motion.p>
            </motion.div>

            <motion.div variants={staggerChildren} initial="hidden" animate={pricingInView ? 'visible' : 'hidden'} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan, i) => (
                <motion.div key={i} variants={fadeInUp}
                  className={`relative rounded-2xl p-7 border transition-all duration-300 ${
                    plan.highlight
                      ? 'bg-gradient-to-br from-indigo-600 to-blue-600 border-transparent shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/40 scale-105'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-700'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">Most Popular</span>
                    </div>
                  )}
                  <div className="mb-5">
                    <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{plan.name}</h3>
                    <p className={`text-xs ${plan.highlight ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>{plan.desc}</p>
                  </div>
                  <div className={`text-3xl font-bold mb-6 ${plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{plan.price}</div>
                  <ul className="space-y-3 mb-7">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-2.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.highlight ? 'bg-white/20' : 'bg-indigo-100 dark:bg-indigo-900/50'}`}>
                          <FaCheck className={`text-[8px] ${plan.highlight ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
                        </div>
                        <span className={`text-sm ${plan.highlight ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/register"
                    className={`block w-full py-3 rounded-xl text-center text-sm font-semibold transition-all ${
                      plan.highlight
                        ? 'bg-white text-indigo-600 hover:bg-gray-50 shadow-lg'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section id="testimonials" ref={testimonialsRef} className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <motion.div variants={staggerChildren} initial="hidden" animate={testimonialsInView ? 'visible' : 'hidden'} className="text-center mb-16">
              <motion.p variants={fadeInUp} className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Real stories</motion.p>
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                Loved by <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">millions</span>
              </motion.h2>
            </motion.div>

            <div className="relative max-w-3xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => <FaStar key={i} className="text-amber-400 text-sm" />)}
                  </div>
                  <FaQuoteRight className="text-3xl text-indigo-100 dark:text-indigo-900 mb-4" />
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-8">"{testimonials[currentTestimonial].content}"</p>
                  <div className="flex items-center gap-4">
                    <img src={testimonials[currentTestimonial].image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-800" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 dark:text-white">{testimonials[currentTestimonial].name}</p>
                        <FaCheckCircle className="text-blue-500 text-sm" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonials[currentTestimonial].role}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <button onClick={() => setCurrentTestimonial(p => (p - 1 + testimonials.length) % testimonials.length)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <FaChevronLeft className="text-gray-600 dark:text-gray-400 text-sm" />
              </button>
              <button onClick={() => setCurrentTestimonial(p => (p + 1) % testimonials.length)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <FaChevronRight className="text-gray-600 dark:text-gray-400 text-sm" />
              </button>

              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => setCurrentTestimonial(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === currentTestimonial ? 'bg-indigo-600 w-6' : 'bg-gray-300 dark:bg-gray-600 w-2 hover:bg-gray-400'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section ref={ctaRef} className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gray-50/70 dark:bg-gray-900/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={ctaInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 rounded-3xl p-10 md:p-16 shadow-2xl"
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10 text-center">
              <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-3">Join 2.5M+ Nigerians</p>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 tracking-tight">Ready to bank smarter?</h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">Open your free account in under 5 minutes. No paperwork, no queues, no hidden fees.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-700 rounded-2xl font-bold text-base hover:bg-gray-50 shadow-xl transition-all">
                  Open Free Account <FaArrowRight />
                </Link>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => toast.success('App Store coming soon!')} className="flex items-center gap-2 px-5 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold text-sm hover:bg-white/20 transition-all border border-white/20">
                    <FaApple className="text-xl" /> iOS
                  </button>
                  <button onClick={() => toast.success('Play Store coming soon!')} className="flex items-center gap-2 px-5 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold text-sm hover:bg-white/20 transition-all border border-white/20">
                    <FaGooglePlay className="text-xl" /> Android
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="bg-gray-950 text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
              <div className="sm:col-span-2">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <FaCreditCard className="text-white text-lg" />
                  </div>
                  <div className="ml-2.5">
                    <span className="text-xl font-bold text-white">Vaultix</span>
                    <span className="block text-[9px] text-gray-500 uppercase tracking-[0.2em] font-semibold -mt-0.5">Digital Bank</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">Modern banking for the digital age. Secure, fast, and built for Nigerians by people who understand Nigeria.</p>
                <div className="flex gap-3">
                  {[FaTwitter, FaFacebook, FaInstagram, FaLinkedin].map((Icon, i) => (
                    <a key={i} href="#" className="w-9 h-9 bg-gray-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-colors">
                      <Icon className="text-gray-400 hover:text-white text-sm" />
                    </a>
                  ))}
                </div>
              </div>

              {[
                { title: 'Products', links: ['Personal Banking', 'Business Accounts', 'Savings Plans', 'Virtual Cards', 'Investments'] },
                { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Blog', 'Partners'] },
                { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'NDIC Coverage', 'Compliance'] },
              ].map((col, i) => (
                <div key={i}>
                  <h4 className="font-bold text-sm mb-4 text-gray-200 uppercase tracking-wider">{col.title}</h4>
                  <ul className="space-y-2.5">
                    {col.links.map((link, j) => (
                      <li key={j}><a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{link}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-600 text-xs">© 2024 Vaultix Digital Bank. All rights reserved. Licensed by CBN.</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-gray-500 text-xs">All systems operational</p>
              </div>
            </div>
          </div>
        </footer>

        {/* Back to top */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-6 right-6 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg flex items-center justify-center z-40 transition-colors"
            >
              <FaArrowUp className="text-sm" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Demo Modal */}
      <AnimatePresence>
        {showDemo && <InteractiveDemo onClose={() => setShowDemo(false)} />}
      </AnimatePresence>
    </>
  );
};

export default Landing;