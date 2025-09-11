#!/usr/bin/env python3
"""
Data Quality Validation Script for Buffett OS
Validates integrity, completeness, and quality of letter data.
"""

import json
import os
import sys
import hashlib
from pathlib import Path
from typing import Dict, List, Set
from collections import defaultdict

def validate_section_structure(section: Dict) -> List[str]:
    """Validate that a section has all required fields."""
    required_fields = [
        'id', 'document_id', 'title', 'year', 'source', 
        'anchor', 'text', 'char_start', 'char_end',
        'doc_sha256', 'section_checksum', 'parser_version'
    ]
    
    errors = []
    for field in required_fields:
        if field not in section:
            errors.append(f"Missing required field: {field}")
        elif section[field] is None or section[field] == "":
            errors.append(f"Empty required field: {field}")
    
    return errors

def validate_section_integrity(section: Dict) -> List[str]:
    """Validate section checksum integrity."""
    errors = []
    
    # Check if text matches checksum
    text = section.get('text', '')
    expected_checksum = section.get('section_checksum', '')
    
    if expected_checksum:
        computed_checksum = hashlib.sha256(text.encode('utf-8')).hexdigest()
        if computed_checksum != expected_checksum:
            errors.append(f"Checksum mismatch for {section.get('id', 'unknown')}")
    
    # Validate anchor format
    anchor = section.get('anchor', '')
    if not anchor.startswith('¶'):
        errors.append(f"Invalid anchor format: {anchor}")
    
    # Check character positions
    char_start = section.get('char_start')
    char_end = section.get('char_end')
    if isinstance(char_start, int) and isinstance(char_end, int):
        if char_start >= char_end:
            errors.append(f"Invalid character range: {char_start}-{char_end}")
    
    return errors

def validate_section_content(section: Dict) -> List[str]:
    """Validate section content quality."""
    errors = []
    
    text = section.get('text', '')
    
    # Check minimum content length
    if len(text.strip()) < 10:
        errors.append(f"Content too short: {len(text)} chars")
    
    # Check for encoding issues
    try:
        text.encode('utf-8')
    except UnicodeEncodeError:
        errors.append("Unicode encoding issues detected")
    
    # Check for obvious parsing artifacts
    artifacts = ['...........', '________', '¶¶¶', 'XXXXXX']
    for artifact in artifacts:
        if artifact in text:
            errors.append(f"Parsing artifact detected: {artifact}")
    
    return errors

def validate_letter_file(file_path: Path) -> Dict:
    """Validate a single letter JSONL file."""
    results = {
        'file': str(file_path),
        'total_sections': 0,
        'valid_sections': 0,
        'errors': [],
        'warnings': [],
        'anchors': set(),
        'years': set(),
        'duplicates': []
    }
    
    seen_ids = set()
    seen_anchors = set()
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                if not line.strip():
                    continue
                
                try:
                    section = json.loads(line)
                    results['total_sections'] += 1
                    
                    # Check for duplicates
                    section_id = section.get('id')
                    if section_id in seen_ids:
                        results['duplicates'].append(f"Duplicate ID: {section_id}")
                    else:
                        seen_ids.add(section_id)
                    
                    anchor = section.get('anchor')
                    if anchor in seen_anchors:
                        results['duplicates'].append(f"Duplicate anchor: {anchor}")
                    else:
                        seen_anchors.add(anchor)
                        results['anchors'].add(anchor)
                    
                    results['years'].add(section.get('year'))
                    
                    # Validate structure
                    structure_errors = validate_section_structure(section)
                    if structure_errors:
                        results['errors'].extend([f"Line {line_num}: {err}" for err in structure_errors])
                        continue
                    
                    # Validate integrity
                    integrity_errors = validate_section_integrity(section)
                    if integrity_errors:
                        results['errors'].extend([f"Line {line_num}: {err}" for err in integrity_errors])
                        continue
                    
                    # Validate content
                    content_errors = validate_section_content(section)
                    if content_errors:
                        results['warnings'].extend([f"Line {line_num}: {err}" for err in content_errors])
                    
                    results['valid_sections'] += 1
                    
                except json.JSONDecodeError as e:
                    results['errors'].append(f"Line {line_num}: JSON decode error: {e}")
                except Exception as e:
                    results['errors'].append(f"Line {line_num}: Unexpected error: {e}")
    
    except Exception as e:
        results['errors'].append(f"File read error: {e}")
    
    return results

