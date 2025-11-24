/**
 * Safe logging utility for development
 * Prevents sensitive data from appearing in production console logs
 * Sends errors to Sentry in production
 */
import * as Sentry from '@sentry/react';

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
   * Log errors (always shown) and send to Sentry in production
   */
  error: (...args) => {
    // Always log errors to console
    console.error(...args);

    // Send to Sentry in production
    if (!isDevelopment && import.meta.env.VITE_SENTRY_DSN) {
      // If first argument is an Error object, capture it
      if (args[0] instanceof Error) {
        Sentry.captureException(args[0], {
          extra: {
            additionalData: args.slice(1)
          }
        });
      } else {
        // Otherwise, capture as a message
        Sentry.captureMessage(
          args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' '),
          'error'
        );
      }
    }
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
