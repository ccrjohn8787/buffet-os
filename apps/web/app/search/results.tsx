"use client";
import { useEffect, useState } from "react";

type Hit = {
  id: string;
  document_id: number;
  title: string;
  year: number;
  source: string;
  anchor: string;
  text: string;
};

export default function Results({ q, year }: { q: string; year?: string }) {
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    async function run() {
      if (!q) {
        setHits([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const params = new URLSearchParams({ q });
        if (year) params.set("year", year);
        const r = await fetch(`/api/search?${params.toString()}`, { signal: controller.signal });
        
        if (!r.ok) {
          throw new Error(`Search failed: ${r.status} ${r.statusText}`);
        }
        
        const data = await r.json();
        setHits(data.hits || []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Search error:', error);
          // Set empty results on error
          setHits([]);
        }
      } finally {
        setLoading(false);
      }
    }
    run();
    return () => controller.abort();
  }, [q, year]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!hits.length) return
      if (e.key === 'j') { e.preventDefault(); setSel((s) => Math.min(s + 1, hits.length - 1)) }
      if (e.key === 'k') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
      if (e.key === 'o') { e.preventDefault(); window.location.href = `/letters/${hits[sel].year}#${encodeURIComponent(hits[sel].anchor)}` }
      if (e.key === 'c') { e.preventDefault(); copyCitation(hits[sel]) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hits, sel])

  const copyCitation = async (h: Hit) => {
    const url = window.location.origin + `/letters/${h.year}#${encodeURIComponent(h.anchor)}`
    const cite = `"${h.text}" — Warren E. Buffett, Berkshire Hathaway Shareholder Letter, ${h.year}, ${h.anchor}, ${url}`
    await navigator.clipboard.writeText(cite)
    // no alert to avoid noise; consider toast in future
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const words = query.trim().toLowerCase().split(/\s+/);
    let highlightedText = text;
    
    words.forEach(word => {
      if (word.length > 2) { // Only highlight meaningful words
        const regex = new RegExp(`(${word})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark style="background-color: #fff3cd; font-weight: 600;">$1</mark>');
      }
    });
    
    return highlightedText;
  }

  if (loading) return (
    <div style={{ 
      textAlign: 'center', 
      padding: '40px', 
      color: '#70757a',
      fontSize: '16px' 
    }}>
      Searching…
    </div>
  );
  
  if (!hits.length) return (
    <div style={{ 
      textAlign: 'center', 
      padding: '40px', 
      color: '#70757a',
      fontSize: '16px' 
    }}>
      No results found. Try different keywords or check spelling.
    </div>
  );

  return (
    <div style={{ 
      display: 'grid', 
      gap: '16px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {hits.map((h, i) => (
        <article 
          key={h.id} 
          style={{ 
            border: i === sel ? '2px solid #1a73e8' : '1px solid #dadce0',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white',
            boxShadow: i === sel ? '0 2px 8px rgba(26, 115, 232, 0.15)' : '0 1px 3px rgba(0,0,0,0.12)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onClick={() => window.location.href = `/letters/${h.year}#${encodeURIComponent(h.anchor)}`}
        >
          <header style={{ 
            fontSize: '13px', 
            color: '#5f6368',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontWeight: '500' }}>{h.title}</span>
            <span>·</span>
            <span>{h.year}</span>
            <span>·</span>
            <span style={{ 
              fontFamily: 'monospace',
              backgroundColor: '#f8f9fa',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {h.anchor}
            </span>
          </header>
          
          <div 
            style={{ 
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#202124',
              marginBottom: '12px'
            }}
            dangerouslySetInnerHTML={{ 
              __html: highlightText(h.text, q) 
            }}
          />
          
          <footer style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <a 
              href={`/letters/${h.year}#${encodeURIComponent(h.anchor)}`}
              style={{
                color: '#1a73e8',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              Read in context
            </a>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyCitation(h);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#5f6368',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              title="Copy citation (hotkey: c)"
            >
              Copy citation
            </button>
            <a
              href={`/quote/${h.year}/${encodeURIComponent(h.anchor)}${q ? `?q=${encodeURIComponent(q)}` : ''}`}
              style={{
                background: 'none',
                border: 'none',
                color: '#1a73e8',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'background-color 0.2s',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              onClick={(e) => e.stopPropagation()}
              title="Share this quote"
            >
              Share quote
            </a>
          </footer>
        </article>
      ))}
      
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#5f6368',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>Keyboard shortcuts:</strong>
        </div>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span><kbd style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: '3px' }}>j/k</kbd> navigate</span>
          <span><kbd style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: '3px' }}>o</kbd> open</span>
          <span><kbd style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: '3px' }}>c</kbd> copy citation</span>
        </div>
      </div>
    </div>
  );
}
