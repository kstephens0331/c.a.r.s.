/**
 * Input validation utilities for forms
 * Provides consistent validation across the application
 */

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validateEmail(email) {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true, error: null };
}

/**
 * Validate phone number (US format: 10 digits)
 * @param {string} phone - Phone number to validate
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validatePhone(phone) {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length !== 10) {
    return { isValid: false, error: 'Phone number must be 10 digits' };
  }

  return { isValid: true, error: null };
}

/**
 * Format phone number to (XXX) XXX-XXXX
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export function formatPhone(phone) {
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }

  return phone;
}

/**
 * Validate VIN (Vehicle Identification Number)
 * @param {string} vin - VIN to validate
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validateVIN(vin) {
  if (!vin || vin.trim() === '') {
    return { isValid: false, error: 'VIN is required' };
  }

  // Remove spaces and convert to uppercase
  const cleanVIN = vin.replace(/\s/g, '').toUpperCase();

  if (cleanVIN.length !== 17) {
    return { isValid: false, error: 'VIN must be exactly 17 characters' };
  }

  // Check for invalid characters (I, O, Q are not used in VINs)
  const invalidChars = /[IOQ]/;
  if (invalidChars.test(cleanVIN)) {
    return { isValid: false, error: 'VIN cannot contain I, O, or Q' };
  }

  // Check for valid characters (alphanumeric only)
  const validChars = /^[A-HJ-NPR-Z0-9]{17}$/;
  if (!validChars.test(cleanVIN)) {
    return { isValid: false, error: 'VIN contains invalid characters' };
  }

  return { isValid: true, error: null };
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { isValid: boolean, error: string|null, strength: string }
 */
export function validatePassword(password) {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Password is required', strength: 'none' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters', strength: 'weak' };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let strength = 'weak';
  let strengthCount = 0;

  if (hasUpperCase) strengthCount++;
  if (hasLowerCase) strengthCount++;
  if (hasNumber) strengthCount++;
  if (hasSpecialChar) strengthCount++;

  if (strengthCount >= 3 && password.length >= 12) {
    strength = 'strong';
  } else if (strengthCount >= 2 && password.length >= 8) {
    strength = 'medium';
  }

  if (strengthCount < 2) {
    return {
      isValid: false,
      error: 'Password must contain uppercase, lowercase, and numbers',
      strength: 'weak'
    };
  }

  return { isValid: true, error: null, strength };
}

/**
 * Validate file size (max 10MB default)
 * @param {File} file - File object to validate
 * @param {number} maxSizeMB - Maximum file size in MB (default: 10)
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validateFileSize(file, maxSizeMB = 10) {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validate file type
 * @param {File} file - File object to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validateFileType(file, allowedTypes) {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes.map(type => {
      const parts = type.split('/');
      return parts[parts.length - 1].toUpperCase();
    }).join(', ');

    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${allowedExtensions}`
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validate invoice/image file for upload
 * @param {File} file - File object to validate
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validateInvoiceFile(file) {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ];

  const typeValidation = validateFileType(file, allowedTypes);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  const sizeValidation = validateFileSize(file, 10);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  return { isValid: true, error: null };
}

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field (for error message)
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validateRequired(value, fieldName = 'This field') {
  if (!value || value.toString().trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true, error: null };
}

/**
 * Validate number (positive, optionally with decimals)
 * @param {string|number} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validateNumber(value, options = {}) {
  const { min = 0, max, allowDecimals = true, fieldName = 'This field' } = options;

  if (value === '' || value === null || value === undefined) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  if (!allowDecimals && numValue !== parseInt(value)) {
    return { isValid: false, error: `${fieldName} must be a whole number` };
  }

  if (numValue < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (max !== undefined && numValue > max) {
    return { isValid: false, error: `${fieldName} must be at most ${max}` };
  }

  return { isValid: true, error: null };
}

/**
 * Validate license plate format (flexible - allows various formats)
 * @param {string} licensePlate - License plate to validate
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validateLicensePlate(licensePlate) {
  if (!licensePlate || licensePlate.trim() === '') {
    return { isValid: false, error: 'License plate is required' };
  }

  // Remove spaces and special characters
  const cleaned = licensePlate.replace(/[^A-Z0-9]/gi, '');

  if (cleaned.length < 2 || cleaned.length > 8) {
    return { isValid: false, error: 'License plate must be between 2-8 characters' };
  }

  return { isValid: true, error: null };
}

/**
 * Validate year (vehicle year)
 * @param {string|number} year - Year to validate
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validateYear(year) {
  const currentYear = new Date().getFullYear();
  const numYear = parseInt(year);

  if (isNaN(numYear)) {
    return { isValid: false, error: 'Year must be a valid number' };
  }

  if (numYear < 1900 || numYear > currentYear + 1) {
    return { isValid: false, error: `Year must be between 1900 and ${currentYear + 1}` };
  }

  return { isValid: true, error: null };
}
