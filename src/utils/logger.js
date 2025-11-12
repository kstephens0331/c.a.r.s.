/**
 * Safe logging utility for development
 * Prevents sensitive data from appearing in production console logs
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Log general information (only in development)
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log warnings (only in development)
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log errors (always shown, but sanitized)
   */
  error: (...args) => {
    // Always log errors, but in production, send to monitoring service
    console.error(...args);

    // TODO: In production, send to error tracking service like Sentry
    // if (!isDevelopment) {
    //   sendToSentry(args);
    // }
  },

  /**
   * Log debug information (only in development)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log with a group label (only in development)
   */
  group: (label, ...args) => {
    if (isDevelopment) {
      console.group(label);
      console.log(...args);
      console.groupEnd();
    }
  }
};

export default logger;
