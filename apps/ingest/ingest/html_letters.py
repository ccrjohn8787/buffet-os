import hashlib
from typing import Dict, List
import requests
from bs4 import BeautifulSoup

try:
    import brotli
    HAS_BROTLI = True
except ImportError:
    HAS_BROTLI = False


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
    
    # Fix the core issue: properly handle paragraph breaks
    lines = [ln.strip() for ln in text.split('\n')]
    
    # Group lines into paragraphs based on empty line breaks
    paragraphs = []
    current_paragraph_lines = []
    
    for line in lines:
        if line:  # Non-empty line
            current_paragraph_lines.append(line)
        else:  # Empty line - paragraph break
            if current_paragraph_lines:
                # Join lines within paragraph with spaces
                paragraph_text = ' '.join(current_paragraph_lines)
                paragraphs.append(paragraph_text)
                current_paragraph_lines = []
    
    # Don't forget the last paragraph if file doesn't end with empty line
    if current_paragraph_lines:
        paragraph_text = ' '.join(current_paragraph_lines)
        paragraphs.append(paragraph_text)
    
    # Remove any empty paragraphs and join with double newlines
    paragraphs = [p.strip() for p in paragraphs if p.strip()]
    return "\n\n".join(paragraphs)


def segment_paragraphs(text: str) -> List[str]:
    paras = [p.strip() for p in text.split('\n\n') if p.strip()]
    return paras


def is_text_corrupted(text: str) -> bool:
    """Detect if text contains binary/corrupted data"""
    if not text:
        return True
    
    # Check for high ratio of non-printable characters
    printable_chars = sum(1 for c in text if c.isprintable() or c.isspace())
    if len(text) > 100 and printable_chars / len(text) < 0.7:
        return True
    
    # Check for excessive binary-like sequences
    binary_pattern_count = len([c for c in text if ord(c) < 32 and c not in '\n\r\t'])
    if len(text) > 100 and binary_pattern_count / len(text) > 0.1:
        return True
        
    return False


def parse_letter_html(url: str, year: int, title: str) -> Dict:
    # Use browser-like headers to avoid 403 blocking
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    resp = requests.get(url, headers=headers, timeout=60)
    resp.raise_for_status()
    data = resp.content
    digest = sha256_bytes(data)
    
    # Handle Brotli compression if present
    text_content = resp.text
    if resp.headers.get('content-encoding') == 'br' and HAS_BROTLI:
        try:
            # Decompress Brotli content
            decompressed = brotli.decompress(data)
            text_content = decompressed.decode('utf-8')
        except Exception as e:
            print(f"[warn] Brotli decompression failed for {year}: {e}, using raw content")
            text_content = resp.text
    elif resp.headers.get('content-encoding') == 'br' and not HAS_BROTLI:
        print(f"[warn] Brotli content detected for {year} but brotli library not available")
    
    # Check if HTML is corrupted - if so, try PDF fallback
    if is_text_corrupted(text_content):
        # Try PDF version as fallback
        pdf_url = url.replace('.html', '.pdf')
        if pdf_url != url:  # Only if we actually changed the URL
            try:
                from .pdf_letters import parse_letter_pdf
                print(f"[warn] HTML corrupted for {year}, trying PDF fallback: {pdf_url}")
                return parse_letter_pdf(pdf_url, year, title)
            except Exception as e:
                print(f"[warn] PDF fallback failed for {year}: {e}")
        
        # If no PDF fallback works, raise error about corrupted HTML
        raise ValueError(f"HTML content corrupted for {year} and no PDF fallback available")
    
    text = clean_html(text_content)
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

