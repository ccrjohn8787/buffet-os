"use client";
import { useState, useEffect } from "react";

interface YearTimelineProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
}

export default function YearTimeline({ selectedYear, onYearChange }: YearTimelineProps) {
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  
  useEffect(() => {
    // For now, use a static list based on known data
    // In production, this could be fetched from an API
    const years = [2018, 2019, 2020, 2021, 2022, 2023];
    setAvailableYears(years);
  }, []);

  if (availableYears.length === 0) return null;

  const currentYear = new Date().getFullYear();
  const minYear = Math.min(...availableYears);
  const maxYear = Math.max(...availableYears, currentYear);
  const yearRange = maxYear - minYear;

  return (
    <div style={{
      marginBottom: '20px',
      padding: '16px',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #dadce0'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <span style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#202124'
        }}>
          Filter by year
        </span>
        {selectedYear && (
          <button
            onClick={() => onYearChange('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#1a73e8',
              cursor: 'pointer',
              fontSize: '13px',
              textDecoration: 'underline'
            }}
          >
            Clear filter
          </button>
        )}
      </div>

      <div style={{
        position: 'relative',
        height: '40px',
        margin: '8px 0'
      }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute',
          top: '19px',
          left: '20px',
          right: '20px',
          height: '2px',
          backgroundColor: '#dadce0'
        }} />

        {/* Year markers */}
        {availableYears.map(year => {
          const position = ((year - minYear) / yearRange) * 100;
          const isSelected = selectedYear === year.toString();
          
          return (
            <div
              key={year}
              style={{
                position: 'absolute',
                left: `calc(${position}% + 10px)`,
                transform: 'translateX(-50%)',
                cursor: 'pointer'
              }}
              onClick={() => onYearChange(isSelected ? '' : year.toString())}
            >
              {/* Year dot */}
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: isSelected ? '#1a73e8' : '#ffffff',
                border: `2px solid ${isSelected ? '#1a73e8' : '#dadce0'}`,
                margin: '0 auto 4px',
                transition: 'all 0.2s ease'
              }} />
              
              {/* Year label */}
              <div style={{
                fontSize: '12px',
                color: isSelected ? '#1a73e8' : '#5f6368',
                fontWeight: isSelected ? '500' : '400',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                {year}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginTop: '16px'
      }}>
        {/* Quick decade filters */}
        <button
          onClick={() => onYearChange('')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: !selectedYear ? '#1a73e8' : '#f8f9fa',
            color: !selectedYear ? 'white' : '#5f6368',
            border: 'none',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          All years
        </button>
        
        <button
          onClick={() => {
            // Set to most recent available year
            const recentYear = Math.max(...availableYears).toString();
            onYearChange(selectedYear === recentYear ? '' : recentYear);
          }}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: selectedYear === Math.max(...availableYears).toString() ? '#1a73e8' : '#f8f9fa',
            color: selectedYear === Math.max(...availableYears).toString() ? 'white' : '#5f6368',
            border: 'none',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Latest
        </button>

        <button
          onClick={() => {
            // Filter to 2020s
            const twentiesYears = availableYears.filter(y => y >= 2020);
            if (twentiesYears.length > 0) {
              // For now, just select the first 2020s year - could be enhanced to show multiple
              const year = twentiesYears[0].toString();
              onYearChange(selectedYear === year ? '' : year);
            }
          }}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: selectedYear && parseInt(selectedYear) >= 2020 ? '#1a73e8' : '#f8f9fa',
            color: selectedYear && parseInt(selectedYear) >= 2020 ? 'white' : '#5f6368',
            border: 'none',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          2020s
        </button>
      </div>
    </div>
  );
}