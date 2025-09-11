"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import ErrorBoundary from "../../components/error-boundary";

type Section = { 
  id: string; 
  anchor: string; 
  text: string; 
  title: string; 
  year: number; 
  section_checksum?: string;
};

export default function LetterReader() {
  const params = useParams<{ year: string }>();
  const year = params.year;
  const [sections, setSections] = useState<Section[]>([]);
  const [highlights, setHighlights] = useState<Section[]>([]);
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('');
  const [showOutline, setShowOutline] = useState(false);
  const [copiedAnchor, setCopiedAnchor] = useState<string>('');
  const [visibleSections, setVisibleSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // Progressive loading constants
  const INITIAL_LOAD = 50; // Load first 50 sections
  const LOAD_MORE_THRESHOLD = 1000; // Load more when 1000px from bottom

  useEffect(() => {
    async function run() {
      setLoading(true);
      try {
        const r = await fetch(`/api/letters/${year}`);
        
        if (!r.ok) {
          throw new Error(`Failed to load letter: ${r.status} ${r.statusText}`);
        }
        
        const data = await r.json();
        const allSections = data.sections || [];
        setSections(allSections);
        
        // Load initial batch progressively
        setVisibleSections(allSections.slice(0, INITIAL_LOAD));
      } catch (error) {
        console.error('Error loading letter:', error);
        // Handle error gracefully
        setSections([]);
        setVisibleSections([]);
      } finally {
        setLoading(false);
      }
    }
    run();
    
    // Load highlights from localStorage
    const key = `buffetos_highlights_${year}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) setHighlights(JSON.parse(raw));
    } catch {}

    // Check mobile viewport
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Smooth scroll to anchor if present in URL
    if (window.location.hash) {
      setTimeout(() => {
        const anchorId = decodeURIComponent(window.location.hash.slice(1));
        const element = document.getElementById(anchorId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 1000);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, [year]);

  // Progressive loading based on scroll position
  useEffect(() => {
    const handleLoadMore = () => {
      if (visibleSections.length >= sections.length) return;
      
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset;
      const clientHeight = window.innerHeight;
      
      if (scrollHeight - scrollTop - clientHeight < LOAD_MORE_THRESHOLD) {
        const nextBatch = sections.slice(visibleSections.length, visibleSections.length + 25);
        setVisibleSections(prev => [...prev, ...nextBatch]);
      }
    };

    window.addEventListener('scroll', handleLoadMore);
    return () => window.removeEventListener('scroll', handleLoadMore);
  }, [sections, visibleSections]);

  // Reading progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight - winHeight;
      const scrollTop = window.pageYOffset;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(progress, 100));

      // Update active section
      const sectionElements = sections.map(s => ({
        anchor: s.anchor,
        element: document.getElementById(s.anchor)
      })).filter(s => s.element);

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const rect = sectionElements[i].element!.getBoundingClientRect();
        if (rect.top <= winHeight / 3) {
          setActiveSection(sectionElements[i].anchor);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
      
      switch (e.key) {
        case 'o':
          setShowOutline(!showOutline);
          break;
        case 'h':
          if (activeSection) {
            const section = sections.find(s => s.anchor === activeSection);
            if (section) addHighlight(section);
          }
          break;
        case 'Escape':
          setShowOutline(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showOutline, activeSection, sections]);

  const saveHighlights = (items: Section[]) => {
    const key = `buffetos_highlights_${year}`;
    setHighlights(items);
    try { localStorage.setItem(key, JSON.stringify(items)); } catch {}
  };

  const addHighlight = (s: Section) => {
    if (highlights.find(h => h.id === s.id)) return;
    const next = [...highlights, s];
    saveHighlights(next);
  };

  const removeHighlight = (id: string) => {
    saveHighlights(highlights.filter(h => h.id !== id));
  };

  const exportMarkdown = () => {
    const lines: string[] = [];
    lines.push(`# Highlights — Berkshire Hathaway ${year}`);
    lines.push(`\nGenerated from Buffett OS on ${new Date().toLocaleDateString()}\n`);
    
    for (const h of highlights) {
      const url = window.location.origin + `/letters/${year}#${encodeURIComponent(h.anchor)}`;
      lines.push(`## ${h.anchor}\n`);
      lines.push(`> ${h.text}\n`);
      lines.push(`**Source:** [${h.anchor}](${url})\n`);
    }
    
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `buffett_highlights_${year}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const copyCitation = async (text: string, anchor: string, checksum?: string) => {
    if (checksum) {
      const enc = new TextEncoder().encode(text);
      const buf = await crypto.subtle.digest('SHA-256', enc);
      const computed = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      if (computed !== checksum) {
        alert('⚠️ Provenance verification failed. Quote may have been modified.');
        return;
      }
    }
    
    const url = window.location.origin + `/letters/${year}#${encodeURIComponent(anchor)}`;
    const cite = `"${text}" — Warren E. Buffett, Berkshire Hathaway Shareholder Letter, ${year}, ${anchor}, ${url}`;
    
    await navigator.clipboard.writeText(cite);
    setCopiedAnchor(anchor);
    setTimeout(() => setCopiedAnchor(''), 2000);
  };

  const scrollToSection = (anchor: string) => {
    const element = document.getElementById(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setShowOutline(false);
    }
  };

  const isHighlighted = (sectionId: string) => highlights.some(h => h.id === sectionId);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fefefe',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Reading Progress Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        backgroundColor: '#f3f4f6',
        zIndex: 1000
      }}>
        <div style={{
          height: '100%',
          backgroundColor: '#3b82f6',
          width: `${readingProgress}%`,
          transition: 'width 0.1s ease'
        }} />
      </div>

      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(254, 254, 254, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 100,
        padding: '16px 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: `0 ${isMobile ? '16px' : '24px'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a href="/" style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#3b82f6',
              textDecoration: 'none'
            }}>
              Buffett OS
            </a>
            <div style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              {year} Letter • {sections.length} sections
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setShowOutline(!showOutline)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: showOutline ? '#3b82f6' : 'transparent',
                color: showOutline ? 'white' : '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Outline
            </button>
            
            {highlights.length > 0 && (
              <button
                onClick={exportMarkdown}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Export {highlights.length} highlights
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Outline Sidebar */}
      {showOutline && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: !isMobile ? '24px' : '12px',
          right: isMobile ? '12px' : 'auto',
          width: !isMobile ? '300px' : 'auto',
          maxHeight: 'calc(100vh - 100px)',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          zIndex: 200,
          overflow: 'auto'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
              Letter Outline
            </h3>
          </div>
          <div style={{ padding: '8px' }}>
            {sections.slice(0, 50).map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.anchor)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  fontSize: '13px',
                  backgroundColor: activeSection === section.anchor ? '#f0f9ff' : 'transparent',
                  color: activeSection === section.anchor ? '#0369a1' : '#374151',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '2px',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== section.anchor) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== section.anchor) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                  {section.anchor}
                </div>
                <div style={{ 
                  color: '#6b7280', 
                  fontSize: '12px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {section.text.substring(0, 60)}...
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: `${isMobile ? '20px 16px' : '40px 24px'}`,
        lineHeight: 1.8
      }}>
        <header style={{ 
          textAlign: 'center', 
          marginBottom: '60px',
          paddingBottom: '40px',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 16px 0',
            letterSpacing: '-0.5px'
          }}>
            Berkshire Hathaway
          </h1>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '400',
            color: '#6b7280',
            margin: '0 0 16px 0'
          }}>
            {year} Shareholder Letter
          </h2>
          <div style={{
            fontSize: '14px',
            color: '#9ca3af',
            fontStyle: 'italic'
          }}>
            Warren E. Buffett, Chairman
          </div>
        </header>

        <ErrorBoundary fallback={
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            margin: '20px 0'
          }}>
            <h3 style={{ color: '#dc2626', marginBottom: '16px' }}>
              Unable to load letter content
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              There was an error loading the {year} letter. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
          </div>
        }>
          <article>
            {loading ? (
              <div style={{
                padding: '60px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #e5e7eb',
                  borderTop: '3px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'rotate 1s linear infinite',
                  margin: '0 auto 16px'
                }} />
                Loading {year} letter...
              </div>
            ) : visibleSections.length === 0 ? (
              <div style={{
                padding: '60px',
                textAlign: 'center',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ color: '#374151', marginBottom: '16px' }}>
                  Letter not found
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                  The {year} letter is not available. Please check if the year is correct.
                </p>
                <a
                  href="/"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                >
                  Back to Search
                </a>
              </div>
            ) : (
              visibleSections.map((section, index) => (
            <div key={section.id} style={{ marginBottom: '1.5em' }}>
              {/* Anchor Point */}
              <div
                id={section.anchor}
                style={{
                  position: 'relative',
                  scrollMarginTop: '100px',
                  minHeight: '1px'
                }}
              />
              
              {/* Text Content with Book-like Flow */}
              <div
                style={{
                  position: 'relative',
                  backgroundColor: isHighlighted(section.id) ? '#fef3c7' : 'transparent',
                  borderRadius: isHighlighted(section.id) ? '4px' : '0',
                  padding: isHighlighted(section.id) ? '8px 12px' : '0',
                  transition: 'all 0.3s ease',
                  border: isHighlighted(section.id) ? '1px solid #f59e0b' : 'none',
                  group: 'section'
                }}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    const buttons = e.currentTarget.querySelector('.section-actions') as HTMLElement;
                    if (buttons) buttons.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    const buttons = e.currentTarget.querySelector('.section-actions') as HTMLElement;
                    if (buttons) buttons.style.opacity = '0';
                  }
                }}
              >
                {/* Paragraph Number (Floating) */}
                {!isMobile && (
                  <div style={{
                    position: 'absolute',
                    left: '-50px',
                    top: '0px',
                    width: '36px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    color: '#9ca3af',
                    backgroundColor: '#f9fafb',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    opacity: '0.6'
                  }}>
                    {section.anchor.replace('¶', '')}
                  </div>
                )}

                {/* Text with Natural Flow */}
                <span style={{
                  fontSize: '19px',
                  lineHeight: '1.75',
                  color: '#1f2937',
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  textAlign: 'justify',
                  display: 'inline'
                }}>
                  {section.text}
                </span>

                {/* Floating Action Buttons */}
                <div 
                  className="section-actions"
                  style={{
                    position: 'absolute',
                    right: '-80px',
                    top: '0px',
                    display: isMobile ? 'none' : 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    opacity: '0',
                    transition: 'opacity 0.2s'
                  }}
                >
                  <button
                    onClick={() => copyCitation(section.text, section.anchor, section.section_checksum)}
                    title="Copy citation"
                    style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: copiedAnchor === section.anchor ? '#10b981' : '#f3f4f6',
                      color: copiedAnchor === section.anchor ? 'white' : '#6b7280',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    📋
                  </button>

                  <button
                    onClick={() => addHighlight(section)}
                    title="Highlight"
                    style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: isHighlighted(section.id) ? '#fbbf24' : '#f3f4f6',
                      color: isHighlighted(section.id) ? 'white' : '#6b7280',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    ✏️
                  </button>

                  <a
                    href={`/quote/${year}/${encodeURIComponent(section.anchor)}`}
                    title="Share quote"
                    style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      border: 'none',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    🔗
                  </a>
                </div>

                {/* Mobile Actions (Bottom of section) */}
                {isMobile && (
                  <div style={{
                    marginTop: '12px',
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'flex-end'
                  }}>
                    <button
                      onClick={() => copyCitation(section.text, section.anchor, section.section_checksum)}
                      style={{
                        padding: '6px 10px',
                        fontSize: '11px',
                        backgroundColor: copiedAnchor === section.anchor ? '#10b981' : '#f3f4f6',
                        color: copiedAnchor === section.anchor ? 'white' : '#6b7280',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      📋
                    </button>
                    <button
                      onClick={() => addHighlight(section)}
                      style={{
                        padding: '6px 10px',
                        fontSize: '11px',
                        backgroundColor: isHighlighted(section.id) ? '#fbbf24' : '#f3f4f6',
                        color: isHighlighted(section.id) ? 'white' : '#6b7280',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </div>
            </div>
              ))
            )}
          
          {/* Progressive Loading Indicator */}
          {!loading && visibleSections.length > 0 && visibleSections.length < sections.length && (
            <div style={{
              textAlign: 'center',
              padding: '40px 0',
              color: '#6b7280'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 24px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #e5e7eb',
                  borderTop: '2px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'rotate 1s linear infinite'
                }} />
                <span style={{ fontSize: '14px' }}>
                  Loading more sections... ({visibleSections.length} of {sections.length})
                </span>
              </div>
            </div>
          )}
          </article>
        </ErrorBoundary>

        {/* Highlights Summary */}
        {highlights.length > 0 && (
          <footer style={{
            marginTop: '80px',
            padding: '32px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 20px 0'
            }}>
              Your Highlights ({highlights.length})
            </h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              {highlights.map((highlight) => (
                <div key={highlight.id} style={{
                  padding: '16px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      {highlight.anchor}
                    </span>
                    <button
                      onClick={() => removeHighlight(highlight.id)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#374151',
                    margin: 0
                  }}>
                    "{highlight.text}"
                  </p>
                </div>
              ))}
            </div>
          </footer>
        )}
      </main>

      {/* Keyboard Shortcuts Help */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '12px 16px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        fontSize: '12px',
        borderRadius: '8px',
        zIndex: 300
      }}>
        <div><kbd>o</kbd> outline • <kbd>h</kbd> highlight • <kbd>esc</kbd> close</div>
      </div>
    </div>
  );
}