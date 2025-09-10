import os
import sys
import yaml
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from ingest.discover_letters import _guess_urls


def main(out_path: str):
    items = _guess_urls(1977)
    # Sort by year
    items = sorted(items, key=lambda x: x['year'])
    data = { 'letters': items }
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w') as f:
        yaml.safe_dump(data, f, sort_keys=False)
    print(f"Wrote {len(items)} items to {out_path}")


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'ingest', 'seed', 'letters_full.seed.yaml')
    out = os.path.abspath(out)
    main(out)
