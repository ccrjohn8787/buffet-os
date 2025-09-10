# Buffett OS
Build a website to easily access Warren Buffett’s wisdom using public data (letters, meeting transcripts, filings). Zero‑hallucination, provenance‑first.

Core plan: see [BUILD_PLAN.md](BUILD_PLAN.md)

Roadmap & Sprints
- docs/ROADMAP.md — milestones and non‑functional goals
- docs/sprints/SPRINT_01_MVP.md — Letters MVP (completed)
- docs/sprints/SPRINT_02_TOPICS.md — Topics & hubs
- docs/sprints/SPRINT_03_MEETINGS_QA.md — Meetings + quotes‑only QA
- docs/sprints/SPRINT_04_COMPARE_EVAL.md — Compare + eval harness

Quickstart (MVP, no external infra)
1) Ingest recent letters (JSONL fallback used by the app)
   - `cd apps/ingest && python -m venv .venv && source .venv/bin/activate`
   - `pip install -r requirements.txt`
   - `python -m ingest.main --seed ingest/seed/letters.seed.yaml --out ../../data/normalized`
     - Seed includes 2018–2023 (PDF). Already ingested in this repo for 2019–2021.
2) Run the web app (Next.js)
   - `cd ../web && cp .env.example .env.local`
   - `npm i && npm run dev`
   - Open http://localhost:3000

What’s included (MVP)
- Search UI (`/search`): JSONL fallback search; Typesense used automatically if running
- Reader (`/letters/[year]`): anchored paragraphs `¶N`, deep‑links, copy‑with‑citation (checksum‑verified), local highlights + .md export
- Ingestion: PDFs (and HTML) → normalized sections with paragraph anchors, per‑section checksum, doc sha256, and provenance manifest

Optional: Typesense/Postgres/MinIO (production‑like)
- `infra/docker-compose.yml` (Typesense, Postgres, MinIO)
- When Typesense is up, the app uses it automatically; otherwise it reads `data/normalized/*.jsonl`

Repo Layout
- `apps/ingest` — Python ingestion workers (fetch → parse → segment → JSONL; Typesense index if available)
- `apps/web` — Next.js app, API routes for search/letters (Typesense or JSONL fallback)
- `packages/db` — SQL migrations (MVP subset)
- `packages/search` — Typesense collection schema
- `infra` — docker‑compose for local services (optional)
- `data/normalized` — normalized sections (JSONL) and manifest (gitignored by default)

Developer notes
- JSONL fallback enables fully local usage without Typesense; ideal for fast iteration
- To add more years, extend `apps/ingest/ingest/seed/letters.seed.yaml` and rerun the ingest
- Eval harness: `python eval/eval_search.py` (uses JSONL) to spot‑check retrieval
