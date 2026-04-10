export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return 'Email is required';
  }
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return '';
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return '';
};

export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return 'Name is required';
  }
  if (name.length < 3) {
    return 'Name must be at least 3 characters long';
  }
  if (name.length > 50) {
    return 'Name cannot exceed 50 characters';
  }
  return '';
};

export const validatePhoneNumber = (phone) => {
  if (!phone) return ''; // Optional field
  const phoneRegex = /^[0-9]{10,15}$/;
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid phone number (10-15 digits)';
  }
  return '';
};

export const validateAccountNumber = (accountNumber) => {
  if (!accountNumber) {
    return 'Account number is required';
  }
  if (!/^\d{10,16}$/.test(accountNumber)) {
    return 'Account number must be 10-16 digits';
  }
  return '';
};

export const validateAmount = (amount, balance = null) => {
  if (!amount) {
    return 'Amount is required';
  }
  
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return 'Please enter a valid number';
  }
  
  if (numAmount <= 0) {
    return 'Amount must be greater than 0';
  }
  
  if (numAmount > 1000000) {
    return 'Amount cannot exceed ₦1,000,000';
  }
  
  if (balance !== null && numAmount > balance) {
    return 'Insufficient balance';
  }
  
  return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return '';
};

export const validateForm = (fields, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = fields[field];
    const fieldRules = rules[field];
    
    if (fieldRules.required && !value) {
      errors[field] = `${fieldRules.label || field} is required`;
    } else if (value) {
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`;
      }
      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors[field] = `${fieldRules.label || field} cannot exceed ${fieldRules.maxLength} characters`;
      }
      if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
        errors[field] = fieldRules.message || `Invalid ${fieldRules.label || field}`;
      }
      if (fieldRules.custom) {
        const customError = fieldRules.custom(value, fields);
        if (customError) {
          errors[field] = customError;
        }
      }
    }
  });
  
  return errors;
};