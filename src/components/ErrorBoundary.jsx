import React from 'react';
import * as Sentry from '@sentry/react';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors in child component tree and displays fallback UI
 * Prevents application crashes and provides graceful error handling
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  /**
   * Update state when error is caught
   * @param {Error} error - The error that was thrown
   * @returns {Object} New state
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * Log error details to console (in production, send to error tracking service)
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - React component stack trace
   */
  componentDidCatch(error, errorInfo) {
    console.error('❌ Error caught by ErrorBoundary:', error);
    console.error('📍 Component Stack:', errorInfo.componentStack);

    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorCount: this.state.errorCount + 1
    });

    // Send to Sentry in production
    if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        },
        tags: {
          errorBoundary: true,
          errorCount: this.state.errorCount + 1
        }
      });
    }
  }

  /**
   * Reset error boundary state
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  /**
   * Reload the page (for persistent errors)
   */
  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorCount } = this.state;

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
              Oops! Something went wrong
            </h1>

            {/* Error Message */}
            <p className="text-gray-600 text-center mb-6">
              We're sorry, but an unexpected error occurred. Our team has been notified and is working on a fix.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">
                  Error Details (Development Mode):
                </h2>
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                  <p className="text-sm font-mono text-red-800 break-all">
                    {error.toString()}
                  </p>
                </div>
                {errorInfo && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium mb-2">
                      Component Stack Trace
                    </summary>
                    <pre className="bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto text-xs">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
                {errorCount > 1 && (
                  <p className="text-sm text-orange-600 mt-2">
                    ⚠️ This error has occurred {errorCount} times
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-brandRedDark text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors"
              >
                Go Back
              </button>
            </div>

            {/* Support Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Need help?{' '}
                <a
                  href="tel:832-885-3055"
                  className="text-brandRed hover:text-red-700 font-medium"
                >
                  Call us at (832) 885-3055
                </a>
              </p>
            </div>

            {/* Error ID (for production tracking) */}
            {process.env.NODE_ENV === 'production' && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">
                  Error ID: {Date.now().toString(36).toUpperCase()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
