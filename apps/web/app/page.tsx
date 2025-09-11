"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [q, setQ] = useState("");
  const router = useRouter();
  
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && (document.activeElement?.tagName || '').toLowerCase() !== 'input') {
        e.preventDefault();
        const el = document.getElementById('searchInput') as HTMLInputElement | null
        el?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#fafafa'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%',
        padding: '0 20px'
      }}>
        <h1 style={{
          fontSize: 'clamp(32px, 8vw, 48px)', // Responsive font size
          fontWeight: '400',
          color: '#202124',
          marginBottom: '8px',
          letterSpacing: '-1px'
        }}>
          Buffett OS
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#70757a',
          marginBottom: '32px',
          lineHeight: '1.5'
        }}>
          Search Warren Buffett's shareholder letters with exact quotes and citations
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) {
              router.push(`/search?q=${encodeURIComponent(q.trim())}`);
            }
          }}
          style={{ width: '100%' }}
        >
          <div style={{
            position: 'relative',
            maxWidth: '560px',
            margin: '0 auto',
            marginBottom: '32px'
          }}>
            <input
              id="searchInput"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for moats, intrinsic value, insurance float..."
              style={{
                width: '100%',
                padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 20px)',
                fontSize: '16px', // Prevent zoom on iOS
                border: '1px solid #dfe1e5',
                borderRadius: '24px',
                outline: 'none',
                boxShadow: '0 2px 5px 1px rgba(64,60,67,.16)',
                transition: 'box-shadow 0.2s',
                backgroundColor: 'white',
                WebkitAppearance: 'none' // Remove iOS styling
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 2px 8px 1px rgba(64,60,67,.24)'
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = '0 2px 5px 1px rgba(64,60,67,.16)'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              type="submit"
              style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #f8f9fa',
                borderRadius: '4px',
                color: '#3c4043',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '10px 20px',
                transition: 'box-shadow 0.2s, border-color 0.2s',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 1px rgba(0,0,0,.1)'
                e.currentTarget.style.borderColor = '#dadce0'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = '#f8f9fa'
              }}
            >
              Search Letters
            </button>
            
            <button 
              type="button"
              onClick={() => {
                const queries = ['moats', 'intrinsic value', 'float', 'Mr. Market', 'derivatives'];
                const randomQuery = queries[Math.floor(Math.random() * queries.length)];
                setQ(randomQuery);
              }}
              style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #f8f9fa',
                borderRadius: '4px',
                color: '#3c4043',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '10px 20px',
                transition: 'box-shadow 0.2s, border-color 0.2s',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 1px rgba(0,0,0,.1)'
                e.currentTarget.style.borderColor = '#dadce0'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = '#f8f9fa'
              }}
            >
              I'm Feeling Lucky
            </button>
          </div>
        </form>

        <div style={{
          marginTop: '32px',
          fontSize: '13px',
          color: '#70757a'
        }}>
          Press <kbd style={{ 
            backgroundColor: '#f1f3f4', 
            padding: '2px 6px', 
            borderRadius: '3px',
            fontFamily: 'monospace'
          }}>/</kbd> to focus search
        </div>
      </div>
    </div>
  );
}
