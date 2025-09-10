-- Core schema for MVP (letters only)
CREATE TABLE IF NOT EXISTS sources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT,
  ingest_policy JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  year INTEGER,
  date DATE,
  url TEXT,
  sha256 TEXT NOT NULL,
  mime TEXT,
  status TEXT DEFAULT 'new',
  fetch_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS sections (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  ordinal INTEGER NOT NULL,
  anchor TEXT NOT NULL, -- e.g., ¶1
  text TEXT NOT NULL,
  char_start INTEGER,
  char_end INTEGER,
  page_no INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS sections_doc_anchor_idx ON sections(document_id, anchor);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS highlights (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
  span_start INTEGER,
  span_end INTEGER,
  note TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS provenance_events (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

