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
let dailyWisdomCache: { [date: string]: any } = {};
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

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

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function seedRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) & 0xffffffff;
  }
  
  return function() {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
}

function calculateWisdomScore(section: Section, topics: Topic[], dateRandom: () => number): number {
  let score = 0;
  
  // Base text quality factors
  const textLength = section.text.length;
  
  // Prefer medium-length texts (100-800 chars) for daily wisdom
  if (textLength >= 100 && textLength <= 800) {
    score += 20;
  } else if (textLength >= 50 && textLength <= 1200) {
    score += 10;
  } else if (textLength < 50) {
    score -= 10; // Too short
  } else {
    score -= 5; // Too long
  }
  
  // Topic relevance boost
  if (section.topics && section.topics.length > 0) {
    // Prefer high-priority topics and high confidence
    for (const topicAssignment of section.topics) {
      const topic = topics.find(t => t.id === topicAssignment.topic_id);
      if (topic) {
        // Higher score for priority 1 topics
        const topicBoost = topic.priority === 1 ? 15 : topic.priority === 2 ? 10 : 5;
        
        // Confidence multiplier
        const confidenceMultiplier = 
          topicAssignment.confidence === 'high' ? 1.5 :
          topicAssignment.confidence === 'medium' ? 1.0 : 0.7;
        
        score += topicBoost * confidenceMultiplier;
      }
    }
  }
  
  // Quote quality indicators
  const text = section.text.toLowerCase();
  
  // Prefer complete thoughts (sentences ending with periods)
  if (text.trim().endsWith('.') || text.trim().endsWith('!')) {
    score += 5;
  }
  
  // Boost inspirational/wisdom keywords
  const wisdomKeywords = [
    'principle', 'rule', 'important', 'remember', 'never', 'always',
    'lesson', 'learn', 'believe', 'think', 'philosophy', 'approach',
    'key', 'fundamental', 'essential', 'crucial', 'vital'
  ];
  
  for (const keyword of wisdomKeywords) {
    if (text.includes(keyword)) {
      score += 3;
    }
  }
  
  // Penalize very technical or data-heavy content
  const technicalIndicators = [
    'table', 'million', 'billion', 'percent', '%', 'gaap', 'earnings',
    'sec filing', 'footnote', 'depreciation', 'amortization'
  ];
  
  for (const indicator of technicalIndicators) {
    if (text.includes(indicator)) {
      score -= 2;
    }
  }
  
  // Add randomness for variety (but deterministic per day)
  score += (dateRandom() - 0.5) * 10;
  
  return score;
}

function selectDailyWisdom(sections: Section[], topics: Topic[], targetDate: Date) {
  const dateString = getDateString(targetDate);
  
  // Check cache first
  if (dailyWisdomCache[dateString]) {
    return dailyWisdomCache[dateString];
  }
  
  // Create deterministic random function for this date
  const random = seedRandom(dateString);
  
  // Score all sections
  const scoredSections = sections
    .map(section => ({
      section,
      score: calculateWisdomScore(section, topics, random)
    }))
    .filter(item => item.score > 10) // Minimum quality threshold
    .sort((a, b) => b.score - a.score);
  
  if (scoredSections.length === 0) {
    return null;
  }
  
  // Select from top candidates with some randomness
  const topCandidates = scoredSections.slice(0, Math.min(20, scoredSections.length));
  const selectedIndex = Math.floor(random() * topCandidates.length);
  const selected = topCandidates[selectedIndex];
  
  // Determine primary topic for the selection
  let primaryTopic = null;
  if (selected.section.topics && selected.section.topics.length > 0) {
    // Find the highest-scoring topic
    const bestTopic = selected.section.topics
      .sort((a, b) => b.score - a.score)[0];
    
    primaryTopic = topics.find(t => t.id === bestTopic.topic_id);
  }
  
  const result = {
    section: selected.section,
    score: selected.score,
    primary_topic: primaryTopic,
    date: dateString,
    generated_at: new Date().toISOString(),
    algorithm_version: '1.0'
  };
  
  // Cache the result
  dailyWisdomCache[dateString] = result;
  
  // Clean old cache entries (keep only last 7 days)
  const cutoffDate = new Date(targetDate);
  cutoffDate.setDate(cutoffDate.getDate() - 7);
  const cutoffString = getDateString(cutoffDate);
  
  Object.keys(dailyWisdomCache).forEach(date => {
    if (date < cutoffString) {
      delete dailyWisdomCache[date];
    }
  });
  
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    // Parse target date (default to today)
    let targetDate: Date;
    if (dateParam) {
      targetDate = new Date(dateParam);
      if (isNaN(targetDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format. Use YYYY-MM-DD.' },
          { status: 400 }
        );
      }
    } else {
      targetDate = new Date();
    }
    
    // Load data
    const sections = loadSections();
    const topicsData = loadTopics();
    
    if (sections.length === 0) {
      return NextResponse.json(
        { error: 'No content available' },
        { status: 503 }
      );
    }
    
    // Select daily wisdom
    const dailyWisdom = selectDailyWisdom(sections, topicsData?.topics || [], targetDate);
    
    if (!dailyWisdom) {
      return NextResponse.json(
        { error: 'No suitable wisdom found for this date' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      ...dailyWisdom,
      total_sections: sections.length,
      selection_pool_size: sections.filter(s => 
        calculateWisdomScore(s, topicsData?.topics || [], seedRandom(getDateString(targetDate))) > 10
      ).length
    });
  } catch (error) {
    console.error('Daily wisdom API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily wisdom' },
      { status: 500 }
    );
  }
}