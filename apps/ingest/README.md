# Ingestion (letters MVP)

This package fetches Berkshire letters, normalizes PDF/HTML to text, segments into paragraphs with deterministic `¶N` anchors, and writes normalized sections (JSONL). It indexes to Typesense if available; otherwise, the web app reads JSONL files directly (MVP fallback).

Components:
- `main.py`: Orchestrates discover/seed → parse (PDF/HTML) → segment → JSONL → optional Typesense index
- `pdf_letters.py`: PDF parsing and paragraph segmentation
- `html_letters.py`: HTML parsing and paragraph segmentation (older years)
- `discover_letters.py`: Discover from index or guess URL patterns
- `index_typesense.py`: Push sections to Typesense if running
- `provenance_manifest.py`: Writes `letters_manifest.json`
- `seed/letters.seed.yaml`: Seed list of letter metadata (2018–2023)

Run (local, JSONL fallback):
1. Install deps: `pip install -r requirements.txt`
2. Execute: `python -m ingest.main --seed ingest/seed/letters.seed.yaml --out ../../data/normalized`

Optionally, to index into Typesense:
1. Start Typesense (see `infra/docker-compose.yml`)
2. Re-run the same ingest command (it upserts to Typesense as well)

Note: For MVP, seed includes 2018–2023. Extend the seed or use `--index https://www.berkshirehathaway.com/letters/letters.html` (with internal URL guessing fallback) to ingest more years.
