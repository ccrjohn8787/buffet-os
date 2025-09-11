"use client";
import { useEffect, useState } from 'react';

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
  count: number;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadTopics() {
      try {
        const response = await fetch('/api/topics');
        if (response.ok) {
          const data = await response.json();
          setTopics(data.topics || []);
        }
      } catch (error) {
        console.error('Error loading topics:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTopics();
  }, []);
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading topics...</div>
      </div>
    );
  }
  
  // Group topics by priority
  const groupedTopics = topics.reduce((acc, topic) => {
    const priority = topic.priority;
    if (!acc[priority]) acc[priority] = [];
    acc[priority].push(topic);
    return acc;
  }, {} as { [key: number]: Topic[] });

  const priorityLabels = {
    1: 'Core Investment Principles',
    2: 'Business & Market Insights', 
    3: 'Sector-Specific Wisdom'
  };

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
          
          <span style={{
            fontSize: '14px',
            color: '#1f2937',
            fontWeight: '500'
          }}>
            Topics
          </span>
        </div>
      </header>

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 20px'
      }}>
        {/* Page Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 16px 0',
            lineHeight: '1.1'
          }}>
            Explore Warren Buffett's Wisdom
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            margin: '0 auto',
            maxWidth: '600px',
            lineHeight: '1.5'
          }}>
            Discover decades of investment insights organized by key themes and principles. 
            Each topic contains verified quotes and analysis from Berkshire Hathaway shareholder letters.
          </p>
        </div>

        {/* Quick Stats */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '48px',
          border: '1px solid #e5e7eb',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#3b82f6',
              marginBottom: '8px'
            }}>
              {topics.length}
            </div>
            <div style={{
              fontSize: '16px',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              Investment Topics
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#059669',
              marginBottom: '8px'
            }}>
              20
            </div>
            <div style={{
              fontSize: '16px',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              Years of Letters
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#dc2626',
              marginBottom: '8px'
            }}>
              10,300+
            </div>
            <div style={{
              fontSize: '16px',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              Verified Insights
            </div>
          </div>
        </div>

        {/* Topics by Priority */}
        {Object.entries(priorityLabels).map(([priority, label]) => {
          const priorityTopics = groupedTopics[parseInt(priority)] || [];
          if (priorityTopics.length === 0) return null;

          return (
            <div key={priority} style={{ marginBottom: '48px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                {label}
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                {priorityTopics.map((topic) => (
                  <a
                    key={topic.id}
                    href={`/topics/${topic.slug}`}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '24px',
                      textDecoration: 'none',
                      display: 'block',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                      e.currentTarget.style.borderColor = topic.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    {/* Color accent */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        backgroundColor: topic.color
                      }}
                    />
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: topic.color,
                          borderRadius: '50%',
                          flexShrink: 0,
                          marginTop: '4px'
                        }}
                      />
                      <div>
                        <h3 style={{
                          fontSize: '20px',
                          fontWeight: '600',
                          color: '#1f2937',
                          margin: '0 0 8px 0',
                          lineHeight: '1.3'
                        }}>
                          {topic.name}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: 0,
                          lineHeight: '1.5'
                        }}>
                          {topic.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Keywords preview */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginTop: '12px'
                    }}>
                      {topic.keywords.slice(0, 4).map((keyword, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            borderRadius: '4px',
                            fontWeight: '500'
                          }}
                        >
                          {keyword}
                        </span>
                      ))}
                      {topic.keywords.length > 4 && (
                        <span style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                          padding: '4px 0'
                        }}>
                          +{topic.keywords.length - 4} more
                        </span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}

        {/* Call to Action */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          border: '1px solid #e5e7eb',
          marginTop: '48px'
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Can't find what you're looking for?
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '24px',
            maxWidth: '500px',
            margin: '0 auto 24px'
          }}>
            Use our powerful search to find specific quotes, companies, or concepts across all of Warren Buffett's shareholder letters.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              fontSize: '16px'
            }}
          >
            Search All Letters
          </a>
        </div>
      </main>
    </div>
  );
}