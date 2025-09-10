"use client";
import Results from "./results";
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
    <div>
      <h2>Results for “{q}”</h2>
      <form onSubmit={(e) => { e.preventDefault(); const sp = new URLSearchParams(); if (q) sp.set('q', q); if (year) sp.set('year', year); router.push(`/search?${sp.toString()}`); }} style={{ marginBottom: 12 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Query" style={{ padding: 6 }} />
        <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" style={{ padding: 6, marginLeft: 8, width: 100 }} />
        <button type="submit" style={{ marginLeft: 8 }}>Apply</button>
      </form>
      <Results q={q} year={year} />
    </div>
  );
}
