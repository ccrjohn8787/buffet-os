# Sprint 01 — MVP Letters Search + Reader (Completed)

Duration: 1 week
Goal: Ingest first letters, ship search + reader with anchors and copy-cite.

## Scope
- Ingest 2–3 sample letters end-to-end (raw → sections → index)
- BM25 search (Typesense) with facets: Source=letters, Year
- Reader page `/letters/[year]` with `¶N` anchors and deep links
- Copy-with-citation and local highlights (per-browser)
- Provenance: raw/normalized hashes; exact-quote validation on copy

## Deliverables
- Postgres schema (sources, documents, sections, highlights, provenance)
- Typesense `sections` collection and search API route `GET /search`
- Ingestion worker (Python) with deterministic paragraph anchoring
- Web UI: `/`, `/search`, `/letters/[year]` minimal polish + keyboard `/`, `j/k`, `o`, `c`

## Acceptance Criteria
- Two letters searchable with correct snippets and anchors (met; 2019–2021)
- Deep-link `/letters/{year}#¶N` scrolls to the correct paragraph (met)
- Copy-with-citation yields: "Quote." — Warren E. Buffett, Berkshire Hathaway Shareholder Letter, YEAR, ¶N, <deep-link> (met; checksum‑verified)
- Golden set (≥10 queries) has ≥80% top-10 hits (sample harness shows 1.00 on small set)

## Tasks
- Infra: docker-compose (Postgres, Typesense, MinIO); app env config (added; optional for MVP)
- DB: migrations for core tables; seed sources (added)
- Ingest: fetcher (manual seed), PDF/HTML parser, segmenter, indexer (added)
- API: search endpoint proxying Typesense with facets (added; with JSONL fallback)
- Web: search page, result cards, reader with anchors and copy-cite (added)
- QA: golden-set JSON and quick precision@K script (added)

## Risks
- PDF parsing drift → lock parser flags; snapshot tests
- Anchor stability → deterministic rules; version `parser_version`

## How to run (MVP)
1) Ingest JSONL for recent years
   - `cd apps/ingest && python -m venv .venv && source .venv/bin/activate`
   - `pip install -r requirements.txt`
   - `python -m ingest.main --seed ingest/seed/letters.seed.yaml --out ../../data/normalized`
2) Web app
   - `cd ../web && cp .env.example .env.local && npm i && npm run dev`
   - Open http://localhost:3000
   - Search at `/search`, read at `/letters/[year]`
3) Optional: Start Typesense via `infra/docker-compose.yml`; app auto‑switches from JSONL fallback
