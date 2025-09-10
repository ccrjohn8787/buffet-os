import { NextRequest } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: { year: string } }) {
  const { year } = params
  const host = process.env.NEXT_PUBLIC_TYPESENSE_HOST || 'localhost'
  const port = process.env.NEXT_PUBLIC_TYPESENSE_PORT || '8108'
  const protocol = process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || 'http'
  const apiKey = process.env.TYPESENSE_API_KEY || 'xyz'

  try {
    const r = await fetch(`${protocol}://${host}:${port}/collections/sections/documents/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TYPESENSE-API-KEY': apiKey
      },
      body: JSON.stringify({ q: '*', query_by: 'text', per_page: 200, filter_by: `source:=letters && year:=${year}` })
    })
    const data = await r.json()
    const hits = (data.hits || []).map((h: any) => h.document)
    // Sort by anchor number (¶N)
    hits.sort((a: any, b: any) => {
      const pa = parseInt(String(a.anchor).replace(/[^0-9]/g, '') || '0', 10)
      const pb = parseInt(String(b.anchor).replace(/[^0-9]/g, '') || '0', 10)
      return pa - pb
    })
    const sections = hits.map((h: any) => ({ id: h.id, anchor: h.anchor, text: h.text, year: h.year, title: h.title, section_checksum: h.section_checksum, doc_sha256: h.doc_sha256, parser_version: h.parser_version }))
    return new Response(JSON.stringify({ sections }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    // Fallback to local normalized JSONL
    try {
      const fs = await import('fs')
      const path = await import('path')
      const normDir = path.resolve(process.cwd(), '../../data/normalized')
      const file = path.join(normDir, `letters_${year}.jsonl`)
      const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)
      const hits = lines.map(l => JSON.parse(l))
      hits.sort((a: any, b: any) => {
        const pa = parseInt(String(a.anchor).replace(/[^0-9]/g, '') || '0', 10)
        const pb = parseInt(String(b.anchor).replace(/[^0-9]/g, '') || '0', 10)
        return pa - pb
      })
      const sections = hits.map((h: any) => ({ id: h.id, anchor: h.anchor, text: h.text, year: h.year, title: h.title, section_checksum: h.section_checksum, doc_sha256: h.doc_sha256, parser_version: h.parser_version }))
      return new Response(JSON.stringify({ sections }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    } catch (e2: any) {
      return new Response(JSON.stringify({ error: e2?.message || 'letter_fetch_failed' }), { status: 500 })
    }
  }
}
