import io
import hashlib
import requests
import pdfplumber
from typing import Dict, List

try:
    import PyPDF2
    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False

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
    # Try multiple paragraph detection strategies
    
    # Strategy 1: Double newline splits
    paras = [p.strip() for p in text.split('\n\n') if p.strip()]
    if len(paras) > 3:  # If we have reasonable paragraphs, use them
        return paras
    
    # Strategy 2: Look for indented paragraphs or spacing patterns
    import re
    lines = text.split('\n')
    paragraphs = []
    current_paragraph_lines = []
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            # Empty line - end current paragraph
            if current_paragraph_lines:
                paragraphs.append(' '.join(current_paragraph_lines))
                current_paragraph_lines = []
        elif line.startswith('    ') or line.startswith('\t'):
            # Indented line might start new paragraph
            if current_paragraph_lines:
                paragraphs.append(' '.join(current_paragraph_lines))
                current_paragraph_lines = [stripped]
            else:
                current_paragraph_lines.append(stripped)
        else:
            current_paragraph_lines.append(stripped)
    
    # Don't forget the last paragraph
    if current_paragraph_lines:
        paragraphs.append(' '.join(current_paragraph_lines))
    
    # If we got good paragraphs, use them
    paragraphs = [p.strip() for p in paragraphs if p.strip() and len(p) > 10]
    if len(paragraphs) > 3:
        return paragraphs
    
    # Strategy 3: Use larger chunks instead of sentence splitting
    # Split on double periods, section breaks, or very long sentences only
    chunks = re.split(r'(?:\.\s*\n|\n\s*\n|\.{2,}|\d+\.\s+[A-Z])', text)
    chunks = [chunk.strip() for chunk in chunks if chunk.strip() and len(chunk.strip()) > 50]
    
    # If we still don't have good chunks, create reasonable sized paragraphs
    if len(chunks) < 3:
        # Break into chunks of ~300-500 characters at sentence boundaries
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        paragraphs = []
        current_chunk = []
        current_length = 0
        
        for sentence in sentences:
            if current_length + len(sentence) > 400 and current_chunk:
                paragraphs.append(' '.join(current_chunk))
                current_chunk = [sentence]
                current_length = len(sentence)
            else:
                current_chunk.append(sentence)
                current_length += len(sentence)
        
        if current_chunk:
            paragraphs.append(' '.join(current_chunk))
        
        return [p for p in paragraphs if len(p.strip()) > 20]
    
    return chunks


def extract_text_with_pypdf2(pdf_bytes: bytes) -> str:
    """Fallback PDF parsing using PyPDF2"""
    if not HAS_PYPDF2:
        raise ImportError("PyPDF2 not available")
        
    pdf_file = io.BytesIO(pdf_bytes)
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    
    pages_text = []
    for page_num in range(len(pdf_reader.pages)):
        page = pdf_reader.pages[page_num]
        text = page.extract_text()
        if text:
            pages_text.append(text)
    
    return '\n\n'.join(pages_text)


def parse_letter_pdf(url: str, year: int, title: str) -> Dict:
    # Use browser-like headers to avoid 403 blocking
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/pdf,application/octet-stream,*/*;q=0.9',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    resp = requests.get(url, headers=headers, timeout=60)
    resp.raise_for_status()
    data = resp.content
    digest = sha256_bytes(data)

    # Try pdfplumber first, then fall back to PyPDF2
    raw_text = ""
    try:
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            pages_text = []
            for page in pdf.pages:
                pages_text.append(page.extract_text(x_tolerance=2, y_tolerance=2) or '')
        raw_text = '\n\n'.join(pages_text)
    except Exception as e:
        print(f"[warn] pdfplumber failed for {year}: {e}, trying PyPDF2 fallback")
        try:
            raw_text = extract_text_with_pypdf2(data)
            print(f"[info] PyPDF2 fallback succeeded for {year}")
        except Exception as e2:
            print(f"[error] Both PDF parsers failed for {year}: pdfplumber={e}, PyPDF2={e2}")
            raise e2
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
