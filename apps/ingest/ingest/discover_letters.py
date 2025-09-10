import re
from urllib.parse import urljoin
from typing import List, Dict
import datetime
import requests
from bs4 import BeautifulSoup


INDEX_URL = "https://www.berkshirehathaway.com/letters/letters.html"


def _dedupe_pref_pdf(items: List[Dict]) -> List[Dict]:
    by_year: Dict[int, Dict] = {}
    for item in items:
        y = item['year']
        prev = by_year.get(y)
        if not prev:
            by_year[y] = item
        else:
            is_pdf = item['url'].lower().endswith('.pdf')
            prev_pdf = prev['url'].lower().endswith('.pdf')
            if is_pdf and not prev_pdf:
                by_year[y] = item
    return [by_year[y] for y in sorted(by_year.keys())]


def _guess_urls(year_start: int = 1977, year_end: int = None) -> List[Dict]:
    if year_end is None:
        year_end = datetime.datetime.utcnow().year
    base = "https://www.berkshirehathaway.com/letters/"
    patterns = [
        "{y}ltr.pdf",
        "{y}ltr.html",
        "{y}.html",
    ]
    out: List[Dict] = []
    for y in range(year_start, year_end + 1):
        for pat in patterns:
            url = base + pat.format(y=y)
            try:
                # Prefer HEAD? Some servers block; use GET with stream=True
                r = requests.get(url, timeout=30, stream=True)
                if r.status_code == 200 and int(r.headers.get('content-length') or 1) > 1000:
                    out.append({'year': y, 'title': f"Berkshire Hathaway Shareholder Letter {y}", 'url': url})
                    break
            except Exception:
                continue
    return out


def discover(index_url: str = INDEX_URL) -> List[Dict]:
    try:
        r = requests.get(index_url, timeout=60)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')
        out: List[Dict] = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            if not href.lower().startswith(('http://', 'https://')):
                abs_url = urljoin(index_url, href)
            else:
                abs_url = href
            if '/letters/' not in abs_url:
                continue
            text = (a.get_text() or '').strip()
            m = re.search(r'(19\d{2}|20\d{2})', text) or re.search(r'(19\d{2}|20\d{2})', abs_url)
            if not m:
                continue
            year = int(m.group(1))
            if year < 1957 or year > 2100:
                continue
            title = f"Berkshire Hathaway Shareholder Letter {year}"
            out.append({'year': year, 'title': title, 'url': abs_url})
        return _dedupe_pref_pdf(out)
    except Exception:
        # Fallback: guess URLs by common patterns
        return _dedupe_pref_pdf(_guess_urls())
