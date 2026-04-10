export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₦0';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return 'Invalid Date';
  }
};

export const formatTime = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-NG', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch (error) {
    console.error('Time formatting error:', error);
    return 'Invalid Date';
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays < 30) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    } else {
      return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
    }
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return 'Invalid Date';
  }
};

export const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return '•••• •••• ••';
  if (accountNumber.length >= 10) {
    return `${accountNumber.slice(0, 4)} •••• •••• ${accountNumber.slice(-2)}`;
  }
  return accountNumber;
};

export const maskCardNumber = (cardNumber) => {
  if (!cardNumber) return '•••• •••• •••• ••••';
  return cardNumber.replace(/(\d{4})/g, '$1 ').trim();
};

export const formatAccountNumber = (accountNumber) => {
  if (!accountNumber) return '•••• •••• ••';
  if (accountNumber.length >= 10) {
    return `${accountNumber.slice(0, 4)} ${accountNumber.slice(4, 8)} ${accountNumber.slice(8, 10)}`;
  }
  return accountNumber;
};

export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phoneNumber;
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const capitalizeFirstLetter = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatPercentage = (value, total) => {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0';
  return new Intl.NumberFormat('en-NG').format(number);
};

export const formatShortNumber = (number) => {
  if (number === null || number === undefined) return '0';
  
  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(1) + 'B';
  }
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  }
  if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  }
  return number.toString();
};

export const getInitials = (name) => {
  if (!name) return 'U';
  const names = name.trim().split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return names[0][0].toUpperCase();
};

export const getFirstName = (name) => {
  if (!name) return 'User';
  return name.trim().split(' ')[0];
};

export const generateTransactionReference = () => {
  return 'TRX-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const formatStatus = (status) => {
  const statusMap = {
    'successful': 'Successful',
    'pending': 'Pending',
    'failed': 'Failed',
    'processing': 'Processing',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };
  return statusMap[status] || capitalizeFirstLetter(status);
};

export const getStatusColor = (status) => {
  const colorMap = {
    'successful': 'text-green-600 bg-green-100 dark:bg-green-900/30',
    'pending': 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    'failed': 'text-red-600 bg-red-100 dark:bg-red-900/30',
    'processing': 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    'completed': 'text-green-600 bg-green-100 dark:bg-green-900/30',
    'cancelled': 'text-gray-600 bg-gray-100 dark:bg-gray-700'
  };
  return colorMap[status] || 'text-gray-600 bg-gray-100 dark:bg-gray-700';
};