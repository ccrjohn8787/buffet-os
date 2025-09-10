# Web App (Next.js)

Quick start (fallback mode without Typesense):

1. Ingest recent letters (already done for 2019–2021; update as needed):
   - `cd ../../apps/ingest && python -m venv .venv && source .venv/bin/activate`
   - `pip install -r requirements.txt`
   - `python -m ingest.main --seed ingest/seed/letters.seed.yaml --out ../../data/normalized`

2. Run the app:
   - `cd ../web && cp .env.example .env.local`
   - `npm i && npm run dev`
   - Open http://localhost:3000

API automatically uses Typesense if available; otherwise it falls back to reading `../../data/normalized/*.jsonl`.

Keyboard shortcuts on results: `j/k` to move, `o` open, `c` copy with citation.

