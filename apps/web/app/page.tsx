"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DailyWisdom {
  section: {
    id: string;
    document_id: number;
    title: string;
    year: number;
    source: string;
    anchor: string;
    text: string;
  };
  score: number;
  primary_topic?: {
    id: string;
    name: string;
    color: string;
  };
  date: string;
}

export default function HomePage() {
  const [q, setQ] = useState("");
  const [dailyWisdom, setDailyWisdom] = useState<DailyWisdom | null>(null);
  const [wisdomLoading, setWisdomLoading] = useState(true);
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
  
  useEffect(() => {
    async function loadDailyWisdom() {
      try {
        const response = await fetch('/api/daily-wisdom');
        if (response.ok) {
          const wisdom = await response.json();
          setDailyWisdom(wisdom);
        }
      } catch (error) {
        console.error('Error loading daily wisdom:', error);
      } finally {
        setWisdomLoading(false);
      }
    }
    loadDailyWisdom();
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#fafafa'
    }}>
      {/* Daily Wisdom Section */}
      {!wisdomLoading && dailyWisdom && (
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '24px 20px'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                🌅 Wisdom of the Day
              </div>
              {dailyWisdom.primary_topic && (
                <span style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  backgroundColor: dailyWisdom.primary_topic.color,
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: '500'
                }}>
                  {dailyWisdom.primary_topic.name}
                </span>
              )}
            </div>
            
            <blockquote style={{
              fontSize: '20px',
              lineHeight: '1.6',
              color: '#1f2937',
              fontStyle: 'italic',
              margin: '0 0 16px 0',
              position: 'relative',
              paddingLeft: '20px'
            }}>
              <span style={{
                position: 'absolute',
                left: '-8px',
                top: '-8px',
                fontSize: '40px',
                color: '#d1d5db',
                fontFamily: 'Georgia, serif',
                lineHeight: '1'
              }}>
                "
              </span>
              {dailyWisdom.section.text}
            </blockquote>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '1px solid #f3f4f6'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                <span style={{ fontWeight: '500' }}>Warren E. Buffett</span>
                <span style={{ margin: '0 8px' }}>•</span>
                <span>{dailyWisdom.section.year}</span>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <a
                  href={`/letters/${dailyWisdom.section.year}#${encodeURIComponent(dailyWisdom.section.anchor)}`}
                  style={{
                    fontSize: '14px',
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                >
                  Read in context
                </a>
                <a
                  href={`/quote/${dailyWisdom.section.year}/${encodeURIComponent(dailyWisdom.section.anchor)}`}
                  style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                >
                  Share quote
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Search Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: wisdomLoading || !dailyWisdom ? '100vh' : 'calc(100vh - 200px)',
        padding: '40px 20px'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
          width: '100%'
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
          Search 20 years (2004-2023) of Warren Buffett's wisdom with exact quotes and citations
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
            
            <button 
              type="button"
              onClick={async () => {
                try {
                  const response = await fetch('/api/surprise-me');
                  if (response.ok) {
                    const surprise = await response.json();
                    router.push(`/quote/${surprise.section.year}/${encodeURIComponent(surprise.section.anchor)}`);
                  }
                } catch (error) {
                  console.error('Error getting surprise quote:', error);
                }
              }}
              style={{
                backgroundColor: '#3b82f6',
                border: '1px solid #3b82f6',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '10px 20px',
                transition: 'box-shadow 0.2s, background-color 0.2s',
                outline: 'none',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 1px rgba(0,0,0,.1)'
                e.currentTarget.style.backgroundColor = '#2563eb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.backgroundColor = '#3b82f6'
              }}
            >
              🎲 Surprise Me
            </button>
          </div>
        </form>

        <div style={{
          marginTop: '32px',
          fontSize: '13px',
          color: '#70757a',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '12px' }}>
            Press <kbd style={{ 
              backgroundColor: '#f1f3f4', 
              padding: '2px 6px', 
              borderRadius: '3px',
              fontFamily: 'monospace'
            }}>/</kbd> to focus search
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            fontSize: '14px'
          }}>
            <a 
              href="/topics" 
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Browse Topics
            </a>
            <span style={{ color: '#dadce0' }}>•</span>
            <a 
              href="/letters/2021" 
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Latest Letter
            </a>
            <span style={{ color: '#dadce0' }}>•</span>
            <a 
              href="/quote/2020/¶11" 
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Example Quote
            </a>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
