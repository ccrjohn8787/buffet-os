"use client";
import Results from "./results";
import YearTimeline from "./year-timeline";
import ErrorBoundary from "../components/error-boundary";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [year, setYear] = useState("");
  
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setQ(sp.get('q') || "");
    setYear(sp.get('year') || "");
    const onPop = () => {
      const sp2 = new URLSearchParams(window.location.search);
      setQ(sp2.get('q') || "");
      setYear(sp2.get('year') || "");
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #dadce0',
        padding: '12px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(12px, 3vw, 20px)',
          flexWrap: 'wrap'
        }}>
          <a 
            href="/" 
            style={{
              fontSize: '24px',
              fontWeight: '400',
              color: '#1a73e8',
              textDecoration: 'none',
              letterSpacing: '-0.5px'
            }}
          >
            Buffett OS
          </a>
          
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              const sp = new URLSearchParams(); 
              if (q) sp.set('q', q); 
              if (year) sp.set('year', year); 
              router.push(`/search?${sp.toString()}`); 
            }} 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(8px, 2vw, 12px)',
              flex: 1,
              maxWidth: '600px',
              minWidth: '280px'
            }}
          >
            <input 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              placeholder="Search letters..." 
              style={{ 
                flex: 1,
                padding: '10px 16px',
                fontSize: '14px',
                border: '1px solid #dadce0',
                borderRadius: '24px',
                outline: 'none',
                backgroundColor: '#f8f9fa'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'white'
                e.target.style.boxShadow = '0 2px 5px 1px rgba(64,60,67,.16)'
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = '#f8f9fa'
                e.target.style.boxShadow = 'none'
              }}
            />
            <input 
              value={year} 
              onChange={(e) => setYear(e.target.value)} 
              placeholder="Year" 
              style={{ 
                width: '80px',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #dadce0',
                borderRadius: '20px',
                outline: 'none',
                backgroundColor: '#f8f9fa',
                textAlign: 'center'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'white'
                e.target.style.boxShadow = '0 2px 5px 1px rgba(64,60,67,.16)'
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = '#f8f9fa'
                e.target.style.boxShadow = 'none'
              }}
            />
            <button 
              type="submit" 
              style={{ 
                padding: '10px 16px',
                fontSize: '14px',
                backgroundColor: '#1a73e8',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1557b0'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a73e8'
              }}
            >
              Search
            </button>
          </form>
        </div>
      </header>

      <main style={{
        padding: '24px 20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {q && (
          <div style={{
            marginBottom: '24px',
            color: '#70757a',
            fontSize: '14px'
          }}>
            {year ? `Results for "${q}" in ${year}` : `Results for "${q}"`}
          </div>
        )}

        <ErrorBoundary fallback={
          <div style={{
            padding: '24px',
            textAlign: 'center',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626'
          }}>
            <p>Unable to load search interface. Please refresh the page.</p>
          </div>
        }>
          {q && (
            <YearTimeline 
              selectedYear={year} 
              onYearChange={(newYear) => {
                const sp = new URLSearchParams();
                if (q) sp.set('q', q);
                if (newYear) sp.set('year', newYear);
                router.push(`/search?${sp.toString()}`);
              }}
            />
          )}
        </ErrorBoundary>
        
        <ErrorBoundary fallback={
          <div style={{
            padding: '24px',
            textAlign: 'center',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626'
          }}>
            <p>Unable to load search results. Please try a different query.</p>
          </div>
        }>
          <Results q={q} year={year} />
        </ErrorBoundary>
      </main>
    </div>
  );
}
