# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Buffett OS is a production-ready zero-hallucination, provenance-first website for accessing Warren Buffett's wisdom through searchable letters. The MVP provides Google-style search with excellent reading experience and verified quote citations.

## Current MVP Status ✅

### Completed Features (4 Phases)
- **Phase 1**: Search-First Foundation with Google-style interface, Quote Cards & Social Sharing, Enhanced Reader Experience, Data Quality & Performance
- **Phase 2**: Investment Intelligence - Portfolio Tracker, Investment Principles, Decision Framework
- **Phase 3**: Educational Intelligence - Learning Center, Case Studies, Progress Dashboard
- **Phase 4**: Advanced Intelligence - AI-Powered Investment Advisor, Real-time Market Analysis, Personalized Buffett Insights

### Available Data
- **20 years** of letters: 2004-2023 (complete modern era)
- **37 years** total data (1987-2023) including classic letters
- **All normalized letter sections** in JSONL format
- **AI-generated summaries** for all years with proper formatting

## 4-Phase Product Evolution (Complete)

### Phase 1: Foundation (✅ Complete)
- Search-First Foundation with Google-style interface
- Quote Cards & Social Sharing capabilities
- Enhanced Reader Experience with highlights and navigation
- Data Quality & Performance optimization

### Phase 2: Investment Intelligence (✅ Complete)
- Portfolio Tracker with holdings management
- Investment Principles system (8 core principles)
- Decision Framework with step-by-step guidance

### Phase 3: Educational Intelligence (✅ Complete)
- Learning Center with 5 comprehensive modules
- Interactive Case Studies (Coca-Cola, Apple, IBM)
- Progress Dashboard with achievements system

### Phase 4: Advanced Intelligence (✅ Complete)
- AI-Powered Investment Advisor with company analysis
- Real-time Market Analysis through Buffett's lens
- Personalized Buffett Insights based on user profiles

## Development Commands

### Web Application (Next.js)
- Development: `cd apps/web && npm run dev`
- Build: `cd apps/web && npm run build` 
- Production: `cd apps/web && npm start`
- Install dependencies: `cd apps/web && npm install`

### Data Ingestion (Python)
- Setup environment: `cd apps/ingest && python -m venv .venv && source .venv/bin/activate`
- Install dependencies: `cd apps/ingest && pip install -r requirements.txt`
- Ingest letters: `cd apps/ingest && python -m ingest.main --seed ingest/seed/letters.seed.yaml --out ../../data/normalized`
- Generate summaries: `cd apps/ingest && source .venv/bin/activate && python free_summaries.py`
- Fix summary formatting: `cd apps/ingest && source .venv/bin/activate && python summary_post_processor.py`

### Infrastructure (Optional)
- Start services: `cd infra && docker-compose up -d` (Typesense, Postgres, MinIO)
- Stop services: `cd infra && docker-compose down`

### Evaluation
- Run search evaluation: `python eval/eval_search.py` (tests against golden set)

## Architecture

### Repository Structure
- `apps/web/` - Next.js frontend and API routes (search, letters)
- `apps/ingest/` - Python ingestion pipeline (PDF/HTML → normalized JSONL)
- `packages/db/` - SQL migrations (Postgres schema)
- `packages/search/` - Typesense collection schema
- `infra/` - Docker Compose for local services
- `data/normalized/` - JSONL files with normalized letter sections (gitignored)
- `eval/` - Evaluation harness for search quality

### Data Flow
1. **Ingestion**: PDFs/HTML → segmented sections with paragraph anchors (¶N) → JSONL + Typesense index
2. **Search**: BM25 via Typesense OR JSONL fallback when services unavailable
3. **Reader**: Anchored paragraphs with checksum-verified citations and deep-links

