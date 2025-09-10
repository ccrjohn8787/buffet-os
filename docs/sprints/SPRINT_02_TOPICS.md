# Sprint 02 — Topics, Hubs, Highlights Export

Duration: 1 week
Goal: Add topic tagging, hub pages, and export of highlights.

## Scope
- Topic schema and seed the 15 starter topics with aliases
- Rule-based topic tagging pass over ingested letters
- Search facet for `topic`
- Topic hub route `/topics/[slug]` with canonical quotes
- Export highlights/notes to Markdown

## Deliverables
- Tables: `topics`, `quotes` (canonical), `quote_entities` (optional later)
- Tagger job: simple heuristics + manual curation file
- API: `GET /quotes?topic=&year=` for hubs
- Web: Topic chips in search; hub page with timeline of key excerpts
- Export: Download `.md` with citations and deep links

## Acceptance Criteria
- Each starter topic has ≥3 canonical quotes
- Search facet filters by topic; results respect filter
- Export produces a valid `.md` including citations and links

## Tasks
- DB migrations and seed scripts for topics
- Tagging rules + run over existing letters
- API endpoints for topics/quotes
- UI for topic hub and search facet integration

## Risks
- Over-tagging/under-tagging → keep manual override list and review set

