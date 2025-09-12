# Buffett OS
Build a website to easily access Warren Buffett’s wisdom using public data (letters, meeting transcripts, filings). Zero‑hallucination, provenance‑first.

Core plan: see [BUILD_PLAN.md](BUILD_PLAN.md)

Roadmap & Sprints
- docs/ROADMAP.md — milestones and non‑functional goals
- docs/sprints/SPRINT_01_MVP.md — Letters MVP (completed)
- docs/sprints/SPRINT_02_TOPICS.md — Topics & hubs (completed)
- docs/sprints/SPRINT_03_MEETINGS_QA.md — Meetings + quotes‑only QA
- docs/sprints/SPRINT_04_COMPARE_EVAL.md — Compare + eval harness
- docs/FEATURE_SPEC_SUMMARIES_TOPICS.md — Next: AI summaries & topic evolution

Quickstart (MVP, no external infra)
1) Ingest recent letters (JSONL fallback used by the app)
   - `cd apps/ingest && python -m venv .venv && source .venv/bin/activate`
   - `pip install -r requirements.txt`
   - `python -m ingest.main --seed ingest/seed/letters.seed.yaml --out ../../data/normalized`
     - Seed includes 2004–2023 (PDF). Already ingested in this repo for 2004–2023 (10,433 sections total, 98.9% topic-tagged).
2) Run the web app (Next.js)
   - `cd ../web && cp .env.example .env.local`
   - `npm i && npm run dev`
   - Open http://localhost:3000

What's included (Current)
- **37 Years of Data**: 1977, 1982, 1987–2023 letters with comprehensive historical coverage
- **Search UI** (`/search`): JSONL fallback search with topic filtering; Typesense used automatically if running  
- **Topic Intelligence** (`/topics`): 20 topics with hub pages, discovery features, daily wisdom
- **Reader** (`/letters/[year]`): anchored paragraphs `¶N`, deep‑links, copy‑with‑citation (checksum‑verified), local highlights + .md export
- **Investment Intelligence**: Portfolio tracker, investment principles, and decision framework
- **Educational Intelligence**: Learning center with 5 modules, interactive case studies, progress tracking
- **Advanced AI Features**: AI-powered investment advisor, real-time market analysis, personalized Buffett insights
- **Discovery Features**: Daily wisdom algorithm, surprise quotes, topic-based exploration
- **Ingestion**: PDFs (and HTML) → normalized sections with paragraph anchors, per‑section checksum, doc sha256, and provenance manifest

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
