import { NextRequest } from 'next/server'

// Cache for market analysis data
const analysisCache = new Map<string, any>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes for market data

interface MarketTrend {
  metric: string
  current_value: number
  trend_direction: 'up' | 'down' | 'neutral'
  significance: 'high' | 'medium' | 'low'
  buffett_perspective: string
  historical_context: string
  opportunity_indicator: boolean
}

interface SectorAnalysis {
  sector: string
  buffett_favorability: 'very_favorable' | 'favorable' | 'neutral' | 'unfavorable'
  current_valuation: 'undervalued' | 'fairly_valued' | 'overvalued'
  key_companies: string[]
  moat_strength: 'weak' | 'moderate' | 'strong' | 'very_strong'
  predictability: number // 0-100
  regulatory_environment: 'supportive' | 'neutral' | 'challenging'
  long_term_outlook: string
}

interface MarketAnalysis {
  analysis_date: string
  market_temperature: 'ice_cold' | 'cold' | 'cool' | 'warm' | 'hot' | 'overheated'
  fear_greed_indicator: number // 0-100, 0 = extreme fear, 100 = extreme greed
  opportunity_score: number // 0-100, Buffett-style opportunity assessment
  market_trends: MarketTrend[]
  sector_analysis: SectorAnalysis[]
  buffett_market_wisdom: {
    relevant_quote: string
    source: string
    current_applicability: string
  }
  recommended_actions: {
    market_condition: string
    suggested_approach: string
    reasoning: string
    historical_parallel: string
  }
  risk_factors: {
    systemic_risks: string[]
    opportunities: string[]
    buffett_approach: string
  }
}

