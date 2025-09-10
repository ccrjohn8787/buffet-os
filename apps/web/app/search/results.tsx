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
      setLoading(true);
      const params = new URLSearchParams({ q });
      if (year) params.set("year", year);
      const r = await fetch(`/api/search?${params.toString()}`, { signal: controller.signal });
      const data = await r.json();
      setHits(data.hits || []);
      setLoading(false);
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
    const cite = `${h.text} — Warren E. Buffett, Berkshire Hathaway Shareholder Letter, ${h.year}, ${h.anchor}, ${url}`
    await navigator.clipboard.writeText(cite)
    // no alert to avoid noise; consider toast in future
  }

  if (loading) return <div>Searching…</div>;
  if (!hits.length) return <div>No results</div>;
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {hits.map((h, i) => (
        <div key={h.id} style={{ border: i === sel ? '2px solid #0070f3' : '1px solid #eee', padding: 12 }}>
          <div style={{ fontSize: 12, color: '#666' }}>{h.title} · {h.year} · {h.anchor}</div>
          <div style={{ marginTop: 6 }}>{h.text}</div>
          <div style={{ marginTop: 8 }}>
            <a href={`/letters/${h.year}#${encodeURIComponent(h.anchor)}`}>Open</a>
          </div>
        </div>
      ))}
    </div>
  );
}
