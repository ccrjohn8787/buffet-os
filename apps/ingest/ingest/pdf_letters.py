import io
import hashlib
import requests
import pdfplumber
from typing import Dict, List

PARSER_VERSION = "letters-v0.1.0"


def sha256_bytes(b: bytes) -> str:
    h = hashlib.sha256()
    h.update(b)
    return h.hexdigest()


def normalize_text(s: str) -> str:
    # Basic normalization: de-hyphenate line breaks, collapse multiple spaces
    lines = s.replace('\r', '').split('\n')
    out_lines = []
    for line in lines:
        if line.strip().endswith('-'):
            out_lines.append(line.strip()[:-1])
        else:
            out_lines.append(line.strip() + ' ')
    joined = ''.join(out_lines)
    return ' '.join(joined.split())


def segment_paragraphs(text: str) -> List[str]:
    # Naive paragraph split by double newline fallback
    paras = [p.strip() for p in text.split('\n\n') if p.strip()]
    if len(paras) <= 1:
        # Fallback to sentence-ish chunks
        import re
        paras = re.split(r'(?<=[.!?])\s+(?=[A-Z])', text)
        paras = [p.strip() for p in paras if p.strip()]
    return paras


def parse_letter_pdf(url: str, year: int, title: str) -> Dict:
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    data = resp.content
    digest = sha256_bytes(data)

    with pdfplumber.open(io.BytesIO(data)) as pdf:
        pages_text = []
        for page in pdf.pages:
            pages_text.append(page.extract_text(x_tolerance=2, y_tolerance=2) or '')
    raw_text = '\n\n'.join(pages_text)
    norm = normalize_text(raw_text)
    paras = segment_paragraphs(norm)

    sections = []
    cursor = 0
    for i, p in enumerate(paras, start=1):
        start = norm.find(p, cursor)
        if start == -1:
            start = cursor
        end = start + len(p)
        sec_checksum = sha256_bytes(p.encode('utf-8'))
        sections.append({
            'id': f"{year}-¶{i}",
            'document_id': year,  # temporary stand-in id by year
            'title': title,
            'year': year,
            'source': 'letters',
            'anchor': f"¶{i}",
            'page_no': None,
            'text': p,
            'char_start': start,
            'char_end': end,
            'doc_sha256': digest,
            'section_checksum': sec_checksum,
            'parser_version': PARSER_VERSION
        })
        cursor = end

    return {
        'sha256': digest,
        'title': title,
        'year': year,
        'sections': sections
    }
