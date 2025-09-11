"use client";
import { useState, useEffect } from "react";

interface Topic {
  id: string;
  slug: string;
  name: string;
  description: string;
  keywords: string[];
  color: string;
  priority: number;
}

interface TopicSelectorProps {
  selectedTopic: string;
  onTopicChange: (topicId: string) => void;
}

export default function TopicSelector({ selectedTopic, onTopicChange }: TopicSelectorProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    async function loadTopics() {
      try {
        const response = await fetch('/api/topics');
        const data = await response.json();
        setTopics(data.topics || []);
      } catch (error) {
        console.error('Error loading topics:', error);
      }
    }
    loadTopics();
  }, []);
  
  const selectedTopicData = topics.find(t => t.id === selectedTopic);
  
  return (
    <div style={{ position: 'relative', minWidth: '160px' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10px 16px',
          fontSize: '14px',
          border: '1px solid #dadce0',
          borderRadius: '20px',
          backgroundColor: '#f8f9fa',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          outline: 'none',
          color: selectedTopic ? '#1a73e8' : '#5f6368'
        }}
        onFocus={(e) => {
          e.target.style.backgroundColor = 'white';
          e.target.style.boxShadow = '0 2px 5px 1px rgba(64,60,67,.16)';
        }}
        onBlur={(e) => {
          setTimeout(() => {
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.boxShadow = 'none';
            setIsOpen(false);
          }, 150);
        }}
      >
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {selectedTopicData ? selectedTopicData.name : 'All Topics'}
        </span>
        <span style={{
          marginLeft: '8px',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #dadce0',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxHeight: '300px',
          overflowY: 'auto',
          marginTop: '4px'
        }}>
          {/* All Topics option */}
          <button
            onClick={() => {
              onTopicChange('');
              setIsOpen(false);
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              backgroundColor: !selectedTopic ? '#f8f9fa' : 'white',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#202124',
              borderBottom: '1px solid #f0f0f0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = !selectedTopic ? '#f8f9fa' : 'white';
            }}
          >
            <div style={{ fontWeight: '500' }}>All Topics</div>
            <div style={{ fontSize: '12px', color: '#5f6368', marginTop: '2px' }}>
              Search across all investment themes
            </div>
          </button>
          
          {/* Priority 1 topics first */}
          {topics
            .filter(topic => topic.priority === 1)
            .map((topic) => (
              <button
                key={topic.id}
                onClick={() => {
                  onTopicChange(topic.id);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: selectedTopic === topic.id ? '#f8f9fa' : 'white',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#202124',
                  borderBottom: '1px solid #f0f0f0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = selectedTopic === topic.id ? '#f8f9fa' : 'white';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px'
                }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: topic.color,
                      borderRadius: '50%'
                    }}
                  />
                  <span style={{ fontWeight: '500' }}>{topic.name}</span>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#5f6368',
                  paddingLeft: '16px'
                }}>
                  {topic.description}
                </div>
              </button>
            ))}
          
          {/* Separator */}
          {topics.filter(t => t.priority > 1).length > 0 && (
            <div style={{
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#5f6368',
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid #f0f0f0'
            }}>
              More Topics
            </div>
          )}
          
          {/* Other priority topics */}
          {topics
            .filter(topic => topic.priority > 1)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((topic) => (
              <button
                key={topic.id}
                onClick={() => {
                  onTopicChange(topic.id);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: selectedTopic === topic.id ? '#f8f9fa' : 'white',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: '#202124'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = selectedTopic === topic.id ? '#f8f9fa' : 'white';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: topic.color,
                      borderRadius: '50%'
                    }}
                  />
                  <span>{topic.name}</span>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}