// Mock market data - in production would come from real market APIs
const MOCK_MARKET_ANALYSIS: MarketAnalysis = {
  analysis_date: "2025-09-12T10:30:00Z",
  market_temperature: "warm",
  fear_greed_indicator: 72,
  opportunity_score: 35,
  market_trends: [
    {
      metric: "S&P 500 P/E Ratio",
      current_value: 26.8,
      trend_direction: "up",
      significance: "high",
      buffett_perspective: "Above historical average - proceed with caution. Quality companies may still be attractive at reasonable prices.",
      historical_context: "Current P/E higher than long-term average of 16-18, suggesting stretched valuations",
      opportunity_indicator: false
    },
    {
      metric: "VIX (Volatility Index)",
      current_value: 14.2,
      trend_direction: "down",
      significance: "medium",
      buffett_perspective: "Low volatility suggests complacency. Best opportunities arise when others are fearful.",
      historical_context: "Below 20 indicates low market fear - historically less attractive entry points",
      opportunity_indicator: false
    },
    {
      metric: "10-Year Treasury Yield",
      current_value: 4.25,
      trend_direction: "neutral",
      significance: "high",
      buffett_perspective: "Higher rates make bonds more competitive with stocks. Focus on companies with pricing power.",
      historical_context: "Elevated from 2020-2022 lows, creating competition for equity investments",
      opportunity_indicator: true
    },
    {
      metric: "Corporate Credit Spreads",
      current_value: 125,
      trend_direction: "down",
      significance: "medium",
      buffett_perspective: "Tight spreads indicate confidence but may signal excessive optimism.",
      historical_context: "Below long-term average suggests limited distress in credit markets",
      opportunity_indicator: false
    }
  ],
  sector_analysis: [
    {
      sector: "Technology",
      buffett_favorability: "neutral",
      current_valuation: "overvalued",
      key_companies: ["AAPL", "MSFT", "GOOGL"],
      moat_strength: "strong",
      predictability: 65,
      regulatory_environment: "challenging",
      long_term_outlook: "Strong fundamentals but rich valuations limit opportunities to exceptional companies with wide moats"
    },
    {
      sector: "Financials",
      buffett_favorability: "very_favorable", 
      current_valuation: "fairly_valued",
      key_companies: ["BAC", "JPM", "WFC"],
      moat_strength: "moderate",
      predictability: 75,
      regulatory_environment: "neutral",
      long_term_outlook: "Benefit from higher interest rates. Focus on banks with strong deposit franchises and disciplined lending"
    },
    {
      sector: "Consumer Staples",
      buffett_favorability: "favorable",
      current_valuation: "fairly_valued",
      key_companies: ["KO", "PG", "WMT"],
      moat_strength: "strong",
      predictability: 85,
      regulatory_environment: "supportive",
      long_term_outlook: "Predictable cash flows and pricing power make these attractive in uncertain times"
    },
    {
      sector: "Energy",
      buffett_favorability: "neutral",
      current_valuation: "undervalued",
      key_companies: ["CVX", "XOM", "OXY"],
      moat_strength: "moderate",
      predictability: 45,
      regulatory_environment: "challenging",
      long_term_outlook: "Cyclical challenges but potential value for patient investors in quality operators"
    },
    {
      sector: "Healthcare",
      buffett_favorability: "favorable",
      current_valuation: "fairly_valued", 
      key_companies: ["JNJ", "UNH", "PFE"],
      moat_strength: "strong",
      predictability: 80,
      regulatory_environment: "neutral",
      long_term_outlook: "Aging demographics provide tailwinds. Focus on companies with sustainable competitive advantages"
    }
  ],
  buffett_market_wisdom: {
    relevant_quote: "Be fearful when others are greedy and greedy when others are fearful",
    source: "Annual Letter to Shareholders, 1986",
    current_applicability: "Current market sentiment appears optimistic with low volatility and high valuations. Selective opportunities exist but widespread bargains are limited."
  },
  recommended_actions: {
    market_condition: "Elevated valuations with pockets of opportunity",
    suggested_approach: "Focus on quality companies with wide moats trading at reasonable prices. Be patient and selective.",
    reasoning: "High overall valuations limit opportunities but don't eliminate them. Quality businesses with predictable cash flows remain attractive.",
    historical_parallel: "Similar to late 1990s - expensive overall market but individual opportunities available for disciplined investors"
  },
  risk_factors: {
    systemic_risks: [
      "Elevated market valuations vulnerable to sentiment shifts",
      "High government debt levels constraining fiscal policy",
      "Geopolitical tensions affecting global trade",
      "Artificial intelligence disruption to traditional business models"
    ],
    opportunities: [
      "Individual companies with strong moats trading reasonably",
      "Financial sector benefiting from higher interest rates", 
      "Consumer staples with pricing power in inflationary environment",
      "Energy companies with improved capital discipline"
    ],
    buffett_approach: "Focus on businesses you understand with predictable cash flows, strong management, and reasonable prices. Ignore market noise and think long-term."
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const section = searchParams.get('section') // 'trends', 'sectors', 'opportunities', 'risks'
  const format = searchParams.get('format') || 'full'
  
  // Check cache
  const cacheKey = `market:${section || 'all'}:${format}`
  const cached = analysisCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return new Response(JSON.stringify(cached.data), { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json', 
        'X-Cache': 'HIT',
        'Cache-Control': 'public, max-age=300' // 5 minutes
      } 
    })
  }

  try {
    // In production, fetch real market data from financial APIs
    let result: any = { ...MOCK_MARKET_ANALYSIS }
    
    // Add derived insights
    result.insights = {
      market_phase: determineMarketPhase(result),
      value_opportunities: identifyValueOpportunities(result),
      buffett_score: calculateBuffettScore(result),
      key_themes: extractKeyThemes(result),
      next_review_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
    }
    
    // Filter by section if requested
    if (section) {
      const sectionMap: { [key: string]: any } = {
        'trends': {
          market_temperature: result.market_temperature,
          fear_greed_indicator: result.fear_greed_indicator,
          market_trends: result.market_trends,
          insights: {
            market_phase: result.insights.market_phase,
            buffett_score: result.insights.buffett_score
          }
        },
        'sectors': {
          sector_analysis: result.sector_analysis,
          insights: {
            value_opportunities: result.insights.value_opportunities
          }
        },
        'opportunities': {
          opportunity_score: result.opportunity_score,
          recommended_actions: result.recommended_actions,
          risk_factors: { opportunities: result.risk_factors.opportunities },
          insights: { 
            value_opportunities: result.insights.value_opportunities,
            key_themes: result.insights.key_themes
          }
        },
        'risks': {
          risk_factors: result.risk_factors,
          market_temperature: result.market_temperature,
          buffett_market_wisdom: result.buffett_market_wisdom
        }
      }
      
      if (sectionMap[section]) {
        result = sectionMap[section]
      }
    }
    
    // Format response
    if (format === 'summary') {
      result = {
        market_temperature: result.market_temperature,
        opportunity_score: result.opportunity_score,
        key_insight: result.buffett_market_wisdom?.relevant_quote || result.recommended_actions?.suggested_approach,
        top_opportunity: result.insights?.value_opportunities?.[0],
        main_risk: result.risk_factors?.systemic_risks?.[0]
      }
    }
    
    // Cache the result
    analysisCache.set(cacheKey, { data: result, timestamp: Date.now() })
    
    return new Response(JSON.stringify(result), { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=300'
      } 
    })
    
  } catch (error: any) {
    console.error('Error in market analysis API:', error)
    return new Response(
      JSON.stringify({ 
        error: 'market_analysis_failed', 
        message: 'Failed to load market analysis' 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

function determineMarketPhase(analysis: MarketAnalysis): string {
  const { market_temperature, fear_greed_indicator, opportunity_score } = analysis
  
  if (opportunity_score >= 70) return "Significant opportunities available"
  if (opportunity_score >= 50) return "Selective opportunities present"
  if (fear_greed_indicator >= 80) return "Extreme greed - exercise caution"
  if (fear_greed_indicator <= 20) return "Extreme fear - potential opportunities"
  if (market_temperature === 'overheated') return "Overheated market - wait for opportunities"
  if (market_temperature === 'ice_cold') return "Market distress - time to be greedy"
  
  return "Normal market conditions - be selective"
}

function identifyValueOpportunities(analysis: MarketAnalysis): string[] {
  const opportunities = []
  
  // Check sectors
  for (const sector of analysis.sector_analysis) {
    if (sector.current_valuation === 'undervalued' && sector.buffett_favorability !== 'unfavorable') {
      opportunities.push(`${sector.sector} sector appears undervalued with ${sector.moat_strength} competitive moats`)
    }
    if (sector.buffett_favorability === 'very_favorable' && sector.current_valuation === 'fairly_valued') {
      opportunities.push(`${sector.sector} offers quality businesses at reasonable prices`)
    }
  }
  
  // Check market trends
  for (const trend of analysis.market_trends) {
    if (trend.opportunity_indicator && trend.significance === 'high') {
      opportunities.push(`${trend.metric}: ${trend.buffett_perspective}`)
    }
  }
  
  return opportunities.slice(0, 3) // Top 3 opportunities
}

function calculateBuffettScore(analysis: MarketAnalysis): number {
  let score = 50 // Base score
  
  // Adjust for fear/greed (inverse relationship)
  score += (50 - analysis.fear_greed_indicator) * 0.3
  
  // Adjust for opportunity score
  score += (analysis.opportunity_score - 50) * 0.4
  
  // Adjust for market temperature
  const tempAdjustment = {
    'ice_cold': 30,
    'cold': 20,
    'cool': 10,
    'warm': -5,
    'hot': -15,
    'overheated': -25
  }
  score += tempAdjustment[analysis.market_temperature] || 0
  
  return Math.max(0, Math.min(100, Math.round(score)))
}

function extractKeyThemes(analysis: MarketAnalysis): string[] {
  const themes = []
  
  // Market temperature theme
  if (analysis.market_temperature === 'overheated' || analysis.fear_greed_indicator > 75) {
    themes.push("Market optimism at elevated levels - be cautious")
  }
  
  // Sector rotation theme
  const favorableSectors = analysis.sector_analysis.filter(s => 
    s.buffett_favorability === 'very_favorable' || s.buffett_favorability === 'favorable'
  ).length
  if (favorableSectors >= 3) {
    themes.push("Multiple sectors showing Buffett-friendly characteristics")
  }
  
  // Interest rate theme
  const treasuryTrend = analysis.market_trends.find(t => t.metric.includes('Treasury'))
  if (treasuryTrend && treasuryTrend.current_value > 4) {
    themes.push("Higher interest rates creating competition for equities")
  }
  
  // Opportunity theme
  if (analysis.opportunity_score < 40) {
    themes.push("Limited opportunities in current market environment")
  } else if (analysis.opportunity_score > 60) {
    themes.push("Attractive opportunities emerging for patient investors")
  }
  
  return themes
}