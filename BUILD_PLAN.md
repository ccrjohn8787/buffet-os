# Buffett OS — Build Plan v1

## 0) Objective and guardrails

* Deliver a verifiable, fast reference for Warren Buffett’s words.
* Zero-hallucination: only surface exact quotes with anchors (paragraph ID or timestamp).
* Provenance-first: every quote ties to a hashed source artifact.

## 1) Jobs to be done

* Find relevant passages by topic, year, company, or phrase.
* Read letters and meeting Q&A with clean anchors.
* Compare stance across years on a topic.
* Copy quotes with citations.
* Save highlights and notes; export to Markdown.

## 2) MVP → v1 scope

**MVP (2–3 weeks)**

* Index Berkshire letters 1977→present.
* Search UI with facets (Source, Topic, Year, Company).
* Reader with anchors, copy-with-citation, and highlights.
* QA = top excerpts only (no synthesis).

**v1 (6–8 weeks)**

* Add annual meeting transcripts with timestamp deep-links.
* Topic hubs and compare-years diff.
* Notebook export; daily excerpt email/RSS.

## 3) Primary sources (ingest order)

* Berkshire Hathaway shareholder letters and annual reports (PDF/HTML).
* Warren Buffett Archive annual meetings (video + transcripts; deep-link to timestamps).
* SEC EDGAR: 13F/10-K/10-Q/8-K for holdings context.
* Partnership letters (1957–1970) as a separate partition.

## 4) Architecture

### 4.1 Data model (Postgres)

* **sources**: id, name, publisher, base_url, license, robots_snapshot, ingest_policy
* **documents**: id, source_id, title, year, date, url, sha256, mime, status, fetch_at
* **sections**: id, document_id, ordinal, anchor ("¶37"), text, char_start, char_end, page_no
* **transcripts**: id, document_id, duration_sec, lang, alignment_quality
* **segments**: id, transcript_id, ts_start_ms, ts_end_ms, speaker, text, anchor ("t=3721")
* **quotes**: id, document_id, section_id?, segment_id?, char_span or ts_span, text, checksum, topic_ids[]
* **topics**: id, slug, name, aliases[]
* **entities**: id, type, name, aliases[]
* **doc_entities**: document_id, entity_id, salience
* **quote_entities**: quote_id, entity_id
* **embeddings**: id, object_type, object_id, model, vec
* **users**: id, email
* **highlights**: id, user_id, quote_id, note, tags[], created_at
* **provenance_events**: id, document_id, kind, details, at

### 4.2 Indexes

* BM25 over sections+segments (Typesense/Elastic).
* Embedding store for reranking (FAISS/pgvector).

### 4.3 Services

* Fetcher, Normalizer, Parser, Tagger, Indexer, Validator, QA, Diff, Mailer.

## 5) Ingestion pipeline

1. **Fetch**: crawl official indexes; store raw PDFs/HTML; cache metadata for archives and EDGAR.
2. **Normalize**: PDF→text with page + paragraph anchors; HTML→canonical text; unify encodings.
3. **Clean & segment**: letters by headings→paragraphs; de-hyphenate; keep footnote markers; transcripts into ≤20s segments with timestamps.
4. **Tagging**: rule+ML topic and entity tagging; link companies and people.
5. **Index**: build BM25 + embeddings with metadata.
6. **Quote map**: extract candidate spans; store char/ts spans + checksums.
7. **Validation**: verify displayed spans hash-match source; block on mismatch.
8. **Provenance**: log URL, fetch time, parser version, input/output hashes.

## 6) Query pipeline

* **Search**: BM25 top 200 → embedding rerank top 40 → topic/entity re-score → diversification by year/source → result cards.
* **Ask Buffett (quotes-only)**: retrieve top 30 chunks → extract N exact quotes → return ordered list with anchors → abstain if low evidence.

## 7) Product UX

### 7.1 Screens

* **Home**: omnibox; chips for Source/Topics/Years/Company; "Recent" and "Pinned".
* **Search results**: cards with 1–3 exact snippets, source meta, anchors; filters for source, topic, year, company, duration, confidence.
* **Reader — Letter**: two-pane; anchors ¶1…; sidebar metadata, outline, related quotes, notes; tools: find, compare-year, share, copy-cite, highlight.
* **Reader — Meeting**: transcript with timestamps; embedded player linked to active timestamp; topic TOC by Q&A.
* **Compare years**: topic filter; sentence-level redline; export diff.
* **Topic hub**: topic definition, timeline of key excerpts, canonical passages, related Q&A.
* **Notebook**: highlights, tags, notes; export .md with citations.

