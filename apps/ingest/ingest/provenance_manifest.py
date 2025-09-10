import json
import os
from typing import List, Dict


def write_manifest(out_dir: str, docs: List[Dict]):
    os.makedirs(out_dir, exist_ok=True)
    manifest_path = os.path.join(out_dir, 'letters_manifest.json')
    items = [{
        'year': d['year'],
        'title': d['title'],
        'sha256': d['sha256'],
        'sections': len(d['sections'])
    } for d in docs]
    with open(manifest_path, 'w') as f:
        json.dump({'documents': items}, f, ensure_ascii=False, indent=2)

