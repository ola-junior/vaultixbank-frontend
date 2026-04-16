import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaMobileAlt, FaWifi, FaTv, FaBolt, FaWater,
  FaGraduationCap, FaGlobe, FaArrowRight, FaHotel,
  FaCar, FaFilm, FaMusic, FaUtensils, FaGift, FaHeartbeat,
  FaShoppingBag, FaGamepad, FaTicketAlt
} from 'react-icons/fa';
import { MdSportsSoccer, MdFlightTakeoff } from 'react-icons/md';

const BillsIndex = () => {
  const navigate = useNavigate();

  const categories = [
    // Telecom
    { id: 'airtime', label: 'Airtime', icon: FaMobileAlt, gradient: ['#6366f1', '#8b5cf6'], description: 'Buy airtime for any network' },
    { id: 'data', label: 'Data', icon: FaWifi, gradient: ['#3b82f6', '#0ea5e9'], description: 'Purchase data bundles' },
    
    // Utilities
    { id: 'electricity', label: 'Electricity', icon: FaBolt, gradient: ['#eab308', '#ca8a04'], description: 'Pay electricity bills' },
    { id: 'water', label: 'Water', icon: FaWater, gradient: ['#06b6d4', '#0284c7'], description: 'Pay water bills' },
    { id: 'tv', label: 'Cable TV', icon: FaTv, gradient: ['#f59e0b', '#d97706'], description: 'Renew TV subscription' },
    { id: 'internet', label: 'Internet', icon: FaGlobe, gradient: ['#6366f1', '#4f46e5'], description: 'Pay broadband bills' },
    
    // Lifestyle
    { id: 'education', label: 'Education', icon: FaGraduationCap, gradient: ['#8b5cf6', '#6d28d9'], description: 'Pay exam fees' },
    { id: 'betting', label: 'Betting', icon: MdSportsSoccer, gradient: ['#10b981', '#059669'], description: 'Fund betting account' },
    { id: 'shopping', label: 'Shopping', icon: FaShoppingBag, gradient: ['#10b981', '#047857'], description: 'Pay for online orders' },
    { id: 'gaming', label: 'Gaming', icon: FaGamepad, gradient: ['#a855f7', '#7c3aed'], description: 'Buy game credits' },
    { id: 'events', label: 'Events', icon: FaTicketAlt, gradient: ['#f43f5e', '#e11d48'], description: 'Book event tickets' },
    
    // Travel
    { id: 'flights', label: 'Flights', icon: MdFlightTakeoff, gradient: ['#06b6d4', '#0284c7'], description: 'Book flight tickets' },
    { id: 'hotels', label: 'Hotels', icon: FaHotel, gradient: ['#8b5cf6', '#6d28d9'], description: 'Book hotel stays' },
    { id: 'carRental', label: 'Car Rental', icon: FaCar, gradient: ['#f59e0b', '#d97706'], description: 'Rent a car' },
    
    // Entertainment
    { id: 'movies', label: 'Movies', icon: FaFilm, gradient: ['#ec4899', '#db2777'], description: 'Book movie tickets' },
    { id: 'music', label: 'Music', icon: FaMusic, gradient: ['#10b981', '#059669'], description: 'Music subscriptions' },
    { id: 'dining', label: 'Dining', icon: FaUtensils, gradient: ['#f97316', '#ea580c'], description: 'Restaurant bookings' },
    
    // Others
    { id: 'gifts', label: 'Gifts', icon: FaGift, gradient: ['#f43f5e', '#e11d48'], description: 'Buy gift cards' },
    { id: 'healthcare', label: 'Healthcare', icon: FaHeartbeat, gradient: ['#ef4444', '#dc2626'], description: 'Medical payments' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Pay Bills
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Select a service to make a payment
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {categories.map((cat) => {
          const [c1, c2] = cat.gradient;
          const Icon = cat.icon;
          
          return (
            <motion.button
              key={cat.id}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/bills/${cat.id}`)}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-700 text-left transition-all group"
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ 
                  background: `linear-gradient(135deg, ${c1}, ${c2})`,
                  boxShadow: `0 4px 12px ${c1}40`
                }}
              >
                <Icon className="text-white text-lg" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                {cat.label}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {cat.description}
              </p>
              <div className="flex items-center gap-1 text-xs font-medium"
                style={{ color: c1 }}
              >
                <span>Pay Now</span>
                <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default BillsIndex;