### 7.2 UX details

* Keyboard: `/` focus, `j/k` next/prev, `o` open, `c` copy-cite, `s` save.
* Copy citation format: "Quote." — Warren E. Buffett, Berkshire Hathaway Shareholder Letter, YEAR, ¶N, <deep-link>.
* Deep links: `/letters/{year}#¶N` and `/meetings/{year}?t=SSS`.
* Accessibility: full keyboard nav, captions, high-contrast mode.

## 8) APIs (v1)

* `GET /search?q=&source=&topics=&years=&company=&page=` → result cards with snippet spans and anchors.
* `GET /documents/{id}` → metadata, outline, section text.
* `GET /transcripts/{id}` → segments with timestamps and speakers.
* `GET /quotes?topic=&entity=&year=&source=` → canonical quotes for hubs.
* `POST /highlights` → {quote_id, note, tags[]}.
* `GET /compare?docA=&docB=&topic=` → aligned passages and diffs.
* `GET /qa?q=&mode=quotes-only` → ordered list of quotes with sources.

## 9) Topics starter set (15)

Repurchases, Float, Intrinsic value, Leverage, Moats, Inflation, Accounting quirks, ROIC, Capital allocation, Dividends, Mr. Market, Insurance economics, Derivatives, Taxes, Succession.

## 10) Evaluation

* **Golden set**: 200 questions with expected quote IDs and timestamps.
* **Checks**: quote checksum match; meeting timestamp within ±2s; abstain on low evidence.
* **Metrics**: search top-1 CTR, "found answer" dwell ≥20s, QA abstention rate, copy-with-cite per session, time-to-first-quote.

## 11) Risks & mitigations

* **Parsing drift** → deterministic parser + anchor stability tests; re-anchoring map.
* **Transcript alignment** → force-align and MAE ≤1.0s; ≥98% within ±2s.
* **Licensing** → store transcripts you own; deep-link to video; no cached video without rights.
* **Data quality** → PIT store; provenance log; regression suite on each commit.

## 12) Build plan

* **Week 1–2**: letters ingestion + search UI + reader.
* **Week 3**: topics + hubs + copy-cite + highlights.
* **Week 4–5**: meeting transcripts + timestamp deep-links + QA quotes-only.
* **Week 6**: compare-years + diff + eval harness.

## 13) Initial crawl list (seed)

* Berkshire letters index and each yearly letter/report.
* Warren Buffett Archive annual meeting year pages and transcript metadata.
* SEC EDGAR company page for Berkshire; latest 13F/10-K/10-Q/8-K.
* Partnership letters PDF source.

## 14) Source map schema (JSON)

```json
{
  "source_id": "string",
  "name": "string",
  "partitions": ["letters", "meetings", "filings", "partnership"],
  "artifacts": [
    {
      "artifact_id": "string",
      "partition": "letters|meetings|filings|partnership",
      "title": "string",
      "year": 2011,
      "date": "YYYY-MM-DD",
      "url": "https://…",
      "mime": "application/pdf|text/html|text/plain",
      "sha256": "…",
      "anchors": [
        { "type": "paragraph", "id": "¶42", "page": 12, "char_start": 3456, "char_end": 3711 },
        { "type": "timestamp", "id": "t=3721", "ms_start": 3721000, "ms_end": 3840000 }
      ],
      "people": ["Warren E. Buffett", "Charles T. Munger"],
      "entities": ["Berkshire Hathaway", "Apple"],
      "topics": ["repurchases", "float"],
      "fetched_at": "ISO8601",
      "parser_version": "letters-v1.2.0",
      "notes": "string"
    }
  ]
}
```

## 15) Tech stack

* Next.js + Edge API. Typesense/Elastic + embeddings (pgvector/FAISS). Postgres for user data and metadata. Object store for raw/normalized artifacts. Workers for ingestion. Small domain reranker.

## 16) Config flags

* `ALLOW_SYNTHESIS=false` (quotes-only).
* `MIN_CONFIDENCE=0.65` for retrieval display.
* `MAX_EXCERPTS_PER_CARD=3`.
* `TS_TOLERANCE_MS=2000`.

## 17) Definition of done (v1)

* Letters + meetings searchable.
* Exact-quote validator enforced.
* Topic hubs live for initial 15.
* Compare-years diff works on at least 10 year pairs.
* Golden set passing ≥95% with zero incorrect quotes.

## 18) Hand-off checklist

* Seed crawl list configured.
* Parser regression tests green.
* Env vars for stores and indexes set.
* CI gate on eval suite.
* Monitoring for ingest failures and QA abstention spikes.

