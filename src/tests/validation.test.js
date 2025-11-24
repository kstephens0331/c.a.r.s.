import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  formatPhone,
  validateVIN,
  validatePassword,
  validateFileSize,
  validateFileType,
  validateInvoiceFile,
  validateRequired,
  validateNumber,
  validateLicensePlate,
  validateYear,
} from '../utils/validation';

describe('validateEmail', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('test@example.com')).toEqual({ isValid: true, error: null });
    expect(validateEmail('user.name@domain.co.uk')).toEqual({ isValid: true, error: null });
    expect(validateEmail('test+tag@example.com')).toEqual({ isValid: true, error: null });
  });

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid')).toMatchObject({ isValid: false });
    expect(validateEmail('no@domain')).toMatchObject({ isValid: false });
    expect(validateEmail('@domain.com')).toMatchObject({ isValid: false });
    expect(validateEmail('')).toMatchObject({ isValid: false });
    expect(validateEmail('   ')).toMatchObject({ isValid: false });
  });
});

describe('validatePhone', () => {
  it('should validate 10-digit phone numbers', () => {
    expect(validatePhone('1234567890')).toEqual({ isValid: true, error: null });
    expect(validatePhone('(123) 456-7890')).toEqual({ isValid: true, error: null });
    expect(validatePhone('123-456-7890')).toEqual({ isValid: true, error: null });
  });

  it('should reject invalid phone numbers', () => {
    expect(validatePhone('123')).toMatchObject({ isValid: false });
    expect(validatePhone('12345678901')).toMatchObject({ isValid: false });
    expect(validatePhone('')).toMatchObject({ isValid: false });
    expect(validatePhone('   ')).toMatchObject({ isValid: false });
  });
});

describe('formatPhone', () => {
  it('should format 10-digit numbers correctly', () => {
    expect(formatPhone('1234567890')).toBe('(123) 456-7890');
    expect(formatPhone('(123) 456-7890')).toBe('(123) 456-7890');
  });

  it('should return original input for invalid lengths', () => {
    expect(formatPhone('123')).toBe('123');
    expect(formatPhone('12345678901')).toBe('12345678901');
  });
});

describe('validateVIN', () => {
  it('should validate correct VINs', () => {
    expect(validateVIN('1HGBH41JXMN109186')).toEqual({ isValid: true, error: null });
    expect(validateVIN('JH4KA8170MC000000')).toEqual({ isValid: true, error: null });
  });

  it('should reject invalid VINs', () => {
    expect(validateVIN('SHORT')).toMatchObject({ isValid: false });
    expect(validateVIN('12345678901234567890')).toMatchObject({ isValid: false });
    expect(validateVIN('1HGBH41JXMN10918I')).toMatchObject({ isValid: false }); // Contains I
    expect(validateVIN('1HGBH41JXMN10918O')).toMatchObject({ isValid: false }); // Contains O
    expect(validateVIN('1HGBH41JXMN10918Q')).toMatchObject({ isValid: false }); // Contains Q
    expect(validateVIN('')).toMatchObject({ isValid: false });
  });
});

describe('validatePassword', () => {
  it('should validate strong passwords', () => {
    const result = validatePassword('Strong123!@#');
    expect(result.isValid).toBe(true);
    expect(result.strength).toBe('strong');
  });

  it('should validate medium passwords', () => {
    const result = validatePassword('Password123');
    expect(result.isValid).toBe(true);
    expect(result.strength).toBe('medium');
  });

  it('should reject weak passwords', () => {
    expect(validatePassword('weak')).toMatchObject({ isValid: false });
    expect(validatePassword('12345678')).toMatchObject({ isValid: false });
    expect(validatePassword('password')).toMatchObject({ isValid: false });
    expect(validatePassword('')).toMatchObject({ isValid: false });
  });

  it('should require minimum 8 characters', () => {
    expect(validatePassword('Pass1!')).toMatchObject({ isValid: false });
  });
});

describe('validateFileSize', () => {
  it('should validate files within size limit', () => {
    const file = { size: 5 * 1024 * 1024 }; // 5MB
    expect(validateFileSize(file, 10)).toEqual({ isValid: true, error: null });
  });

  it('should reject files exceeding size limit', () => {
    const file = { size: 15 * 1024 * 1024 }; // 15MB
    expect(validateFileSize(file, 10)).toMatchObject({ isValid: false });
  });

  it('should reject null file', () => {
    expect(validateFileSize(null)).toMatchObject({ isValid: false });
  });
});

