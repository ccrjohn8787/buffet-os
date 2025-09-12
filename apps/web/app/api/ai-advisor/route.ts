import { NextRequest } from 'next/server'

// Cache for AI advisor analysis
const advisorCache = new Map<string, any>()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes for AI-generated content

interface CompanyAnalysis {
  company_name: string
  ticker: string
  industry: string
  market_cap: string
  analysis_date: string
  buffett_framework_score: number // 0-100
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid' | 'strong_avoid'
  confidence_level: number // 0-100
  key_strengths: string[]
  key_concerns: string[]
  
  framework_analysis: {
    circle_of_competence: {
      score: number
      assessment: string
      buffett_perspective: string
    }
    business_quality: {
      score: number
      moat_type: string
      moat_strength: 'weak' | 'moderate' | 'strong' | 'very_strong'
      predictability: number
      assessment: string
    }
    management_quality: {
      score: number
      integrity_assessment: string
      capital_allocation_grade: 'A' | 'B' | 'C' | 'D' | 'F'
      track_record: string
    }
    financial_strength: {
      score: number
      roe_assessment: string
      debt_analysis: string
      cash_generation: string
      financial_stability: number
    }
    valuation: {
      score: number
      margin_of_safety: number // percentage
      intrinsic_value_estimate: string
      current_price_assessment: string
      value_opportunity: boolean
    }
  }
  
  ai_insights: {
    buffett_would_invest: boolean
    historical_parallel: {
      similar_company: string
      year: number
      outcome: string
      lessons: string
    }
    risk_factors: {
      level: 'low' | 'moderate' | 'high' | 'very_high'
      primary_risks: string[]
      mitigation_strategies: string[]
    }
    investment_thesis: string
    contrarian_opportunity: boolean
  }
  
  personalized_advice: {
    suitability_score: number // based on user profile
    learning_opportunities: string[]
    next_steps: string[]
    timeline_recommendation: string
    position_sizing_guidance: string
  }
  
  supporting_quotes: {
    text: string
    year: number
    anchor: string
    relevance: string
  }[]
  
  disclaimer: string
}

// Mock financial data service - in production would integrate with real APIs
const mockFinancialData = {
  'AAPL': {
    company_name: 'Apple Inc.',
    market_cap: '$2.8T',
    industry: 'Technology Hardware',
    roe: 28.5,
    debt_to_equity: 0.31,
    revenue_growth: 8.2,
    profit_margin: 23.8,
    current_ratio: 0.98,
    pe_ratio: 28.7,
    free_cash_flow: '$84B'
  },
  'KO': {
    company_name: 'The Coca-Cola Company',
    market_cap: '$248B',
    industry: 'Consumer Beverages',
    roe: 42.8,
    debt_to_equity: 1.45,
    revenue_growth: 3.2,
    profit_margin: 22.7,
    current_ratio: 1.13,
    pe_ratio: 25.4,
    free_cash_flow: '$9.3B'
  },
  'BRK.B': {
    company_name: 'Berkshire Hathaway Inc.',
    market_cap: '$890B',
    industry: 'Financial Conglomerate',
    roe: 12.8,
    debt_to_equity: 0.28,
    revenue_growth: 12.8,
    profit_margin: 15.2,
    current_ratio: 1.85,
    pe_ratio: 22.1,
    free_cash_flow: '$38B'
  }
}

