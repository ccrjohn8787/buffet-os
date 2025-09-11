"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QuoteCard from '../../components/quote-card';

interface TopicPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    confidence?: string;
    year?: string;
    limit?: string;
  };
}

interface Section {
  id: string;
  document_id: number;
  title: string;
  year: number;
  source: string;
  anchor: string;
  text: string;
  topics: Array<{
    topic_id: string;
    topic_name: string;
    score: number;
    matched_keywords: string[];
    confidence: string;
  }>;
}

interface TopicData {
  topic: {
    id: string;
    slug: string;
    name: string;
    description: string;
    color: string;
  };
  sections: Section[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  statistics: {
    year_distribution: { [year: number]: number };
    confidence_distribution: { [conf: string]: number };
    avg_score: number;
  };
}

export default function TopicPage({ params, searchParams }: TopicPageProps) {
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    async function loadTopicData() {
      try {
        const urlParams = new URLSearchParams({
          limit: searchParams.limit || '50',
          min_score: '0.3',
          ...(searchParams.confidence && { confidence: searchParams.confidence }),
          ...(searchParams.year && { year: searchParams.year }),
        });
        
        const response = await fetch(`/api/topics/${params.slug}?${urlParams}`);
        
        if (response.ok) {
          const data = await response.json();
          setTopicData(data);
        } else {
          setTopicData(null);
        }
      } catch (error) {
        console.error('Error loading topic data:', error);
        setTopicData(null);
      } finally {
        setLoading(false);
      }
    }
    
    loadTopicData();
  }, [params.slug, searchParams.confidence, searchParams.year, searchParams.limit]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading topic...</div>
      </div>
    );
  }

  if (!topicData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', color: '#1f2937', marginBottom: '16px' }}>
            Topic Not Found
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            The topic you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push('/topics')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Browse All Topics
          </button>
        </div>
      </div>
    );
  }

  const { topic, sections, pagination, statistics } = topicData;
  const currentYear = searchParams.year;
  const currentConfidence = searchParams.confidence || 'all';
  
  // Calculate total years available
  const availableYears = Object.keys(statistics.year_distribution).sort((a, b) => parseInt(b) - parseInt(a));
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 20px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <a
            href="/"
            style={{
              fontSize: '24px',
              fontWeight: '400',
              color: '#3b82f6',
              textDecoration: 'none',
              letterSpacing: '-0.5px'
            }}
          >
            Buffett OS
          </a>
          
          <div style={{
            fontSize: '14px',
            color: '#6b7280'
          }}>
            /
          </div>
          
          <a
            href="/topics"
            style={{
              fontSize: '14px',
              color: '#6b7280',
              textDecoration: 'none'
            }}
          >
            Topics
          </a>
          
          <div style={{
            fontSize: '14px',
            color: '#6b7280'
          }}>
            /
          </div>
          
          <span style={{
            fontSize: '14px',
            color: '#1f2937',
            fontWeight: '500'
          }}>
            {topic.name}
          </span>
        </div>
      </header>

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 20px'
      }}>
        {/* Topic Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '32px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div
              style={{
                width: '8px',
                height: '40px',
                backgroundColor: topic.color,
                borderRadius: '4px',
                flexShrink: 0
              }}
            />
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 8px 0',
                lineHeight: '1.2'
              }}>
                {topic.name}
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                {topic.description}
              </p>
            </div>
          </div>
          
          {/* Statistics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '24px',
            padding: '20px 0'
          }}>
            <div>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                {pagination.total}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Total Insights
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                {availableYears.length}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Years Covered
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                {statistics.avg_score?.toFixed(1) || '0'}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Avg Relevance
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}>
            Filter by:
          </div>
          
          {/* Year Filter */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Year:</span>
            {['all', ...availableYears].map(year => (
              <a
                key={year}
                href={year === 'all' 
                  ? `/topics/${params.slug}` 
                  : `/topics/${params.slug}?year=${year}${currentConfidence !== 'all' ? `&confidence=${currentConfidence}` : ''}`
                }
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  backgroundColor: (year === 'all' && !currentYear) || currentYear === year ? '#3b82f6' : '#f3f4f6',
                  color: (year === 'all' && !currentYear) || currentYear === year ? 'white' : '#374151',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {year === 'all' ? 'All' : year}
              </a>
            ))}
          </div>
          
          {/* Confidence Filter */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Confidence:</span>
            {[
              { value: 'all', label: 'All' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' }
            ].map(conf => (
              <a
                key={conf.value}
                href={conf.value === 'all' 
                  ? `/topics/${params.slug}${currentYear ? `?year=${currentYear}` : ''}` 
                  : `/topics/${params.slug}?confidence=${conf.value}${currentYear ? `&year=${currentYear}` : ''}`
                }
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  backgroundColor: currentConfidence === conf.value ? '#3b82f6' : '#f3f4f6',
                  color: currentConfidence === conf.value ? 'white' : '#374151',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {conf.label}
              </a>
            ))}
          </div>
        </div>

        {/* Results */}
        <div style={{
          display: 'grid',
          gap: '24px'
        }}>
          {sections.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '48px',
              textAlign: 'center',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '18px',
                color: '#6b7280',
                marginBottom: '8px'
              }}>
                No insights found
              </div>
              <div style={{
                fontSize: '14px',
                color: '#9ca3af'
              }}>
                Try adjusting your filters or explore other topics
              </div>
            </div>
          ) : (
            sections.map((section) => {
              const topicInfo = section.topics?.find(t => t.topic_id === topic.id);
              return (
                <div key={section.id} style={{
                  position: 'relative'
                }}>
                  <QuoteCard
                    text={section.text}
                    year={section.year}
                    anchor={section.anchor}
                    title={section.title}
                    source={section.source}
                    showActions={true}
                  />
                  {topicInfo && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <span style={{
                        padding: '4px 8px',
                        fontSize: '10px',
                        backgroundColor: topicInfo.confidence === 'high' ? '#10b981' : 
                                      topicInfo.confidence === 'medium' ? '#f59e0b' : '#6b7280',
                        color: 'white',
                        borderRadius: '4px',
                        fontWeight: '500',
                        textTransform: 'uppercase'
                      }}>
                        {topicInfo.confidence}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        fontSize: '10px',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        {topicInfo.score.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Load More */}
        {pagination.hasMore && (
          <div style={{
            textAlign: 'center',
            marginTop: '32px'
          }}>
            <a
              href={`/topics/${params.slug}?limit=${parseInt(searchParams.limit || '50') + 25}${currentYear ? `&year=${currentYear}` : ''}${currentConfidence !== 'all' ? `&confidence=${currentConfidence}` : ''}`}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              Load More Insights
            </a>
          </div>
        )}
      </main>
    </div>
  );
}