describe('validateFileType', () => {
  it('should validate allowed file types', () => {
    const file = { type: 'image/jpeg' };
    expect(validateFileType(file, ['image/jpeg', 'image/png'])).toEqual({ isValid: true, error: null });
  });

  it('should reject disallowed file types', () => {
    const file = { type: 'application/exe' };
    expect(validateFileType(file, ['image/jpeg', 'image/png'])).toMatchObject({ isValid: false });
  });

  it('should reject null file', () => {
    expect(validateFileType(null, ['image/jpeg'])).toMatchObject({ isValid: false });
  });
});

describe('validateInvoiceFile', () => {
  it('should validate image files', () => {
    const file = { type: 'image/jpeg', size: 5 * 1024 * 1024 };
    expect(validateInvoiceFile(file)).toEqual({ isValid: true, error: null });
  });

  it('should validate PDF files', () => {
    const file = { type: 'application/pdf', size: 5 * 1024 * 1024 };
    expect(validateInvoiceFile(file)).toEqual({ isValid: true, error: null });
  });

  it('should reject invalid file types', () => {
    const file = { type: 'application/zip', size: 5 * 1024 * 1024 };
    expect(validateInvoiceFile(file)).toMatchObject({ isValid: false });
  });

  it('should reject oversized files', () => {
    const file = { type: 'image/jpeg', size: 15 * 1024 * 1024 };
    expect(validateInvoiceFile(file)).toMatchObject({ isValid: false });
  });
});

describe('validateRequired', () => {
  it('should validate non-empty values', () => {
    expect(validateRequired('value')).toEqual({ isValid: true, error: null });
    expect(validateRequired('0')).toEqual({ isValid: true, error: null });
    expect(validateRequired(123)).toEqual({ isValid: true, error: null });
  });

  it('should reject empty values', () => {
    expect(validateRequired('')).toMatchObject({ isValid: false });
    expect(validateRequired('   ')).toMatchObject({ isValid: false });
    expect(validateRequired(null)).toMatchObject({ isValid: false });
    expect(validateRequired(undefined)).toMatchObject({ isValid: false });
  });

  it('should use custom field name in error message', () => {
    const result = validateRequired('', 'Username');
    expect(result.error).toContain('Username');
  });
});

describe('validateNumber', () => {
  it('should validate positive numbers', () => {
    expect(validateNumber(10)).toEqual({ isValid: true, error: null });
    expect(validateNumber('25.5')).toEqual({ isValid: true, error: null });
  });

  it('should validate numbers within min/max range', () => {
    expect(validateNumber(5, { min: 0, max: 10 })).toEqual({ isValid: true, error: null });
  });

  it('should reject numbers below minimum', () => {
    expect(validateNumber(-5, { min: 0 })).toMatchObject({ isValid: false });
  });

  it('should reject numbers above maximum', () => {
    expect(validateNumber(15, { max: 10 })).toMatchObject({ isValid: false });
  });

  it('should reject decimals when not allowed', () => {
    expect(validateNumber(5.5, { allowDecimals: false })).toMatchObject({ isValid: false });
  });

  it('should reject non-numeric values', () => {
    expect(validateNumber('abc')).toMatchObject({ isValid: false });
    expect(validateNumber('')).toMatchObject({ isValid: false });
    expect(validateNumber(null)).toMatchObject({ isValid: false });
  });
});

describe('validateLicensePlate', () => {
  it('should validate common license plate formats', () => {
    expect(validateLicensePlate('ABC123')).toEqual({ isValid: true, error: null });
    expect(validateLicensePlate('TX-1234')).toEqual({ isValid: true, error: null });
    expect(validateLicensePlate('ABC 1234')).toEqual({ isValid: true, error: null });
  });

  it('should reject invalid license plates', () => {
    expect(validateLicensePlate('A')).toMatchObject({ isValid: false }); // Too short
    expect(validateLicensePlate('ABCDEFGHI')).toMatchObject({ isValid: false }); // Too long
    expect(validateLicensePlate('')).toMatchObject({ isValid: false });
    expect(validateLicensePlate('   ')).toMatchObject({ isValid: false });
  });
});

describe('validateYear', () => {
  const currentYear = new Date().getFullYear();

  it('should validate reasonable vehicle years', () => {
    expect(validateYear(2020)).toEqual({ isValid: true, error: null });
    expect(validateYear(currentYear)).toEqual({ isValid: true, error: null });
    expect(validateYear(currentYear + 1)).toEqual({ isValid: true, error: null });
    expect(validateYear(1950)).toEqual({ isValid: true, error: null });
  });

  it('should reject years before 1900', () => {
    expect(validateYear(1899)).toMatchObject({ isValid: false });
  });

  it('should reject years too far in the future', () => {
    expect(validateYear(currentYear + 2)).toMatchObject({ isValid: false });
  });

  it('should reject non-numeric years', () => {
    expect(validateYear('abc')).toMatchObject({ isValid: false });
  });
});
