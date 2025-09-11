#!/usr/bin/env python3
"""
Content Tagging Script for Buffett OS
Analyzes sections and assigns topic tags based on keyword matching and content analysis.
"""

import json
import os
import sys
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple
from collections import defaultdict

def load_topics(topics_file: Path) -> Dict:
    """Load topic definitions from JSON file."""
    with open(topics_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def clean_text(text: str) -> str:
    """Clean and normalize text for keyword matching."""
    # Convert to lowercase
    text = text.lower()
    # Remove excessive whitespace and normalize
    text = re.sub(r'\s+', ' ', text)
    # Remove special characters but keep alphanumeric and basic punctuation
    text = re.sub(r'[^\w\s\-\.]', ' ', text)
    return text.strip()

def calculate_topic_score(section_text: str, topic: Dict) -> Tuple[float, List[str]]:
    """Calculate topic relevance score based on keyword matching."""
    clean_section = clean_text(section_text)
    keywords = topic['keywords']
    matches = []
    score = 0.0
    
    for keyword in keywords:
        keyword_clean = clean_text(keyword)
        
        # Exact phrase matching (higher weight)
        if keyword_clean in clean_section:
            matches.append(keyword)
            # Weight by keyword length and priority
            weight = len(keyword_clean.split()) * topic.get('priority', 3)
            score += weight * 2
        
        # Individual word matching within the phrase
        keyword_words = keyword_clean.split()
        word_matches = sum(1 for word in keyword_words if word in clean_section)
        if word_matches > 0:
            # Partial match scoring
            partial_score = (word_matches / len(keyword_words)) * topic.get('priority', 3)
            score += partial_score
    
    # Normalize score by section length to avoid bias toward longer sections
    normalized_score = score / max(len(clean_section.split()), 1) * 100
    
    return normalized_score, matches

def tag_section(section: Dict, topics: Dict) -> List[Dict]:
    """Tag a single section with relevant topics."""
    section_text = section.get('text', '')
    results = []
    
    for topic in topics['topics']:
        score, matches = calculate_topic_score(section_text, topic)
        
        # Only include if score meets threshold
        if score > 0.1:  # Minimum relevance threshold
            results.append({
                'topic_id': topic['id'],
                'topic_name': topic['name'],
                'score': round(score, 3),
                'matched_keywords': matches,
                'confidence': 'high' if score > 2.0 else 'medium' if score > 0.5 else 'low'
            })
    
    # Sort by score descending
    results.sort(key=lambda x: x['score'], reverse=True)
    return results

def process_letter_file(file_path: Path, topics: Dict) -> Dict:
    """Process a single letter JSONL file and add topic tags."""
    results = {
        'file': str(file_path),
        'processed_sections': 0,
        'tagged_sections': 0,
        'topic_distribution': defaultdict(int),
        'sections': []
    }
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                if not line.strip():
                    continue
                
                try:
                    section = json.loads(line)
                    results['processed_sections'] += 1
                    
                    # Tag the section
                    section_tags = tag_section(section, topics)
                    
                    if section_tags:
                        results['tagged_sections'] += 1
                        
                        # Add topics to section
                        section['topics'] = section_tags
                        
                        # Update distribution
                        for tag in section_tags:
                            results['topic_distribution'][tag['topic_id']] += 1
                    
                    results['sections'].append(section)
                    
                except json.JSONDecodeError as e:
                    print(f"JSON decode error on line {line_num}: {e}")
                except Exception as e:
                    print(f"Error processing line {line_num}: {e}")
    
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
    
    return results

def save_tagged_content(results: Dict, output_file: Path):
    """Save tagged content back to JSONL format."""
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            for section in results['sections']:
                f.write(json.dumps(section, ensure_ascii=False) + '\n')
        print(f"Saved tagged content to {output_file}")
    except Exception as e:
        print(f"Error saving to {output_file}: {e}")

def generate_tagging_report(all_results: List[Dict], topics: Dict) -> str:
    """Generate a comprehensive tagging report."""
    report = []
    report.append("# Content Tagging Report")
    report.append("=" * 50)
    
    total_sections = sum(r['processed_sections'] for r in all_results)
    total_tagged = sum(r['tagged_sections'] for r in all_results)
    
    report.append(f"\n## Summary")
    report.append(f"- Total sections processed: {total_sections}")
    report.append(f"- Sections with topics: {total_tagged} ({total_tagged/total_sections*100:.1f}%)")
    report.append(f"- Files processed: {len(all_results)}")
    
    # Topic distribution across all files
    global_distribution = defaultdict(int)
    for results in all_results:
        for topic_id, count in results['topic_distribution'].items():
            global_distribution[topic_id] += count
    
    report.append(f"\n## Topic Distribution")
    topic_lookup = {t['id']: t['name'] for t in topics['topics']}
    
    for topic_id, count in sorted(global_distribution.items(), key=lambda x: x[1], reverse=True):
        topic_name = topic_lookup.get(topic_id, topic_id)
        percentage = count / total_sections * 100
        report.append(f"- {topic_name}: {count} sections ({percentage:.1f}%)")
    
    # File-by-file details
    report.append(f"\n## File Details")
    for results in all_results:
        filename = os.path.basename(results['file'])
        report.append(f"\n### {filename}")
        report.append(f"- Processed: {results['processed_sections']} sections")
        report.append(f"- Tagged: {results['tagged_sections']} sections")
        
        if results['topic_distribution']:
            report.append("- Top topics:")
            sorted_topics = sorted(results['topic_distribution'].items(), 
                                 key=lambda x: x[1], reverse=True)[:5]
            for topic_id, count in sorted_topics:
                topic_name = topic_lookup.get(topic_id, topic_id)
                report.append(f"  - {topic_name}: {count}")
    
    return "\n".join(report)

def main():
    """Main tagging function."""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    # Load topics
    topics_file = project_root / "data" / "topics.json"
    if not topics_file.exists():
        print(f"Error: Topics file not found at {topics_file}")
        sys.exit(1)
    
    print(f"Loading topics from {topics_file}")
    topics = load_topics(topics_file)
    print(f"Loaded {len(topics['topics'])} topics")
    
    # Find data files
    data_dir = project_root / "data" / "normalized"
    if not data_dir.exists():
        print(f"Error: Data directory not found at {data_dir}")
        sys.exit(1)
    
    letter_files = list(data_dir.glob("letters_*.jsonl"))
    if not letter_files:
        print(f"Error: No letter files found in {data_dir}")
        sys.exit(1)
    
    print(f"Found {len(letter_files)} letter files")
    
    # Process each file
    all_results = []
    for file_path in sorted(letter_files):
        print(f"\nProcessing {file_path.name}...")
        results = process_letter_file(file_path, topics)
        all_results.append(results)
        
        print(f"  - Processed: {results['processed_sections']} sections")
        print(f"  - Tagged: {results['tagged_sections']} sections")
        
        # Save tagged content (overwrite original for now)
        save_tagged_content(results, file_path)
    
    # Generate and save report
    report = generate_tagging_report(all_results, topics)
    report_path = project_root / "data" / "tagging_report.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n✅ Tagging complete!")
    print(f"📊 Report saved to: {report_path}")
    print(f"📁 Tagged content saved to original files")

if __name__ == "__main__":
    main()