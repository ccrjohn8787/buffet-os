"use client";
import { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          margin: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            🚫
          </div>
          
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#dc2626',
            marginBottom: '16px'
          }}>
            Something went wrong
          </h2>
          
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '24px',
            lineHeight: '1.5'
          }}>
            We encountered an unexpected error. Please try refreshing the page or return to the homepage.
          </p>

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }}
            >
              Refresh Page
            </button>
            
            <a
              href="/"
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.2s',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              Go Home
            </a>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{
              marginTop: '32px',
              textAlign: 'left',
              backgroundColor: '#f3f4f6',
              padding: '16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '8px' }}>
                Error Details (Development)
              </summary>
              <pre style={{ 
                margin: 0, 
                whiteSpace: 'pre-wrap',
                color: '#374151',
                overflow: 'auto'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}