### MVP Features
- **Zero-hallucination**: Only exact quotes with paragraph anchors (¶N)
- **Provenance-first**: Every quote includes SHA256 checksums and source metadata
- **JSONL fallback**: Fully functional without external services (no external dependencies)
- **Google-style search**: Fast, intuitive search with relevance scoring and caching
- **Progressive loading**: Efficient reading with lazy-loaded sections (50 initial, 25 incremental)
- **Mobile responsive**: Optimized experience across all devices
- **Book-like reading**: Natural text flow with floating paragraph numbers and hover actions
- **Smart highlighting**: Persistent highlights with markdown export
- **Year-to-year navigation**: Previous/next buttons with era grouping (Classic/Modern)
- **Enhanced table of contents**: Section previews with reading time estimates
- **Reading position persistence**: Auto-save/resume reading position
- **Error boundaries**: Graceful fallbacks throughout the application
- **Performance optimized**: In-memory caching (5-10min TTL) with 8-68ms response times

## Environment Setup

### Web App Environment
Copy `.env.example` to `.env.local` in `apps/web/` and configure:
- Typesense connection (if using)
- Any API keys for external services

### Data Sources
- Letters are ingested from `apps/ingest/ingest/seed/letters.seed.yaml`
- Already includes normalized data for 2019-2021 letters
- To add more years, extend the seed file and re-run ingestion

## Development Notes

- The app automatically detects Typesense availability and falls back to JSONL
- All paragraph anchors use format `¶N` for consistency
- Checksums verify quote integrity against source documents
- Search supports facets: Source, Topic, Year, Company
- Reader supports highlights with markdown export capability

## Testing

### Search Quality Evaluation
Run the evaluation harness to verify search quality:
```bash
python eval/eval_search.py
```

### Data Quality Validation  
Run data validation to check integrity:
```bash
python scripts/validate-data.py
```

### Manual Testing
Access the development server:
- **Homepage**: http://localhost:3000 (Google-style search)
- **Search Results**: http://localhost:3000/search?q=moats
- **Letter Reader**: http://localhost:3000/letters/2020
- **Quote Sharing**: http://localhost:3000/quote/2020/¶123

### Phase 2-4 Feature Testing
- **Portfolio Tracker**: http://localhost:3000/portfolio
- **Investment Principles**: http://localhost:3000/principles
- **Decision Framework**: http://localhost:3000/decisions
- **Learning Center**: http://localhost:3000/learn
- **Case Studies**: http://localhost:3000/case-studies
- **Progress Dashboard**: http://localhost:3000/progress
- **Market Analysis**: http://localhost:3000/market
- **Personal Insights**: http://localhost:3000/insights

### API Endpoints Testing
- **Portfolio API**: http://localhost:3000/api/portfolio
- **Principles API**: http://localhost:3000/api/principles
- **Learning API**: http://localhost:3000/api/learning
- **Case Studies API**: http://localhost:3000/api/case-studies
- **Progress API**: http://localhost:3000/api/progress
- **AI Advisor API**: http://localhost:3000/api/ai-advisor?symbol=AAPL
- **Market Analysis API**: http://localhost:3000/api/market-analysis
- **Insights API**: http://localhost:3000/api/insights

### Performance Metrics (Current)
- **Search API**: 8-68ms response times (with caching)
- **Letter API**: 6-99ms response times (with caching)  
- **Progressive Loading**: 50 sections initial, 25 incremental
- **Cache Hit Rate**: Effective 5-10 minute TTL

## User Experience

### Navigation
- **Homepage**: Press `/` to focus search
- **Search Results**: Use `j/k` to navigate, `o` to open, `c` to copy
- **Letter Reader**: Press `o` for outline, `h` to highlight, `esc` to close
- **Mobile**: Touch-optimized with responsive design

### Key User Flows
1. **Discovery**: Homepage → Search → Results → Letter Reader
2. **Deep Reading**: Letter Reader → Highlights → Export → Share
3. **Quote Sharing**: Hover actions → Copy/Share → Social media ready
4. **Year Navigation**: Era-based browsing with previous/next controls
5. **Investment Analysis**: Portfolio → Holdings Analysis → AI Advisor Recommendations
6. **Learning Journey**: Learning Center → Modules → Case Studies → Progress Tracking
7. **Market Intelligence**: Market Analysis → Sector Insights → Personal Recommendations

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.