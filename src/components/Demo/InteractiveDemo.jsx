import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlay, FaPause, FaStepForward, FaStepBackward, 
  FaTimes, FaMobile, FaDesktop, FaChartLine,
  FaShieldAlt, FaCreditCard, FaMoneyBillWave, FaBolt
} from 'react-icons/fa';

// Your app's demo slides with actual features
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
    feature: "Real-time Analytics",
    screenshot: "dashboard"
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
    feature: "Total Control",
    controls: ["Freeze Card", "Change PIN", "Set Limits", "View Transactions"]
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
    feature: "Military-Grade Protection",
    security: ["Biometric Login", "End-to-End Encryption", "Fraud Detection AI"]
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

const InteractiveDemo = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState(0);

  // Auto-advance slides
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % DEMO_SLIDES.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

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
            ←  →  keys to navigate • ESC to close
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default InteractiveDemo;