import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year');
  const anchor = searchParams.get('anchor');

  if (!year || !anchor) {
    return new Response('Missing parameters', { status: 400 });
  }

  // For now, we'll return a simple SVG-based image
  // In production, this could be enhanced with a proper image generation library
  
  let quote = null;
  
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const normDir = path.resolve(process.cwd(), '../../data/normalized');
    const file = path.join(normDir, `letters_${year}.jsonl`);
    
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n').filter(Boolean);
      
      for (const line of lines) {
        try {
          const doc = JSON.parse(line);
          if (doc.anchor === decodeURIComponent(anchor)) {
            quote = doc;
            break;
          }
        } catch {}
      }
    }
  } catch {}

  if (!quote) {
    return new Response('Quote not found', { status: 404 });
  }

  // Truncate text for image if too long
  const maxLength = 280;
  const displayText = quote.text.length > maxLength 
    ? quote.text.substring(0, maxLength) + '...'
    : quote.text;

  // Generate SVG image
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#grad)"/>
      
      <!-- Quote Text -->
      <foreignObject x="80" y="120" width="1040" height="300">
        <div xmlns="http://www.w3.org/1999/xhtml" style="
          font-family: Georgia, serif;
          font-size: 32px;
          line-height: 1.4;
          color: white;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 0 40px;
        ">
          "${displayText}"
        </div>
      </foreignObject>
      
      <!-- Attribution -->
      <text x="600" y="480" text-anchor="middle" fill="white" font-family="Georgia, serif" font-size="24" font-weight="600">
        Warren E. Buffett
      </text>
      
      <text x="600" y="510" text-anchor="middle" fill="white" font-family="Georgia, serif" font-size="18" opacity="0.9">
        ${quote.title} • ${year}
      </text>
      
      <!-- Branding -->
      <text x="1120" y="610" text-anchor="end" fill="white" font-family="system-ui, sans-serif" font-size="14" opacity="0.7">
        BuffettOS.com
      </text>
      
      <!-- Verification Badge -->
      <circle cx="100" cy="560" r="12" fill="white" opacity="0.9"/>
      <text x="100" y="565" text-anchor="middle" fill="#059669" font-family="system-ui, sans-serif" font-size="12" font-weight="bold">
        ✓
      </text>
      <text x="125" y="565" fill="white" font-family="system-ui, sans-serif" font-size="12" opacity="0.8">
        Verified Quote
      </text>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}