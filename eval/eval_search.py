import json
import os
import sys
from typing import List, Dict


def load_jsonl(path: str) -> List[Dict]:
    with open(path, 'r') as f:
        return [json.loads(line) for line in f if line.strip()]


def search_local(normalized_dir: str, q: str, year: int, k: int = 10) -> List[Dict]:
    path = os.path.join(normalized_dir, f"letters_{year}.jsonl")
    if not os.path.exists(path):
        return []
    docs = load_jsonl(path)
    ql = q.lower()
    hits = [d for d in docs if ql in d.get('text', '').lower()]
    return hits[:k]


def main(gs_path: str, normalized_dir: str):
    with open(gs_path, 'r') as f:
        gs = json.load(f)
    queries = gs.get('queries', [])
    if not queries:
        print('No queries in golden set')
        return
    total = len(queries)
    hits = 0
    for item in queries:
        q = item['q']
        year = int(item['year'])
        res = search_local(normalized_dir, q, year, k=10)
        ok = len(res) > 0
        hits += 1 if ok else 0
        print(f"Q: '{q}' ({year}) -> {'HIT' if ok else 'MISS'}")
    p_at_10 = hits / total
    print(f"Precision@10: {p_at_10:.2f} ({hits}/{total})")


if __name__ == '__main__':
    gs_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), 'golden_set.sample.json')
    normalized_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), '..', 'data', 'normalized')
    normalized_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'normalized'))
    # Adjust normalized_dir relative to repo root
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    normalized_dir = os.path.join(repo_root, 'data', 'normalized')
    main(gs_path, normalized_dir)

