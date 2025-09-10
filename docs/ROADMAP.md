# Buffett OS — Roadmap

This roadmap translates BUILD_PLAN.md into concrete milestones and sprints with clear scope, deliverables, and exit criteria. Timelines assume 1-week sprints and a small team (1–2 builders). Adjust as needed.

## Milestones

1) MVP: Letters Search + Reader (Weeks 1–2) — Status: initial MVP done
- Scope: Ingest Berkshire letters (sample → full), BM25 search with facets, reader with paragraph anchors, copy-with-citation, local highlights.
- Deliverables:
  - Ingestion pipeline (fetch → normalize → segment → index) for letters
  - Postgres schema (sources, documents, sections, highlights, provenance)
  - Typesense collection `sections` and search API
  - Web app: `/search` and `/letters/[year]` with anchors and copy-cite
  - Provenance checks and zero-hallucination guard
  - JSONL fallback for search/reader (runs without Typesense)
- Exit criteria:
  - ≥15 years ingested and searchable end-to-end (partially met; 2019–2021 ingested; seed prepared for 2018–2023)
  - Reader deep links `/letters/{year}#¶N` work (met)
  - Copy-with-citation yields exact text + anchor (met; checksum‑verified)
  - Golden set (≥20 queries) returns a correct paragraph in top 10 (seeded sample; harness in place)

2) Topics + Hubs + Highlights (Week 3)
- Scope: Basic topic tagging (rules + manual), topic hub pages, polished copy-cite, highlight export.
- Deliverables:
  - Topic schema and seed 15 topics with aliases
  - Topic tagging job (rule-based with heuristics)
  - `/topics/[slug]` hub with canonical quotes
  - Markdown export for highlights/notes
- Exit criteria:
  - Topic filter live in search
  - Each starter topic has ≥3 canonical quotes
  - Export produces valid .md with citations

3) Meetings + Quotes-Only QA (Weeks 4–5)
- Scope: Annual meeting transcripts ingestion with timestamp anchors, deep-link to video timestamps, quotes-only QA endpoint.
- Deliverables:
  - Transcript parser and segmentation to ≤20s segments
  - `transcripts` + `segments` tables and index
  - Reader for `/meetings/[year]` with timestamp links and player integration stub
  - `GET /qa?q=&mode=quotes-only` returning ordered exact quotes with anchors
- Exit criteria:
  - ≥5 years of meetings searchable with timestamp anchors
  - QA abstains when low evidence; no hallucinated text
  - Timestamp accuracy within ±2s for ≥98% of returned quotes (spot-checked)

4) Compare Years + Eval Harness (Week 6)
- Scope: Compare passages across years, sentence-level diff, evaluation suite and CI gate.
- Deliverables:
  - `/compare?docA=&docB=&topic=` endpoint and UI
  - Diff algorithm and display
  - Eval harness: golden set, metrics, CI check
- Exit criteria:
  - Compare works on ≥10 year pairs
  - Eval suite ≥95% pass with zero incorrect quotes

## Cross-Cutting Non-Functional Goals
- Provenance-first: store raw/normalized artifacts with hashes; verify before display.
- Accessibility: keyboard navigation, high contrast mode.
- Observability: ingest logs, failure monitoring, QA abstention rate.

## Dependencies & Stack
- Web: Next.js (App Router), Postgres (Prisma/Drizzle), Typesense.
- Ingest: Python (pdfplumber/pdfminer.six, BeautifulSoup), S3-compatible storage.
- Infra: docker-compose for local (Postgres, Typesense, MinIO).
