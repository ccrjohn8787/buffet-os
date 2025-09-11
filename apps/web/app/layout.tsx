import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Buffett OS - Search Warren Buffett\'s Letters with Exact Quotes',
    template: '%s | Buffett OS'
  },
  description: 'Search Warren Buffett\'s shareholder letters with exact quotes and citations. Zero-hallucination, provenance-first access to Berkshire Hathaway wisdom.',
  keywords: ['Warren Buffett', 'Berkshire Hathaway', 'shareholder letters', 'investing', 'quotes', 'citations'],
  authors: [{ name: 'Buffett OS' }],
  creator: 'Buffett OS',
  publisher: 'Buffett OS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://buffettos.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Buffett OS',
    title: 'Buffett OS - Search Warren Buffett\'s Letters with Exact Quotes',
    description: 'Search Warren Buffett\'s shareholder letters with exact quotes and citations. Zero-hallucination, provenance-first access to Berkshire Hathaway wisdom.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Buffett OS - Warren Buffett Letter Search',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buffett OS - Search Warren Buffett\'s Letters',
    description: 'Zero-hallucination search through Warren Buffett\'s shareholder letters with exact quotes and citations.',
    images: ['/og-image.png'],
    creator: '@buffettos',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif', 
        margin: 0, 
        padding: 0,
        backgroundColor: '#fafafa',
        color: '#1f2937',
        lineHeight: 1.6
      }}>
        {children}
      </body>
    </html>
  );
}

