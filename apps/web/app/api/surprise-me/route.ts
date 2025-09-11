import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Section {
  id: string;
  document_id: number;
  title: string;
  year: number;
  source: string;
  anchor: string;
  text: string;
  topics?: Array<{
    topic_id: string;
    topic_name: string;
    score: number;
    matched_keywords: string[];
    confidence: string;
  }>;
}

interface Topic {
  id: string;
  slug: string;
  name: string;
  description: string;
  keywords: string[];
  color: string;
  priority: number;
}

let sectionsCache: Section[] | null = null;
let topicsCache: { topics: Topic[] } | null = null;
let cacheTime = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function loadSections(): Section[] {
  if (sectionsCache && Date.now() - cacheTime < CACHE_TTL) {
    return sectionsCache;
  }

  const sections: Section[] = [];
  
  try {
    const dataDir = path.resolve(process.cwd(), '../../data/normalized');
    const files = fs.readdirSync(dataDir).filter(f => f.startsWith('letters_') && f.endsWith('.jsonl'));
    
    for (const file of files) {
      const filePath = path.join(dataDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(Boolean);
      
      for (const line of lines) {
        try {
          const section = JSON.parse(line);
          sections.push(section);
        } catch (error) {
          console.error(`Error parsing line in ${file}:`, error);
        }
      }
    }
    
    sectionsCache = sections;
    cacheTime = Date.now();
    return sections;
  } catch (error) {
    console.error('Error loading sections:', error);
    return [];
  }
}

function loadTopics() {
  if (topicsCache && Date.now() - cacheTime < CACHE_TTL) {
    return topicsCache;
  }

  try {
    const topicsPath = path.resolve(process.cwd(), '../../data/topics.json');
    const topicsData = fs.readFileSync(topicsPath, 'utf8');
    topicsCache = JSON.parse(topicsData);
    return topicsCache;
  } catch (error) {
    console.error('Error loading topics:', error);
    return { topics: [] };
  }
}

function calculateSurpriseScore(section: Section, topics: Topic[]): number {
  let score = 0;
  
  // Base text quality factors
  const textLength = section.text.length;
  
  // Prefer medium-length texts (80-600 chars) for surprise quotes
  if (textLength >= 80 && textLength <= 600) {
    score += 25;
  } else if (textLength >= 50 && textLength <= 800) {
    score += 15;
  } else if (textLength < 50) {
    score -= 15; // Too short
  } else {
    score -= 10; // Too long
  }
  
  // Boost for having meaningful topics
  if (section.topics && section.topics.length > 0) {
    const highConfidenceTopics = section.topics.filter(t => t.confidence === 'high');
    score += highConfidenceTopics.length * 8;
    
    // Extra boost for priority topics
    for (const topicAssignment of section.topics) {
      const topic = topics.find(t => t.id === topicAssignment.topic_id);
      if (topic && topic.priority === 1) {
        score += 10;
      }
    }
  }
  
  // Quote quality indicators
  const text = section.text.toLowerCase();
  
  // Prefer complete sentences
  if (text.trim().endsWith('.') || text.trim().endsWith('!') || text.trim().endsWith('?')) {
    score += 10;
  }
  
  // Boost for wisdom/insight keywords
  const insightKeywords = [
    'principle', 'rule', 'important', 'remember', 'never', 'always',
    'lesson', 'learn', 'believe', 'think', 'philosophy', 'approach',
    'key', 'fundamental', 'essential', 'crucial', 'vital', 'secret',
    'wise', 'smart', 'clever', 'understand', 'realize'
  ];
  
  for (const keyword of insightKeywords) {
    if (text.includes(keyword)) {
      score += 5;
    }
  }
  
  // Boost for interesting/surprising concepts
  const surpriseKeywords = [
    'surprising', 'unexpected', 'remarkable', 'extraordinary',
    'unusual', 'counter-intuitive', 'paradox', 'irony', 'mistake',
    'wrong', 'foolish', 'brilliant', 'genius'
  ];
  
  for (const keyword of surpriseKeywords) {
    if (text.includes(keyword)) {
      score += 8;
    }
  }
  
  // Penalize very technical content
  const technicalPenalties = [
    'gaap', 'sec filing', 'footnote', 'depreciation', 'amortization',
    'consolidated', 'subsidiaries', 'reinsurance', 'derivative',
    'regulatory', 'compliance'
  ];
  
  for (const penalty of technicalPenalties) {
    if (text.includes(penalty)) {
      score -= 5;
    }
  }
  
  // Penalize financial tables and data-heavy content
  if (text.includes('million') && text.includes('billion')) {
    score -= 8;
  }
  
  if (text.includes('%') && text.includes('percent')) {
    score -= 5;
  }
  
  return score;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topicFilter = searchParams.get('topic'); // Optional topic filter
    const minScore = parseFloat(searchParams.get('min_score') || '15');
    
    // Load data
    const sections = loadSections();
    const topicsData = loadTopics();
    
    if (sections.length === 0) {
      return NextResponse.json(
        { error: 'No content available' },
        { status: 503 }
      );
    }
    
    // Score and filter sections
    let candidateSections = sections
      .map(section => ({
        section,
        score: calculateSurpriseScore(section, topicsData?.topics || [])
      }))
      .filter(item => item.score >= minScore);
    
    // Apply topic filter if specified
    if (topicFilter) {
      candidateSections = candidateSections.filter(item => {
        return item.section.topics?.some(t => 
          t.topic_id === topicFilter || 
          t.topic_name.toLowerCase().includes(topicFilter.toLowerCase())
        );
      });
    }
    
    if (candidateSections.length === 0) {
      return NextResponse.json(
        { error: 'No suitable quotes found' },
        { status: 404 }
      );
    }
    
    // Sort by score and select from top candidates
    candidateSections.sort((a, b) => b.score - a.score);
    
    // Select randomly from top 30% to ensure variety
    const topCandidateCount = Math.max(1, Math.floor(candidateSections.length * 0.3));
    const topCandidates = candidateSections.slice(0, topCandidateCount);
    const randomIndex = Math.floor(Math.random() * topCandidates.length);
    const selected = topCandidates[randomIndex];
    
    // Find primary topic
    let primaryTopic = null;
    if (selected.section.topics && selected.section.topics.length > 0) {
      const bestTopic = selected.section.topics
        .sort((a, b) => b.score - a.score)[0];
      
      primaryTopic = topicsData?.topics?.find(t => t.id === bestTopic.topic_id);
    }
    
    return NextResponse.json({
      section: selected.section,
      score: selected.score,
      primary_topic: primaryTopic,
      selection_pool_size: candidateSections.length,
      total_sections: sections.length,
      algorithm_version: '1.0'
    });
  } catch (error) {
    console.error('Surprise me API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate surprise quote' },
      { status: 500 }
    );
  }
}