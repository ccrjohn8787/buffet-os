import QuoteCard from "../../../components/quote-card";
import { Metadata } from 'next';

interface QuotePageProps {
  params: {
    year: string;
    anchor: string;
  };
  searchParams: {
    q?: string;
  };
}

async function getQuoteData(year: string, anchor: string) {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const normDir = path.resolve(process.cwd(), '../../data/normalized');
    const file = path.join(normDir, `letters_${year}.jsonl`);
    
    if (!fs.existsSync(file)) {
      return null;
    }
    
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n').filter(Boolean);
    
    for (const line of lines) {
      try {
        const doc = JSON.parse(line);
        if (doc.anchor === decodeURIComponent(anchor)) {
          return doc;
        }
      } catch {}
    }
    
    return null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: QuotePageProps): Promise<Metadata> {
  const quote = await getQuoteData(params.year, params.anchor);
  
  if (!quote) {
    return {
      title: 'Quote Not Found - Buffett OS',
    };
  }

  const truncatedText = quote.text.length > 160 
    ? quote.text.substring(0, 160) + '...' 
    : quote.text;

  return {
    title: `"${truncatedText}" - Warren Buffett ${params.year} | Buffett OS`,
    description: `${quote.text} — Warren E. Buffett, ${quote.title}, ${params.year}`,
    openGraph: {
      title: `Warren Buffett Quote from ${params.year}`,
      description: `"${truncatedText}" — Warren E. Buffett`,
      url: `/quote/${params.year}/${params.anchor}`,
      siteName: 'Buffett OS',
      images: [
        {
          url: `/api/quote-image?year=${params.year}&anchor=${encodeURIComponent(params.anchor)}`,
          width: 1200,
          height: 630,
          alt: `Warren Buffett quote from ${params.year}`,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Warren Buffett Quote from ${params.year}`,
      description: `"${truncatedText}" — Warren E. Buffett`,
      images: [`/api/quote-image?year=${params.year}&anchor=${encodeURIComponent(params.anchor)}`],
    },
  };
}

export default async function QuotePage({ params, searchParams }: QuotePageProps) {
  const quote = await getQuoteData(params.year, params.anchor);

  if (!quote) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#fafafa',
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '600px'
        }}>
          <h1 style={{
            fontSize: '24px',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Quote Not Found
          </h1>
          <p style={{
            color: '#6b7280',
            marginBottom: '24px'
          }}>
            The quote you're looking for doesn't exist or may have been moved.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500'
            }}
          >
            Back to Search
          </a>
        </div>
      </div>
    );
  }

  const backToSearch = searchParams.q 
    ? `/search?q=${encodeURIComponent(searchParams.q)}`
    : '/';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      {/* Header */}
      <header style={{
        maxWidth: '800px',
        margin: '0 auto 32px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <a
          href="/"
          style={{
            fontSize: '24px',
            fontWeight: '400',
            color: '#3b82f6',
            textDecoration: 'none',
            letterSpacing: '-0.5px'
          }}
        >
          Buffett OS
        </a>
        
        <a
          href={backToSearch}
          style={{
            fontSize: '14px',
            color: '#6b7280',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            transition: 'all 0.2s'
          }}
        >
          ← Back to Search
        </a>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px'
      }}>
        {/* Primary Quote Card */}
        <QuoteCard
          text={quote.text}
          year={quote.year}
          anchor={quote.anchor}
          title={quote.title}
          source={quote.source}
          showActions={true}
        />

        {/* Additional Formats */}
        <div style={{
          width: '100%',
          maxWidth: '600px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            Share in Different Formats
          </h2>
          
          <div style={{
            display: 'grid',
            gap: '24px'
          }}>
            {/* Social Media Format */}
            <div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#6b7280',
                marginBottom: '12px'
              }}>
                Social Media
              </h3>
              <div style={{
                overflow: 'hidden',
                borderRadius: '8px',
                transform: 'scale(0.8)',
                transformOrigin: 'left top'
              }}>
                <QuoteCard
                  text={quote.text}
                  year={quote.year}
                  anchor={quote.anchor}
                  title={quote.title}
                  variant="social"
                  showActions={false}
                />
              </div>
            </div>

            {/* Print Format */}
            <div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#6b7280',
                marginBottom: '12px'
              }}>
                Print / Document
              </h3>
              <QuoteCard
                text={quote.text}
                year={quote.year}
                anchor={quote.anchor}
                title={quote.title}
                variant="print"
                showActions={false}
              />
            </div>
          </div>
        </div>

        {/* Context Link */}
        <div style={{
          textAlign: 'center',
          padding: '24px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          width: '100%',
          maxWidth: '600px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Read in Full Context
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '16px'
          }}>
            See this quote within the complete {quote.year} shareholder letter
          </p>
          <a
            href={`/letters/${quote.year}#${encodeURIComponent(quote.anchor)}`}
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            Read Full Letter
          </a>
        </div>
      </main>
    </div>
  );
}