import { NextRequest } from 'next/server'

// In-memory cache for search results and file content
const cache = new Map<string, any>()
const fileCache = new Map<string, any[]>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

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
    // Fallback: search local normalized files with optimized performance and caching
    try {
      // Check cache first
      const cacheKey = `search:${q}:${year || 'all'}`
      const cached = cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return new Response(JSON.stringify({ hits: cached.data }), { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' } 
        })
      }

      const fs = await import('fs')
      const path = await import('path')
      const normDir = path.resolve(process.cwd(), '../../data/normalized')
      
      if (!fs.existsSync(normDir)) {
        return new Response(JSON.stringify({ hits: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      
      const files = fs.readdirSync(normDir).filter(f => f.startsWith('letters_') && f.endsWith('.jsonl'))
      const results: any[] = []
      const queryLower = q.toLowerCase()
      const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2)
      
      // Sort files by year (most recent first) for better user experience
      files.sort((a, b) => {
        const yearA = parseInt(a.match(/letters_(\d{4})\.jsonl/)?.[1] || '0', 10)
        const yearB = parseInt(b.match(/letters_(\d{4})\.jsonl/)?.[1] || '0', 10)
        return yearB - yearA
      })
      
      for (const file of files) {
        const yearMatch = file.match(/letters_(\d{4})\.jsonl/)
        const fileYear = yearMatch ? parseInt(yearMatch[1], 10) : undefined
        
        // Skip file if year filter doesn't match
        if (year && fileYear !== parseInt(year, 10)) continue
        
        const full = path.join(normDir, file)
        
        // Check file cache first
        let documents = fileCache.get(full)
        if (!documents) {
          const content = fs.readFileSync(full, 'utf8')
          const lines = content.split('\n').filter(Boolean)
          documents = lines.map(line => {
            try {
              const doc = JSON.parse(line)
              // Pre-compute lowercase text for faster searching
              return { ...doc, _searchText: String(doc.text).toLowerCase() }
            } catch {
              return null
            }
          }).filter(Boolean)
          
          // Cache parsed documents
          fileCache.set(full, documents)
        }
        
        for (const doc of documents) {
          if (!doc) continue
          
          const text = doc._searchText
          
          // Improved matching: check if query is found
          let matches = false
          let score = 0
          
          if (!q) {
            matches = true
          } else if (queryWords.length === 0) {
            matches = text.includes(queryLower)
            if (matches) {
              score = text.indexOf(queryLower) === 0 ? 15 : 10 // Boost if starts with query
            }
          } else {
            // For multi-word queries, use more sophisticated scoring
            const wordMatches = queryWords.map(word => {
              const count = (text.match(new RegExp(word, 'g')) || []).length
              return { word, count, found: count > 0 }
            })
            
            const foundWords = wordMatches.filter(w => w.found).length
            const allWordsFound = foundWords === queryWords.length
            
            if (allWordsFound) {
              matches = true
              
              // Calculate relevance score
              score = foundWords * 5 // Base score for each word
              
              // Boost for exact phrase match
              if (text.includes(queryLower)) score += 20
              
              // Boost for early appearance
              const firstWordIndex = text.indexOf(queryWords[0])
              if (firstWordIndex >= 0 && firstWordIndex < 50) score += 10
              else if (firstWordIndex >= 0 && firstWordIndex < 200) score += 5
              
              // Add frequency bonuses
              wordMatches.forEach(({ count }) => score += count)
              
              // Boost shorter texts (more focused results)
              if (text.length < 500) score += 3
            } else if (foundWords >= Math.ceil(queryWords.length * 0.7)) {
              // Partial match for complex queries
              matches = true
              score = foundWords * 2
            }
          }
          
          if (matches) {
            // Remove search text before adding to results
            const { _searchText, ...cleanDoc } = doc
            results.push({ ...cleanDoc, _score: score })
          }
          
          // Early exit if we have enough results and no specific year filter
          if (!year && results.length >= 100) break
        }
        
        // Early exit if we have enough results and no specific year filter
        if (!year && results.length >= 100) break
      }
      
      // Sort by relevance score, then by year (newest first)
      results.sort((a, b) => {
        if (a._score !== b._score) return (b._score || 0) - (a._score || 0)
        return (b.year || 0) - (a.year || 0)
      })
      
      // Remove score field and limit results
      const finalResults = results.slice(0, 20).map(({ _score, ...doc }) => doc)
      
      // Cache the results
      cache.set(cacheKey, { data: finalResults, timestamp: Date.now() })
      
      // Clean old cache entries periodically
      if (cache.size > 100) {
        const oldEntries = Array.from(cache.entries())
          .filter(([_, value]) => Date.now() - value.timestamp > CACHE_TTL)
        oldEntries.forEach(([key]) => cache.delete(key))
      }
      
      return new Response(JSON.stringify({ hits: finalResults }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' } 
      })
    } catch (e2: any) {
      return new Response(JSON.stringify({ error: e2?.message || 'search_failed' }), { status: 500 })
    }
  }
}
