"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Section = { id: string; anchor: string; text: string; title: string; year: number; section_checksum?: string };

export default function LetterReader() {
  const params = useParams<{ year: string }>();
  const year = params.year;
  const [sections, setSections] = useState<Section[]>([]);
  const [highlights, setHighlights] = useState<Section[]>([]);

  useEffect(() => {
    async function run() {
      const r = await fetch(`/api/letters/${year}`);
      const data = await r.json();
      setSections(data.sections || []);
    }
    run();
    // load highlights
    const key = `buffetos_highlights_${year}`
    try {
      const raw = localStorage.getItem(key)
      if (raw) setHighlights(JSON.parse(raw))
    } catch {}
  }, [year]);

  const saveHighlights = (items: Section[]) => {
    const key = `buffetos_highlights_${year}`
    setHighlights(items)
    try { localStorage.setItem(key, JSON.stringify(items)) } catch {}
  }

  const addHighlight = (s: Section) => {
    if (highlights.find(h => h.id === s.id)) return
    const next = [...highlights, s]
    saveHighlights(next)
  }

  const removeHighlight = (id: string) => {
    saveHighlights(highlights.filter(h => h.id !== id))
  }

  const exportMarkdown = () => {
    const lines: string[] = []
    lines.push(`# Highlights — Berkshire Hathaway ${year}`)
    for (const h of highlights) {
      const url = typeof window !== 'undefined' ? window.location.origin + `/letters/${year}#${encodeURIComponent(h.anchor)}` : ''
      lines.push(`\n> ${h.text}`)
      lines.push(`\n— Warren E. Buffett, Berkshire Hathaway Shareholder Letter, ${year}, ${h.anchor}, ${url}`)
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `highlights_${year}.md`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const makeCitation = (text: string, anchor: string) => {
    const url = typeof window !== 'undefined' ? window.location.origin + `/letters/${year}#${encodeURIComponent(anchor)}` : ''
    return `${text}` + ` — Warren E. Buffett, Berkshire Hathaway Shareholder Letter, ${year}, ${anchor}, ${url}`
  }

  async function sha256Str(s: string) {
    const enc = new TextEncoder().encode(s)
    const buf = await crypto.subtle.digest('SHA-256', enc)
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const copyCitation = async (text: string, anchor: string, checksum?: string) => {
    if (checksum) {
      const computed = await sha256Str(text)
      if (computed !== checksum) {
        alert('Provenance check failed; not copying quote (mismatch)')
        return
      }
    }
    const cite = makeCitation(text, anchor)
    await navigator.clipboard.writeText(cite)
    alert('Copied with citation!')
  }

  return (
    <div>
      <h2>Berkshire Hathaway Shareholder Letter {year}</h2>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 2 }}>
          <div>
            {sections.map((s) => (
              <div key={s.id}>
                <p id={s.anchor} style={{ scrollMarginTop: 80 }}>{s.text}</p>
                <button onClick={() => copyCitation(s.text, s.anchor, s.section_checksum)}>Copy with citation</button>
                <button onClick={() => addHighlight(s)}>Highlight</button>
              </div>
            ))}
          </div>
        </div>
        <aside style={{ flex: 1, position: 'sticky', top: 24, alignSelf: 'flex-start' }}>
          <h3>Highlights ({highlights.length})</h3>
          <button onClick={exportMarkdown} disabled={!highlights.length}>Export .md</button>
          <ul>
            {highlights.map(h => (
              <li key={h.id}>
                <a href={`#${encodeURIComponent(h.anchor)}`}>{h.anchor}</a>
                <button onClick={() => removeHighlight(h.id)} style={{ marginLeft: 8 }}>Remove</button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