def generate_report(validation_results: List[Dict]) -> str:
    """Generate a comprehensive validation report."""
    report = []
    report.append("# Buffett OS Data Quality Report")
    report.append("=" * 50)
    
    total_files = len(validation_results)
    total_sections = sum(r['total_sections'] for r in validation_results)
    total_valid = sum(r['valid_sections'] for r in validation_results)
    total_errors = sum(len(r['errors']) for r in validation_results)
    total_warnings = sum(len(r['warnings']) for r in validation_results)
    
    report.append(f"\n## Summary")
    report.append(f"- Total files: {total_files}")
    report.append(f"- Total sections: {total_sections}")
    report.append(f"- Valid sections: {total_valid} ({total_valid/total_sections*100:.1f}%)")
    report.append(f"- Total errors: {total_errors}")
    report.append(f"- Total warnings: {total_warnings}")
    
    # Coverage analysis
    all_years = set()
    for r in validation_results:
        all_years.update(r['years'])
    
    expected_years = set(range(2014, 2024))  # 2014-2023
    missing_years = expected_years - all_years
    
    report.append(f"\n## Coverage Analysis")
    report.append(f"- Available years: {sorted(all_years)}")
    if missing_years:
        report.append(f"- Missing years: {sorted(missing_years)}")
    else:
        report.append("- ✅ Complete coverage for 2014-2023")
    
    # File-by-file details
    report.append(f"\n## File Details")
    for result in validation_results:
        filename = os.path.basename(result['file'])
        report.append(f"\n### {filename}")
        report.append(f"- Sections: {result['total_sections']}")
        report.append(f"- Valid: {result['valid_sections']}")
        report.append(f"- Errors: {len(result['errors'])}")
        report.append(f"- Warnings: {len(result['warnings'])}")
        report.append(f"- Anchors: {len(result['anchors'])}")
        
        if result['errors']:
            report.append(f"\n#### Errors:")
            for error in result['errors'][:5]:  # Show first 5 errors
                report.append(f"  - {error}")
            if len(result['errors']) > 5:
                report.append(f"  - ... and {len(result['errors']) - 5} more")
        
        if result['duplicates']:
            report.append(f"\n#### Duplicates:")
            for dup in result['duplicates'][:3]:
                report.append(f"  - {dup}")
    
    return "\n".join(report)

def main():
    """Main validation function."""
    if len(sys.argv) > 1:
        data_dir = Path(sys.argv[1])
    else:
        # Default to the expected data directory
        script_dir = Path(__file__).parent
        data_dir = script_dir.parent / "data" / "normalized"
    
    if not data_dir.exists():
        print(f"Error: Data directory not found: {data_dir}")
        sys.exit(1)
    
    print(f"Validating data in: {data_dir}")
    
    # Find all letter JSONL files
    letter_files = list(data_dir.glob("letters_*.jsonl"))
    
    if not letter_files:
        print(f"Error: No letter files found in {data_dir}")
        sys.exit(1)
    
    print(f"Found {len(letter_files)} letter files")
    
    # Validate each file
    validation_results = []
    for file_path in sorted(letter_files):
        print(f"Validating {file_path.name}...")
        result = validate_letter_file(file_path)
        validation_results.append(result)
    
    # Generate report
    report = generate_report(validation_results)
    
    # Save report
    report_path = data_dir.parent / "validation_report.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\nValidation complete!")
    print(f"Report saved to: {report_path}")
    
    # Print summary
    total_errors = sum(len(r['errors']) for r in validation_results)
    if total_errors == 0:
        print("✅ All data files passed validation!")
    else:
        print(f"⚠️  Found {total_errors} errors that need attention")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())