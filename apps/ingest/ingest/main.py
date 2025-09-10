import argparse
import os
import sys
import json
import time
import yaml
from typing import List, Dict

from .pdf_letters import parse_letter_pdf
from .html_letters import parse_letter_html
from .discover_letters import discover as discover_letters
from .index_typesense import TypesenseIndexer
from .provenance_manifest import write_manifest


def load_seed(path: str) -> List[Dict]:
    with open(path, 'r') as f:
        data = yaml.safe_load(f)
    return data.get('letters', [])


def main():
    parser = argparse.ArgumentParser(description='Ingest Berkshire letters into sections index')
    parser.add_argument('--seed', help='Path to letters seed YAML')
    parser.add_argument('--index', help='Berkshire letters index URL (auto-discover)')
    parser.add_argument('--out', default=os.path.join(os.getcwd(), 'data', 'normalized'), help='Output dir for normalized JSONL')
    args = parser.parse_args()

    os.makedirs(args.out, exist_ok=True)

    typesense_host = os.getenv('TYPESENSE_HOST', 'localhost')
    typesense_port = int(os.getenv('TYPESENSE_PORT', '8108'))
    typesense_protocol = os.getenv('TYPESENSE_PROTOCOL', 'http')
    typesense_api_key = os.getenv('TYPESENSE_API_KEY', 'xyz')

    indexer = None
    try:
        idx = TypesenseIndexer(host=typesense_host, port=typesense_port, protocol=typesense_protocol, api_key=typesense_api_key)
        idx.ensure_sections_collection()
        indexer = idx
        print("[ingest] Typesense available — indexing enabled")
    except Exception as e:
        print(f"[warn] Typesense unavailable: {e}\n[warn] Proceeding without indexing (files only)")

    seed = []
    if args.index:
        print(f"[ingest] Discovering letters from {args.index}")
        discovered = discover_letters(args.index)
        seed.extend(discovered)
        print(f"[ingest] Discovered {len(seed)} letters")
    if args.seed:
        seed.extend(load_seed(args.seed))
    if not seed:
        print("[error] No seed or index provided")
        sys.exit(1)
    docs_for_manifest = []
    for item in seed:
        url = item['url']
        year = item['year']
        title = item.get('title', f"Berkshire Hathaway Shareholder Letter {year}")
        print(f"[ingest] Processing {year}: {url}")
        try:
            if url.lower().endswith('.pdf'):
                doc = parse_letter_pdf(url=url, year=year, title=title)
            else:
                doc = parse_letter_html(url=url, year=year, title=title)
        except Exception as e:
            print(f"[error] Failed to parse {year}: {e}")
            continue

        # Save normalized sections as JSONL for provenance/caching
        out_path = os.path.join(args.out, f"letters_{year}.jsonl")
        with open(out_path, 'w') as f:
            for s in doc['sections']:
                f.write(json.dumps(s, ensure_ascii=False) + "\n")
        print(f"[ingest] Saved {out_path}")

        # Index into Typesense
        if indexer:
            indexer.index_sections(doc['sections'])
            time.sleep(0.2)

        docs_for_manifest.append({'year': year, 'title': title, 'sha256': doc['sha256'], 'sections': doc['sections']})

    # Write provenance manifest
    try:
        write_manifest(args.out, docs_for_manifest)
        print(f"[ingest] Wrote manifest to {args.out}")
    except Exception as e:
        print(f"[warn] Failed to write manifest: {e}")

    print("[ingest] Done")


if __name__ == '__main__':
    main()