// AI-powered analysis engine (simulated - in production would use actual AI)
function generateCompanyAnalysis(ticker: string, userProfile?: any): CompanyAnalysis {
  const financials = mockFinancialData[ticker as keyof typeof mockFinancialData]
  if (!financials) {
    throw new Error('Company not found in analysis database')
  }

  // Simulate AI analysis based on Buffett's framework
  const analysis: CompanyAnalysis = {
    company_name: financials.company_name,
    ticker,
    industry: financials.industry,
    market_cap: financials.market_cap,
    analysis_date: new Date().toISOString().split('T')[0],
    buffett_framework_score: 0,
    recommendation: 'hold',
    confidence_level: 0,
    key_strengths: [],
    key_concerns: [],
    
    framework_analysis: {
      circle_of_competence: {
        score: 0,
        assessment: '',
        buffett_perspective: ''
      },
      business_quality: {
        score: 0,
        moat_type: '',
        moat_strength: 'moderate',
        predictability: 0,
        assessment: ''
      },
      management_quality: {
        score: 0,
        integrity_assessment: '',
        capital_allocation_grade: 'B',
        track_record: ''
      },
      financial_strength: {
        score: 0,
        roe_assessment: '',
        debt_analysis: '',
        cash_generation: '',
        financial_stability: 0
      },
      valuation: {
        score: 0,
        margin_of_safety: 0,
        intrinsic_value_estimate: '',
        current_price_assessment: '',
        value_opportunity: false
      }
    },
    
    ai_insights: {
      buffett_would_invest: false,
      historical_parallel: {
        similar_company: '',
        year: 0,
        outcome: '',
        lessons: ''
      },
      risk_factors: {
        level: 'moderate',
        primary_risks: [],
        mitigation_strategies: []
      },
      investment_thesis: '',
      contrarian_opportunity: false
    },
    
    personalized_advice: {
      suitability_score: 75,
      learning_opportunities: [],
      next_steps: [],
      timeline_recommendation: 'Long-term hold (5+ years)',
      position_sizing_guidance: 'Start with 2-5% portfolio allocation'
    },
    
    supporting_quotes: [],
    
    disclaimer: 'This analysis is for educational purposes only and should not be considered financial advice. Always conduct your own research and consult with qualified financial advisors before making investment decisions.'
  }

  // Company-specific analysis
  if (ticker === 'AAPL') {
    analysis.buffett_framework_score = 82
    analysis.recommendation = 'buy'
    analysis.confidence_level = 85
    analysis.key_strengths = [
      'Exceptional brand loyalty and pricing power',
      'Powerful ecosystem creating customer lock-in',
      'Superior capital efficiency and cash generation',
      'Strong management team with shareholder focus'
    ]
    analysis.key_concerns = [
      'High valuation relative to historical norms',
      'Regulatory pressure and antitrust scrutiny',
      'Dependence on Chinese market and supply chain',
      'Maturity of smartphone market'
    ]

    analysis.framework_analysis = {
      circle_of_competence: {
        score: 85,
        assessment: 'Technology company with consumer product characteristics',
        buffett_perspective: 'Initially avoided but now understood as consumer brand with predictable demand patterns'
      },
      business_quality: {
        score: 90,
        moat_type: 'Ecosystem and Brand Loyalty',
        moat_strength: 'very_strong',
        predictability: 85,
        assessment: 'Exceptional business with sustainable competitive advantages through ecosystem integration'
      },
      management_quality: {
        score: 88,
        integrity_assessment: 'Strong track record of shareholder-friendly policies',
        capital_allocation_grade: 'A',
        track_record: 'Consistent return of excess cash through buybacks and dividends'
      },
      financial_strength: {
        score: 85,
        roe_assessment: 'Excellent 28.5% ROE demonstrates efficient capital use',
        debt_analysis: 'Conservative debt levels at 0.31 debt-to-equity ratio',
        cash_generation: 'Outstanding $84B free cash flow generation',
        financial_stability: 92
      },
      valuation: {
        score: 65,
        margin_of_safety: 15,
        intrinsic_value_estimate: '$185-210 per share',
        current_price_assessment: 'Fair value with modest upside potential',
        value_opportunity: true
      }
    }

    analysis.ai_insights = {
      buffett_would_invest: true,
      historical_parallel: {
        similar_company: 'Coca-Cola',
        year: 1988,
        outcome: 'Exceptional long-term returns',
        lessons: 'Brand loyalty and consumer attachment create durable competitive advantages'
      },
      risk_factors: {
        level: 'moderate',
        primary_risks: [
          'Technology disruption in mobile devices',
          'Regulatory challenges to App Store model',
          'China market and geopolitical tensions'
        ],
        mitigation_strategies: [
          'Services revenue diversification',
          'Strong balance sheet for adaptation',
          'Geographic revenue diversification'
        ]
      },
      investment_thesis: 'Apple has evolved from a technology company into a consumer lifestyle brand with exceptional customer loyalty. The ecosystem moat creates switching costs that protect pricing power and market share.',
      contrarian_opportunity: false
    }

    analysis.personalized_advice = {
      suitability_score: 85,
      learning_opportunities: [
        'Study ecosystem business models',
        'Analyze technology company moats',
        'Understand services revenue transition'
      ],
      next_steps: [
        'Monitor quarterly services revenue growth',
        'Track customer retention and ecosystem expansion',
        'Assess regulatory impact on business model'
      ],
      timeline_recommendation: 'Long-term hold (5+ years)',
      position_sizing_guidance: 'Consider 5-10% portfolio allocation for quality growth'
    }

    analysis.supporting_quotes = [
      {
        text: 'We see Apple as more of a consumer products company',
        year: 2017,
        anchor: '¶23',
        relevance: 'Buffett\'s perspective shift on Apple from tech to consumer company'
      },
      {
        text: 'Time is the friend of the wonderful business',
        year: 1996,
        anchor: '¶13',
        relevance: 'Apple\'s ecosystem advantages compound over time'
      }
    ]
  }
  
  else if (ticker === 'KO') {
    analysis.buffett_framework_score = 88
    analysis.recommendation = 'buy'
    analysis.confidence_level = 92
    analysis.key_strengths = [
      'World\'s most valuable brand with global recognition',
      'Unmatched distribution network in 200+ countries',
      'Predictable cash flows from consumer habits',
      'Pricing power and market leadership position'
    ]
    analysis.key_concerns = [
      'Declining soda consumption in developed markets',
      'Health consciousness trends affecting demand',
      'Currency headwinds from international exposure',
      'Limited growth in mature markets'
    ]

    analysis.framework_analysis = {
      circle_of_competence: {
        score: 95,
        assessment: 'Simple, understandable consumer products business',
        buffett_perspective: 'Perfect example of a business anyone can understand - people will be drinking Coke in 50 years'
      },
      business_quality: {
        score: 94,
        moat_type: 'Brand Moat and Distribution Network',
        moat_strength: 'very_strong',
        predictability: 90,
        assessment: 'Textbook example of durable competitive advantage through brand strength'
      },
      management_quality: {
        score: 82,
        integrity_assessment: 'Generally shareholder-friendly with consistent dividend policy',
        capital_allocation_grade: 'B',
        track_record: 'Long history of dividend growth and prudent expansion'
      },
      financial_strength: {
        score: 88,
        roe_assessment: 'Excellent 42.8% ROE shows exceptional profitability',
        debt_analysis: 'Higher debt levels at 1.45 ratio but manageable given cash flows',
        cash_generation: 'Reliable $9.3B free cash flow supports dividend growth',
        financial_stability: 85
      },
      valuation: {
        score: 78,
        margin_of_safety: 25,
        intrinsic_value_estimate: '$68-75 per share',
        current_price_assessment: 'Attractive value with good margin of safety',
        value_opportunity: true
      }
    }

    analysis.ai_insights = {
      buffett_would_invest: true,
      historical_parallel: {
        similar_company: 'Coca-Cola',
        year: 1988,
        outcome: 'Core holding for 35+ years',
        lessons: 'Buffett\'s largest and most successful investment demonstrates power of brand moats'
      },
      risk_factors: {
        level: 'low',
        primary_risks: [
          'Health trend shifts away from sugary drinks',
          'Currency translation impacts',
          'Regulatory sugar taxes in some markets'
        ],
        mitigation_strategies: [
          'Portfolio diversification into healthier options',
          'Geographic revenue spread',
          'Strong balance sheet for adaptation'
        ]
      },
      investment_thesis: 'Coca-Cola represents the ideal Buffett investment: simple business, dominant brand, predictable cash flows, and global reach. Despite health trends, the brand remains resilient worldwide.',
      contrarian_opportunity: true
    }

    analysis.supporting_quotes = [
      {
        text: 'We expect to hold these securities for a long time',
        year: 1988,
        anchor: '¶8',
        relevance: 'Buffett\'s original Coca-Cola investment thesis'
      },
      {
        text: 'A truly great business must have an enduring moat',
        year: 2007,
        anchor: '¶11',
        relevance: 'Coca-Cola exemplifies sustainable competitive advantage'
      }
    ]
  }
  
  else if (ticker === 'BRK.B') {
    analysis.buffett_framework_score = 95
    analysis.recommendation = 'strong_buy'
    analysis.confidence_level = 98
    analysis.key_strengths = [
      'Direct access to Warren Buffett\'s investment acumen',
      'Diversified portfolio of wholly-owned quality businesses',
      'Exceptional management depth and succession planning',
      'Fortress-like balance sheet with massive cash reserves'
    ]
    analysis.key_concerns = [
      'Succession concerns post-Buffett era',
      'Large size may limit future growth rates',
      'Complex conglomerate structure',
      'Performance may lag in strong bull markets'
    ]

    analysis.framework_analysis = {
      circle_of_competence: {
        score: 100,
        assessment: 'The ultimate circle of competence investment - Buffett managing your money',
        buffett_perspective: 'Investing alongside Buffett provides direct exposure to his methodology'
      },
      business_quality: {
        score: 92,
        moat_type: 'Management Excellence and Capital Allocation',
        moat_strength: 'very_strong',
        predictability: 88,
        assessment: 'Collection of high-quality businesses with exceptional management oversight'
      },
      management_quality: {
        score: 100,
        integrity_assessment: 'Unparalleled integrity and shareholder alignment',
        capital_allocation_grade: 'A',
        track_record: '60+ years of exceptional capital allocation and business building'
      },
      financial_strength: {
        score: 98,
        roe_assessment: '12.8% ROE is solid given size and conservative approach',
        debt_analysis: 'Minimal debt at 0.28 ratio provides financial fortress',
        cash_generation: '$38B free cash flow enables opportunistic investments',
        financial_stability: 100
      },
      valuation: {
        score: 82,
        margin_of_safety: 20,
        intrinsic_value_estimate: 'Book value plus premium for management',
        current_price_assessment: 'Trading near fair value with good long-term prospects',
        value_opportunity: true
      }
    }

    analysis.ai_insights = {
      buffett_would_invest: true,
      historical_parallel: {
        similar_company: 'Berkshire Hathaway',
        year: 1965,
        outcome: '4,300,000% total return since Buffett took control',
        lessons: 'Demonstrates power of compound growth and exceptional capital allocation over decades'
      },
      risk_factors: {
        level: 'low',
        primary_risks: [
          'Key man risk with Buffett and Munger aging',
          'Size limiting high-growth opportunities',
          'Regulatory constraints on large positions'
        ],
        mitigation_strategies: [
          'Strong succession planning in place',
          'Diversified portfolio reduces single-company risk',
          'Conservative financial management'
        ]
      },
      investment_thesis: 'Berkshire Hathaway offers investors the opportunity to compound wealth alongside history\'s greatest investor while owning a collection of exceptional businesses.',
      contrarian_opportunity: false
    }

    analysis.supporting_quotes = [
      {
        text: 'Our favorite holding period is forever',
        year: 1988,
        anchor: '¶7',
        relevance: 'Berkshire\'s long-term investment philosophy'
      },
      {
        text: 'Time is the friend of the wonderful business',
        year: 1996,
        anchor: '¶13',
        relevance: 'Berkshire\'s portfolio benefits from long-term compounding'
      }
    ]
  }

  return analysis
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ticker = searchParams.get('ticker')
  const analysisType = searchParams.get('type') || 'full'
  const userId = searchParams.get('user_id')
  
  if (!ticker) {
    return new Response(
      JSON.stringify({ 
        error: 'missing_ticker', 
        message: 'Ticker symbol is required for analysis' 
      }), 
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Check cache
  const cacheKey = `ai-advisor:${ticker.toUpperCase()}:${analysisType}:${userId || 'anonymous'}`
  const cached = advisorCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return new Response(JSON.stringify(cached.data), { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json', 
        'X-Cache': 'HIT',
        'Cache-Control': 'public, max-age=900'
      } 
    })
  }

  try {
    // Generate AI analysis
    const analysis = generateCompanyAnalysis(ticker.toUpperCase())
    
    let result: any = analysis
    
    // Filter by analysis type
    if (analysisType === 'summary') {
      result = {
        company_name: analysis.company_name,
        ticker: analysis.ticker,
        buffett_framework_score: analysis.buffett_framework_score,
        recommendation: analysis.recommendation,
        confidence_level: analysis.confidence_level,
        key_strengths: analysis.key_strengths.slice(0, 3),
        key_concerns: analysis.key_concerns.slice(0, 3),
        ai_insights: {
          buffett_would_invest: analysis.ai_insights.buffett_would_invest,
          investment_thesis: analysis.ai_insights.investment_thesis
        }
      }
    } else if (analysisType === 'framework') {
      result = {
        company_name: analysis.company_name,
        ticker: analysis.ticker,
        framework_analysis: analysis.framework_analysis,
        supporting_quotes: analysis.supporting_quotes
      }
    }
    
    // Add metadata
    result.metadata = {
      analysis_version: '1.0',
      last_updated: analysis.analysis_date,
      cache_status: 'MISS',
      processing_time: '2.3s'
    }
    
    // Cache the result
    advisorCache.set(cacheKey, { data: result, timestamp: Date.now() })
    
    // Clean old cache entries
    if (advisorCache.size > 100) {
      const now = Date.now()
      const oldEntries = Array.from(advisorCache.entries())
        .filter(([_, value]) => now - value.timestamp > CACHE_TTL)
      oldEntries.forEach(([key]) => advisorCache.delete(key))
    }
    
    return new Response(JSON.stringify(result), { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=900'
      } 
    })
    
  } catch (error: any) {
    console.error('Error in AI advisor:', error)
    
    if (error.message.includes('not found')) {
      return new Response(
        JSON.stringify({ 
          error: 'company_not_found', 
          message: `Analysis not available for ticker ${ticker}. Currently supporting AAPL, KO, BRK.B` 
        }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'ai_analysis_failed', 
        message: 'Failed to generate investment analysis' 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}