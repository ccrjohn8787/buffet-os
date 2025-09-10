from typing import List
import typesense
import json
import os


SECTIONS_COLLECTION = "sections"


class TypesenseIndexer:
    def __init__(self, host: str, port: int, protocol: str, api_key: str):
        self.client = typesense.Client({
            'nodes': [{'host': host, 'port': port, 'protocol': protocol}],
            'api_key': api_key,
            'connection_timeout_seconds': 5
        })

    def ensure_sections_collection(self):
        schema = {
            "name": SECTIONS_COLLECTION,
            "fields": [
                {"name": "id", "type": "string"},
                {"name": "document_id", "type": "int32", "facet": True},
                {"name": "title", "type": "string"},
                {"name": "year", "type": "int32", "facet": True},
                {"name": "source", "type": "string", "facet": True},
                {"name": "anchor", "type": "string"},
                {"name": "page_no", "type": "int32", "optional": True},
                {"name": "text", "type": "string"},
                {"name": "doc_sha256", "type": "string", "optional": True},
                {"name": "section_checksum", "type": "string", "optional": True},
                {"name": "parser_version", "type": "string", "optional": True}
            ],
            "default_sorting_field": "year"
        }
        try:
            self.client.collections[SECTIONS_COLLECTION].retrieve()
        except Exception:
            self.client.collections.create(schema)

    def index_sections(self, sections: List[dict]):
        if not sections:
            return
        docs = [{
            'id': s['id'],
            'document_id': int(s['year']),
            'title': s['title'],
            'year': int(s['year']),
            'source': s['source'],
            'anchor': s['anchor'],
            'page_no': s.get('page_no') or 0,
            'text': s['text'],
            'doc_sha256': s.get('doc_sha256'),
            'section_checksum': s.get('section_checksum'),
            'parser_version': s.get('parser_version')
        } for s in sections]

        self.client.collections[SECTIONS_COLLECTION].documents.import_(docs, {'action': 'upsert'})
