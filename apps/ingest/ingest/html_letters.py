import hashlib
from typing import Dict, List
import requests
from bs4 import BeautifulSoup


PARSER_VERSION = "letters-html-v0.1.0"


def sha256_bytes(b: bytes) -> str:
    h = hashlib.sha256()
    h.update(b)
    return h.hexdigest()


def clean_html(html: str) -> str:
    soup = BeautifulSoup(html, 'html.parser')
    for tag in soup(['script', 'style', 'noscript', 'header', 'footer', 'nav']):
        tag.decompose()
    # Prefer <pre> blocks if present (older BH letters often use them)
    pre_blocks = soup.find_all('pre')
    if pre_blocks:
        texts = [pre.get_text("\n") for pre in pre_blocks]
        text = "\n\n".join(texts)
    else:
        body = soup.body or soup
        text = body.get_text("\n")
    # Normalize whitespace
    lines = [ln.strip() for ln in text.split('\n')]
    # Remove empty lines at extremes
    pruned = []
    for ln in lines:
        if ln:
            pruned.append(ln)
    return "\n\n".join(pruned)


def segment_paragraphs(text: str) -> List[str]:
    paras = [p.strip() for p in text.split('\n\n') if p.strip()]
    return paras


def parse_letter_html(url: str, year: int, title: str) -> Dict:
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    data = resp.content
    digest = sha256_bytes(data)
    text = clean_html(resp.text)
    paras = segment_paragraphs(text)

    sections = []
    cursor = 0
    for i, p in enumerate(paras, start=1):
        start = text.find(p, cursor)
        if start == -1:
            start = cursor
        end = start + len(p)
        sec_checksum = sha256_bytes(p.encode('utf-8'))
        sections.append({
            'id': f"{year}-¶{i}",
            'document_id': year,
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

