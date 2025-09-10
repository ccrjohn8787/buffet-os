# Sprint 03 — Meetings + Quotes-Only QA

Duration: 2 weeks
Goal: Ingest annual meeting transcripts with timestamp anchors and add quotes-only QA endpoint.

## Scope
- Transcripts ingestion pipeline with segmentation to ≤20s segments
- Tables: `transcripts`, `segments`; Typesense index for segments
- Reader `/meetings/[year]` with timestamp anchors and video deep links
- `GET /qa?q=&mode=quotes-only` returning exact quotes with anchors and sources

## Deliverables
- Parser for transcript formats (HTML/Text) + normalizer
- Segmenter with speakers, `ts_start_ms`, `ts_end_ms`
- Search over transcripts; filter by duration, year
- QA service assembling quotes-only answers; abstain when uncertain

## Acceptance Criteria
- ≥5 years of meetings searchable with timestamp anchors
- QA returns only exact snippets; no hallucinations
- Timestamp accuracy within ±2s for ≥98% of sampled results

## Tasks
- Ingest: fetch, normalize, segment, index transcripts
- API: transcripts fetch `GET /transcripts/{id}` and search
- QA: retrieval + ranking + exact-quote extraction
- Web: meeting reader with active timestamp highlighting

## Risks
- Alignment quality variance → spot-check and adjust segmentation rules
- Licensing → store normalized text you own; deep-link video, no cached video

