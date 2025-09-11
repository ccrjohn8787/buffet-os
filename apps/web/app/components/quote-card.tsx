"use client";
import { useState, useEffect } from "react";

interface QuoteCardProps {
  text: string;
  year: number;
  anchor: string;
  title: string;
  source?: string;
  variant?: 'default' | 'social' | 'print';
  showActions?: boolean;
  className?: string;
}

export default function QuoteCard({ 
  text, 
  year, 
  anchor, 
  title, 
  source = "letters",
  variant = 'default',
  showActions = true,
  className = ""
}: QuoteCardProps) {
  const [copied, setCopied] = useState(false);
  const [permalink, setPermalink] = useState('');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPermalink(`${window.location.origin}/letters/${year}#${encodeURIComponent(anchor)}`);
    }
  }, [year, anchor]);
  
  const copyToClipboard = async (format: 'citation' | 'text' | 'link') => {
    let content = '';
    
    switch (format) {
      case 'citation':
        content = `"${text}" — Warren E. Buffett, ${title}, ${year}, ${anchor}, ${permalink}`;
        break;
      case 'text':
        content = `"${text}" — Warren Buffett, ${year}`;
        break;
      case 'link':
        content = permalink;
        break;
    }
    
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Warren Buffett Quote from ${year}`,
          text: `"${text}" — Warren Buffett`,
          url: permalink
        });
      } catch (err) {
        // Fallback to copy
        copyToClipboard('citation');
      }
    } else {
      copyToClipboard('citation');
    }
  };

  // Social media variant for sharing
  if (variant === 'social') {
    return (
      <div className={`quote-card-social ${className}`} style={{
        width: '600px',
        minHeight: '315px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontFamily: 'Georgia, serif',
        position: 'relative',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          fontSize: '32px',
          fontWeight: '400',
          lineHeight: '1.4',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          "{text}"
        </div>
        
        <div style={{
          textAlign: 'center',
          fontSize: '18px',
          opacity: 0.9
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            Warren E. Buffett
          </div>
          <div style={{ fontSize: '16px' }}>
            {title} • {year}
          </div>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '20px',
          fontSize: '12px',
          opacity: 0.7,
          fontFamily: 'system-ui, sans-serif'
        }}>
          BuffettOS.com
        </div>
      </div>
    );
  }

  // Print variant
  if (variant === 'print') {
    return (
      <div className={`quote-card-print ${className}`} style={{
        backgroundColor: 'white',
        color: '#000',
        padding: '32px',
        fontFamily: 'Georgia, serif',
        border: '2px solid #000',
        maxWidth: '500px'
      }}>
        <div style={{
          fontSize: '20px',
          lineHeight: '1.6',
          marginBottom: '24px',
          fontStyle: 'italic'
        }}>
          "{text}"
        </div>
        
        <div style={{
          fontSize: '14px',
          textAlign: 'right'
        }}>
          <div style={{ fontWeight: 'bold' }}>Warren E. Buffett</div>
          <div>{title}</div>
          <div>{year} • {anchor}</div>
        </div>
      </div>
    );
  }

  // Default interactive variant
  return (
    <div className={`quote-card ${className}`} style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: 'clamp(16px, 4vw, 24px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '600px',
      width: '100%'
    }}>
      {/* Quote Text */}
      <blockquote style={{
        fontSize: 'clamp(16px, 4vw, 18px)',
        lineHeight: '1.7',
        color: '#1f2937',
        fontStyle: 'italic',
        margin: '0 0 20px 0',
        position: 'relative',
        paddingLeft: 'clamp(16px, 4vw, 20px)'
      }}>
        <span style={{
          position: 'absolute',
          left: '-10px',
          top: '-10px',
          fontSize: '48px',
          color: '#d1d5db',
          fontFamily: 'Georgia, serif',
          lineHeight: '1'
        }}>
          "
        </span>
        {text}
      </blockquote>

      {/* Attribution */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '16px',
        borderTop: '1px solid #f3f4f6'
      }}>
        <div>
          <div style={{
            fontWeight: '600',
            color: '#1f2937',
            fontSize: '16px'
          }}>
            Warren E. Buffett
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '2px'
          }}>
            <span>{title}</span>
            <span>•</span>
            <span>{year}</span>
            <span>•</span>
            <span style={{
              fontFamily: 'monospace',
              backgroundColor: '#f3f4f6',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {anchor}
            </span>
          </div>
        </div>

        {/* Verification Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: '#059669',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"/>
          </svg>
          Verified
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div style={{
          display: 'flex',
          gap: 'clamp(6px, 2vw, 8px)',
          marginTop: '16px',
          flexWrap: 'wrap',
          justifyContent: 'flex-start'
        }}>
          <button
            onClick={() => copyToClipboard('citation')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: copied ? '#10b981' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
          >
            {copied ? 'Copied!' : 'Copy Citation'}
          </button>

          <button
            onClick={shareNative}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4b5563'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6b7280'
            }}
          >
            Share
          </button>

          <button
            onClick={() => copyToClipboard('text')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb'
              e.currentTarget.style.borderColor = '#9ca3af'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.borderColor = '#d1d5db'
            }}
          >
            Copy Text
          </button>

          <a
            href={permalink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 16px',
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
              e.currentTarget.style.backgroundColor = '#f9fafb'
              e.currentTarget.style.borderColor = '#9ca3af'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.borderColor = '#d1d5db'
            }}
          >
            Read Full Letter
          </a>
        </div>
      )}
    </div>
  );
}