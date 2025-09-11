import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Topic {
  id: string;
  slug: string;
  name: string;
  description: string;
  keywords: string[];
  color: string;
  priority: number;
}

interface TopicsData {
  topics: Topic[];
}

let topicsCache: TopicsData | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function loadTopics(): TopicsData {
  if (topicsCache && Date.now() - cacheTime < CACHE_TTL) {
    return topicsCache;
  }

  try {
    const topicsPath = path.resolve(process.cwd(), '../../data/topics.json');
    const topicsData = fs.readFileSync(topicsPath, 'utf8');
    topicsCache = JSON.parse(topicsData);
    cacheTime = Date.now();
    return topicsCache!;
  } catch (error) {
    console.error('Error loading topics:', error);
    return { topics: [] };
  }
}

export async function GET(request: NextRequest) {
  try {
    const topicsData = loadTopics();
    
    // Sort topics by priority and name
    const sortedTopics = topicsData.topics.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      topics: sortedTopics,
      count: sortedTopics.length
    });
  } catch (error) {
    console.error('Topics API error:', error);
    return NextResponse.json(
      { error: 'Failed to load topics' },
      { status: 500 }
    );
  }
}