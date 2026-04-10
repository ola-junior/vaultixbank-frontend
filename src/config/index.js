const config = {
  appName: import.meta.env.VITE_APP_NAME || 'BankApp',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  enableLogs: import.meta.env.VITE_ENABLE_LOGS === 'true',
  
  // Feature flags
  features: {
    darkMode: true,
    biometricAuth: false,
    pushNotifications: false,
    exportTransactions: true,
  },
  
  // UI Configuration
  ui: {
    defaultTheme: 'light',
    sidebarCollapsed: false,
    animationEnabled: true,
    toastDuration: 4000,
  },
  
  // Transaction limits
  limits: {
    maxTransferAmount: 1000000,
    maxWithdrawalAmount: 500000,
    minTransferAmount: 100,
  },
  
  // Pagination defaults
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
  
  // Date format
  dateFormat: {
    short: 'DD/MM/YYYY',
    long: 'DD MMMM YYYY',
    datetime: 'DD/MM/YYYY HH:mm',
  },
};

export default config;