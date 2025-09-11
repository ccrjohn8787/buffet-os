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

let sectionsCache: { [key: string]: Section[] } = {};
let topicsCache: { topics: Topic[] } | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function loadTopics() {
  if (topicsCache && Date.now() - cacheTime < CACHE_TTL) {
    return topicsCache;
  }

  try {
    const topicsPath = path.resolve(process.cwd(), '../../data/topics.json');
    const topicsData = fs.readFileSync(topicsPath, 'utf8');
    topicsCache = JSON.parse(topicsData);
    cacheTime = Date.now();
    return topicsCache;
  } catch (error) {
    console.error('Error loading topics:', error);
    return { topics: [] };
  }
}

function loadSections(): Section[] {
  const cacheKey = 'all_sections';
  if (sectionsCache[cacheKey] && Date.now() - cacheTime < CACHE_TTL) {
    return sectionsCache[cacheKey];
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
    
    sectionsCache[cacheKey] = sections;
    return sections;
  } catch (error) {
    console.error('Error loading sections:', error);
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const minScore = parseFloat(searchParams.get('min_score') || '0.5');
    const confidence = searchParams.get('confidence') || 'all'; // all, high, medium, low
    const year = searchParams.get('year');
    
    // Load topics and find the requested topic
    const topicsData = loadTopics();
    const topic = topicsData?.topics.find(t => t.slug === slug);
    
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }
    
    // Load all sections
    const allSections = loadSections();
    
    // Filter sections by topic
    let filteredSections = allSections.filter(section => {
      if (!section.topics) return false;
      
      return section.topics.some(sectionTopic => {
        // Check if this section has the requested topic
        if (sectionTopic.topic_id !== topic.id) return false;
        
        // Apply score filter
        if (sectionTopic.score < minScore) return false;
        
        // Apply confidence filter
        if (confidence !== 'all' && sectionTopic.confidence !== confidence) return false;
        
        return true;
      });
    });
    
    // Apply year filter if specified
    if (year) {
      const targetYear = parseInt(year);
      filteredSections = filteredSections.filter(section => section.year === targetYear);
    }
    
    // Sort by topic relevance score (highest first)
    filteredSections.sort((a, b) => {
      const aTopicScore = a.topics?.find(t => t.topic_id === topic.id)?.score || 0;
      const bTopicScore = b.topics?.find(t => t.topic_id === topic.id)?.score || 0;
      return bTopicScore - aTopicScore;
    });
    
    // Apply pagination
    const total = filteredSections.length;
    const paginatedSections = filteredSections.slice(offset, offset + limit);
    
    // Calculate statistics
    const yearDistribution: { [year: number]: number } = {};
    const confidenceDistribution: { [conf: string]: number } = {};
    
    filteredSections.forEach(section => {
      yearDistribution[section.year] = (yearDistribution[section.year] || 0) + 1;
      
      const sectionTopic = section.topics?.find(t => t.topic_id === topic.id);
      if (sectionTopic?.confidence) {
        confidenceDistribution[sectionTopic.confidence] = 
          (confidenceDistribution[sectionTopic.confidence] || 0) + 1;
      }
    });
    
    return NextResponse.json({
      topic: {
        id: topic.id,
        slug: topic.slug,
        name: topic.name,
        description: topic.description,
        color: topic.color
      },
      sections: paginatedSections,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      filters: {
        min_score: minScore,
        confidence,
        year
      },
      statistics: {
        year_distribution: yearDistribution,
        confidence_distribution: confidenceDistribution,
        avg_score: filteredSections.length > 0 
          ? filteredSections.reduce((sum, section) => {
              const score = section.topics?.find(t => t.topic_id === topic.id)?.score || 0;
              return sum + score;
            }, 0) / filteredSections.length 
          : 0
      }
    });
  } catch (error) {
    console.error('Topic sections API error:', error);
    return NextResponse.json(
      { error: 'Failed to load topic sections' },
      { status: 500 }
    );
  }
}