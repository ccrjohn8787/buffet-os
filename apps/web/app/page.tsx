"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [q, setQ] = useState("");
  const router = useRouter();
  // '/' to focus input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && (document.activeElement?.tagName || '').toLowerCase() !== 'input') {
        e.preventDefault();
        const el = document.getElementById('searchInput') as HTMLInputElement | null
        el?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return (
    <div>
      <h1>Search Warren Buffett letters</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/search?q=${encodeURIComponent(q)}`);
        }}
      >
        <input
          id="searchInput"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by topic, phrase, year…"
          style={{ width: 480, padding: 8 }}
        />
        <button type="submit" style={{ marginLeft: 8 }}>Search</button>
      </form>
    </div>
  );
}
