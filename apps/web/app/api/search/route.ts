import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const year = searchParams.get('year')

  const host = process.env.NEXT_PUBLIC_TYPESENSE_HOST || 'localhost'
  const port = process.env.NEXT_PUBLIC_TYPESENSE_PORT || '8108'
  const protocol = process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || 'http'
  const apiKey = process.env.TYPESENSE_API_KEY || 'xyz'

  const searchBody: any = {
    q,
    query_by: 'text',
    per_page: 20,
    filter_by: 'source:=letters'
  }
  if (year) {
    searchBody.filter_by += ` && year:=${year}`
  }

  try {
    const r = await fetch(`${protocol}://${host}:${port}/collections/sections/documents/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TYPESENSE-API-KEY': apiKey
      },
      body: JSON.stringify(searchBody)
    })
    const data = await r.json()
    const hits = (data.hits || []).map((h: any) => h.document)
    return new Response(JSON.stringify({ hits }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    // Fallback: search local normalized files (dev only)
    try {
      const fs = await import('fs')
      const path = await import('path')
      const normDir = path.resolve(process.cwd(), '../../data/normalized')
      const files = fs.readdirSync(normDir).filter(f => f.startsWith('letters_') && f.endsWith('.jsonl'))
      const results: any[] = []
      for (const file of files) {
        const yearMatch = file.match(/letters_(\d{4})\.jsonl/)
        const fileYear = yearMatch ? parseInt(yearMatch[1], 10) : undefined
        if (year && fileYear !== parseInt(year, 10)) continue
        const full = path.join(normDir, file)
        const lines = fs.readFileSync(full, 'utf8').split('\n').filter(Boolean)
        for (const line of lines) {
          try {
            const doc = JSON.parse(line)
            if (!q || String(doc.text).toLowerCase().includes(q.toLowerCase())) {
              results.push(doc)
            }
          } catch {}
        }
      }
      return new Response(JSON.stringify({ hits: results.slice(0, 20) }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    } catch (e2: any) {
      return new Response(JSON.stringify({ error: e2?.message || 'search_failed' }), { status: 500 })
    }
  }
}
