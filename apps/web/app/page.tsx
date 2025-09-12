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

interface YearData {
  year: number
  era: 'classic' | 'modern'
  hasLetter: boolean
  hasSummary: boolean
  highlight?: string
  description?: string
}

interface AvailableYearsData {
  years: YearData[]
  eras: {
    classic: {
      name: string
      description: string
      years: YearData[]
      count: number
    }
    modern: {
      name: string
      description: string
      years: YearData[]
      count: number
    }
  }
  stats: {
    total: number
    withSummaries: number
    withLetters: number
    classicCount: number
    modernCount: number
  }
}

export default function HomePage() {
  const [q, setQ] = useState("");
  const [dailyWisdom, setDailyWisdom] = useState<DailyWisdom | null>(null);
  const [wisdomLoading, setWisdomLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState<AvailableYearsData | null>(null);
  const [yearsLoading, setYearsLoading] = useState(true);
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
  
  useEffect(() => {
    async function loadAvailableYears() {
      try {
        const response = await fetch('/api/letters/available');
        if (response.ok) {
          const years = await response.json();
          setAvailableYears(years);
        }
      } catch (error) {
        console.error('Error loading available years:', error);
      } finally {
        setYearsLoading(false);
      }
    }
    loadAvailableYears();
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
          Search 37 years (1977-2023) of Warren Buffett's wisdom with exact quotes and citations
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
              href="/compare?year1=2020&year2=2021" 
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Compare Letters
            </a>
            <span style={{ color: '#dadce0' }}>•</span>
            <a 
              href="/evolution?topic=insurance" 
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Evolution Tracker
            </a>
            <span style={{ color: '#dadce0' }}>•</span>
            <a 
              href="/portfolio" 
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Portfolio Tracker
            </a>
            <span style={{ color: '#dadce0' }}>•</span>
            <a 
              href="/principles" 
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Investment Principles
            </a>
            <span style={{ color: '#dadce0' }}>•</span>
            <a 
              href="/learn" 
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Learning Center
            </a>
            <span style={{ color: '#dadce0' }}>•</span>
            <a 
              href="/cases" 
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Case Studies
            </a>
            <span style={{ color: '#dadce0' }}>•</span>
            <a 
              href="/progress" 
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Progress
            </a>
            <span style={{ color: '#dadce0' }}>•</span>
            <a 
              href="/advisor" 
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              AI Advisor
            </a>
            <span style={{ color: '#dadce0' }}>•</span>
            <a 
              href="/market" 
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Market Analysis
            </a>
            <span style={{ color: '#dadce0' }}>•</span>
            <a 
              href="/insights" 
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Personal Insights
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
      
      {/* Year Navigation Section */}
      {!yearsLoading && availableYears && (
        <div style={{
          backgroundColor: 'white',
          borderTop: '1px solid #f3f4f6',
          padding: 'clamp(24px, 6vw, 48px) clamp(16px, 4vw, 20px)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: 'clamp(24px, 6vw, 40px)'
            }}>
              <h2 style={{
                fontSize: 'clamp(20px, 5vw, 28px)',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '12px'
              }}>
                📚 Browse Letters by Year
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                marginBottom: '8px'
              }}>
                {availableYears.stats.total} years of Warren Buffett's wisdom • {availableYears.stats.withSummaries} AI summaries available
              </p>
            </div>

            {/* Classic Era */}
            <div style={{ marginBottom: 'clamp(32px, 8vw, 48px)' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '600',
                  color: '#92400e',
                  margin: 0
                }}>
                  {availableYears.eras.classic.name}
                </h3>
                <span style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  borderRadius: '12px',
                  fontWeight: '500'
                }}>
                  {availableYears.eras.classic.count} years
                </span>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#78716c',
                marginBottom: '24px'
              }}>
                {availableYears.eras.classic.description}
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 45vw), 1fr))',
                gap: 'clamp(12px, 3vw, 16px)'
              }}>
                {availableYears.eras.classic.years.map((yearData) => (
                  <div
                    key={yearData.year}
                    style={{
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fed7aa',
                      borderRadius: '12px',
                      padding: 'clamp(12px, 4vw, 20px)',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{
                      fontSize: 'clamp(20px, 5vw, 24px)',
                      fontWeight: '700',
                      color: '#92400e',
                      marginBottom: '8px'
                    }}>
                      {yearData.year}
                    </div>
                    
                    {yearData.highlight && (
                      <div style={{
                        fontSize: '11px',
                        color: '#d97706',
                        fontWeight: '600',
                        marginBottom: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {yearData.highlight}
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      {yearData.hasLetter && (
                        <a
                          href={`/letters/${yearData.year}`}
                          style={{
                            display: 'block',
                            padding: '8px 12px',
                            fontSize: '13px',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#d97706'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f59e0b'
                          }}
                        >
                          📖 Full Letter
                        </a>
                      )}
                      
                      {yearData.hasSummary && (
                        <a
                          href={`/letters/${yearData.year}/summary`}
                          style={{
                            display: 'block',
                            padding: '8px 12px',
                            fontSize: '13px',
                            backgroundColor: '#fbbf24',
                            color: '#92400e',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f59e0b'
                            e.currentTarget.style.color = 'white'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fbbf24'
                            e.currentTarget.style.color = '#92400e'
                          }}
                        >
                          ✨ AI Summary
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modern Era */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '600',
                  color: '#1e40af',
                  margin: 0
                }}>
                  {availableYears.eras.modern.name}
                </h3>
                <span style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '12px',
                  fontWeight: '500'
                }}>
                  {availableYears.eras.modern.count} years
                </span>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '24px'
              }}>
                {availableYears.eras.modern.description}
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 45vw), 1fr))',
                gap: 'clamp(12px, 3vw, 16px)'
              }}>
                {availableYears.eras.modern.years.map((yearData) => (
                  <div
                    key={yearData.year}
                    style={{
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      borderRadius: '12px',
                      padding: 'clamp(12px, 4vw, 20px)',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{
                      fontSize: 'clamp(20px, 5vw, 24px)',
                      fontWeight: '700',
                      color: '#1e40af',
                      marginBottom: '8px'
                    }}>
                      {yearData.year}
                    </div>
                    
                    {yearData.highlight && (
                      <div style={{
                        fontSize: '11px',
                        color: '#2563eb',
                        fontWeight: '600',
                        marginBottom: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {yearData.highlight}
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      {yearData.hasLetter && (
                        <a
                          href={`/letters/${yearData.year}`}
                          style={{
                            display: 'block',
                            padding: '8px 12px',
                            fontSize: '13px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#2563eb'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#3b82f6'
                          }}
                        >
                          📖 Full Letter
                        </a>
                      )}
                      
                      {yearData.hasSummary && (
                        <a
                          href={`/letters/${yearData.year}/summary`}
                          style={{
                            display: 'block',
                            padding: '8px 12px',
                            fontSize: '13px',
                            backgroundColor: '#60a5fa',
                            color: '#1e40af',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#3b82f6'
                            e.currentTarget.style.color = 'white'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#60a5fa'
                            e.currentTarget.style.color = '#1e40af'
                          }}
                        >
                          ✨ AI Summary
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
