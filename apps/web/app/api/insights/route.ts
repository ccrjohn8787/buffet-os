import { NextRequest } from 'next/server'

// Cache for personalized insights
const insightsCache = new Map<string, any>()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

interface UserProfile {
  user_id: string
  investment_style: 'conservative' | 'balanced' | 'aggressive'
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  risk_tolerance: 'low' | 'moderate' | 'high'
  time_horizon: 'short' | 'medium' | 'long'
  preferred_sectors: string[]
  current_portfolio?: {
    total_value: number
    positions: { symbol: string; weight: number }[]
    cash_percentage: number
  }
  learning_goals: string[]
  interests: string[]
}

interface PersonalizedInsight {
  insight_id: string
  title: string
  category: 'market_opportunity' | 'portfolio_advice' | 'learning_tip' | 'behavioral_finance' | 'risk_management'
  priority: 'high' | 'medium' | 'low'
  buffett_principle: string
  personalized_message: string
  action_items: string[]
  supporting_quote: {
    text: string
    source: string
    year: number
    relevance_score: number
  }
  estimated_reading_time: number
  related_concepts: string[]
  next_steps: string[]
}

interface PersonalizedInsights {
  user_profile: UserProfile
  generation_date: string
  insights: PersonalizedInsight[]
  daily_wisdom: {
    quote: string
    source: string
    personal_application: string
    reflection_prompt: string
  }
  recommended_learning_path: {
    current_focus: string
    next_modules: string[]
    estimated_completion_time: number
  }
  portfolio_health_check?: {
    buffett_alignment_score: number
    concentration_risk: 'low' | 'moderate' | 'high'
    diversification_assessment: string
    suggested_improvements: string[]
  }
  market_timing_advice: {
    current_market_phase: string
    recommended_action: string
    buffett_perspective: string
  }
}

// Mock user profiles for demo
const SAMPLE_USER_PROFILES: UserProfile[] = [
  {
    user_id: "demo_user_1",
    investment_style: "balanced",
    experience_level: "intermediate",
    risk_tolerance: "moderate",
    time_horizon: "long",
    preferred_sectors: ["Technology", "Consumer Staples", "Financials"],
    current_portfolio: {
      total_value: 250000,
      positions: [
        { symbol: "AAPL", weight: 15 },
        { symbol: "MSFT", weight: 12 },
        { symbol: "KO", weight: 8 },
        { symbol: "JPM", weight: 10 },
        { symbol: "BRK.B", weight: 20 }
      ],
      cash_percentage: 5
    },
    learning_goals: ["Improve valuation skills", "Understand moats better", "Learn about management quality"],
    interests: ["Value investing", "Business analysis", "Long-term thinking"]
  },
  {
    user_id: "demo_user_2", 
    investment_style: "conservative",
    experience_level: "beginner",
    risk_tolerance: "low",
    time_horizon: "long",
    preferred_sectors: ["Consumer Staples", "Utilities", "Healthcare"],
    learning_goals: ["Basic investment principles", "Risk management", "Portfolio construction"],
    interests: ["Warren Buffett philosophy", "Dividend investing", "Safe investments"]
  }
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id') || 'demo_user_1'
  const category = searchParams.get('category') // 'market', 'portfolio', 'learning', 'all'
  const limit = parseInt(searchParams.get('limit') || '5')
  
  // Check cache
  const cacheKey = `insights:${userId}:${category || 'all'}:${limit}`
  const cached = insightsCache.get(cacheKey)
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
    // Get user profile (in production, from database)
    const userProfile = SAMPLE_USER_PROFILES.find(p => p.user_id === userId) || SAMPLE_USER_PROFILES[0]
    
    // Generate personalized insights based on user profile
    const insights = generatePersonalizedInsights(userProfile, category, limit)
    
    const result: PersonalizedInsights = {
      user_profile: userProfile,
      generation_date: new Date().toISOString(),
      insights,
      daily_wisdom: generateDailyWisdom(userProfile),
      recommended_learning_path: generateLearningPath(userProfile),
      portfolio_health_check: userProfile.current_portfolio ? generatePortfolioHealthCheck(userProfile) : undefined,
      market_timing_advice: generateMarketTimingAdvice(userProfile)
    }
    
    // Cache the result
    insightsCache.set(cacheKey, { data: result, timestamp: Date.now() })
    
    return new Response(JSON.stringify(result), { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=900'
      } 
    })
    
  } catch (error: any) {
    console.error('Error in insights API:', error)
    return new Response(
      JSON.stringify({ 
        error: 'insights_generation_failed', 
        message: 'Failed to generate personalized insights' 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

function generatePersonalizedInsights(profile: UserProfile, category?: string | null, limit: number = 5): PersonalizedInsight[] {
  const allInsights: PersonalizedInsight[] = []
  
  // Market opportunity insights
  if (!category || category === 'market' || category === 'all') {
    if (profile.risk_tolerance === 'high' && profile.time_horizon === 'long') {
      allInsights.push({
        insight_id: "market_volatility_opportunity",
        title: "Turn Market Volatility Into Opportunity",
        category: "market_opportunity",
        priority: "high",
        buffett_principle: "Be fearful when others are greedy and greedy when others are fearful",
        personalized_message: `Given your ${profile.risk_tolerance} risk tolerance and ${profile.time_horizon}-term horizon, current market volatility presents opportunities for quality purchases.`,
        action_items: [
          "Build a watchlist of quality companies trading below intrinsic value",
          "Keep 10-20% cash for opportunistic purchases during market downturns",
          "Focus on businesses with predictable cash flows and strong competitive moats"
        ],
        supporting_quote: {
          text: "A climate of fear is your friend when investing; a euphoric world is your enemy",
          source: "Annual Letter to Shareholders",
          year: 2016,
          relevance_score: 95
        },
        estimated_reading_time: 3,
        related_concepts: ["Market psychology", "Contrarian investing", "Value opportunities"],
        next_steps: ["Review your current cash position", "Identify 3-5 quality companies for potential purchases"]
      })
    }
  }
  
  // Portfolio advice insights
  if (!category || category === 'portfolio' || category === 'all') {
    if (profile.current_portfolio) {
      const concentrationRisk = profile.current_portfolio.positions.some(p => p.weight > 20)
      if (concentrationRisk) {
        allInsights.push({
          insight_id: "concentration_risk_warning",
          title: "Review Portfolio Concentration Risk",
          category: "portfolio_advice",
          priority: "high",
          buffett_principle: "Diversification is protection against ignorance. It makes little sense if you know what you are doing",
          personalized_message: `Your portfolio shows high concentration in individual positions. While Buffett advocates concentration in quality businesses, ensure you truly understand these companies.`,
          action_items: [
            "Review your top 3 holdings - do you understand their business models thoroughly?",
            "Consider reducing positions above 15-20% of portfolio if knowledge is limited",
            "Focus concentration only on your highest-conviction, best-understood businesses"
          ],
          supporting_quote: {
            text: "Risk comes from not knowing what you're doing",
            source: "Annual Letter to Shareholders", 
            year: 1994,
            relevance_score: 90
          },
          estimated_reading_time: 4,
          related_concepts: ["Portfolio concentration", "Circle of competence", "Risk management"],
          next_steps: ["Assess knowledge level of concentrated positions", "Consider position sizing adjustments"]
        })
      }
    }
  }
  
  // Learning insights
  if (!category || category === 'learning' || category === 'all') {
    if (profile.experience_level === 'beginner' || profile.learning_goals.includes("Basic investment principles")) {
      allInsights.push({
        insight_id: "compound_interest_focus",
        title: "Harness the Power of Compound Interest",
        category: "learning_tip",
        priority: "high", 
        buffett_principle: "My wealth has come from a combination of living in America, some lucky genes, and compound interest",
        personalized_message: `As a ${profile.experience_level} investor with a ${profile.time_horizon}-term horizon, focusing on compound interest is crucial for building wealth.`,
        action_items: [
          "Calculate your expected compound annual growth rate (CAGR) targets",
          "Reinvest all dividends automatically to maximize compounding",
          "Avoid frequent trading that disrupts the compounding process",
          "Focus on quality businesses that can compound earnings over decades"
        ],
        supporting_quote: {
          text: "Someone's sitting in the shade today because someone planted a tree a long time ago",
          source: "Annual Letter to Shareholders",
          year: 2006,
          relevance_score: 100
        },
        estimated_reading_time: 5,
        related_concepts: ["Compound interest", "Long-term investing", "Reinvestment", "Time value of money"],
        next_steps: ["Set up automatic dividend reinvestment", "Calculate your investment time horizon"]
      })
    }
  }
  
  // Behavioral finance insights  
  if (!category || category === 'behavioral' || category === 'all') {
    allInsights.push({
      insight_id: "emotion_management",
      title: "Master Your Investment Emotions",
      category: "behavioral_finance",
      priority: "medium",
      buffett_principle: "Success in investing doesn't correlate with I.Q. once you're above the level of 25. Once you have ordinary intelligence, what you need is the temperament to control the urges that get other people into trouble",
      personalized_message: `Your ${profile.investment_style} style suggests you value stability, but emotional discipline remains critical for long-term success.`,
      action_items: [
        "Develop a written investment policy statement to guide decisions",
        "Create rules for when to buy, hold, and sell investments",
        "Practice dollar-cost averaging to reduce emotional timing decisions",
        "Keep an investment journal to track decision-making patterns"
      ],
      supporting_quote: {
        text: "The most important quality for an investor is temperament, not intellect",
        source: "University of Georgia Speech",
        year: 2001,
        relevance_score: 85
      },
      estimated_reading_time: 4,
      related_concepts: ["Investment temperament", "Emotional discipline", "Market psychology"],
      next_steps: ["Write your investment policy statement", "Set up systematic investment plan"]
    })
  }
  
  // Risk management insights
  if (!category || category === 'risk' || category === 'all') {
    if (profile.risk_tolerance === 'low' || profile.investment_style === 'conservative') {
      allInsights.push({
        insight_id: "margin_of_safety_focus",
        title: "Always Demand a Margin of Safety",
        category: "risk_management", 
        priority: "high",
        buffett_principle: "The three most important words in investing are margin of safety",
        personalized_message: `Your ${profile.investment_style} approach and ${profile.risk_tolerance} risk tolerance make margin of safety especially important for protecting capital.`,
        action_items: [
          "Only buy stocks trading at least 20-30% below intrinsic value",
          "Focus on businesses with predictable earnings and strong balance sheets",
          "Avoid speculative investments and IPOs",
          "Maintain adequate cash reserves for opportunities and emergencies"
        ],
        supporting_quote: {
          text: "It's far better to buy a wonderful company at a fair price than a fair company at a wonderful price",
          source: "Annual Letter to Shareholders",
          year: 1989,
          relevance_score: 95
        },
        estimated_reading_time: 3,
        related_concepts: ["Margin of safety", "Intrinsic value", "Risk assessment", "Quality businesses"],
        next_steps: ["Learn basic valuation methods", "Create a quality checklist for investments"]
      })
    }
  }
  
  return allInsights.slice(0, limit)
}

function generateDailyWisdom(profile: UserProfile) {
  const wisdomOptions = [
    {
      quote: "Rule No. 1: Never lose money. Rule No. 2: Never forget rule No. 1.",
      source: "Annual Letter to Shareholders, 1983",
      personal_application: `This principle is especially relevant for your ${profile.investment_style} approach - focus on preserving capital while seeking steady returns.`,
      reflection_prompt: "How can you apply this principle to your current investment decisions?"
    },
    {
      quote: "Time is the friend of the wonderful business, the enemy of the mediocre.",
      source: "Annual Letter to Shareholders, 1989", 
      personal_application: `With your ${profile.time_horizon}-term investment horizon, focus on identifying truly wonderful businesses that will benefit from time.`,
      reflection_prompt: "Which businesses in your portfolio or watchlist qualify as 'wonderful' and which might be merely 'mediocre'?"
    },
    {
      quote: "Our favorite holding period is forever.",
      source: "Annual Letter to Shareholders, 1988",
      personal_application: `This long-term mindset aligns well with your ${profile.time_horizon}-term investment timeline and can maximize the power of compounding.`,
      reflection_prompt: "Are you truly prepared to hold your investments 'forever'? What would make you sell?"
    }
  ]
  
  return wisdomOptions[Math.floor(Math.random() * wisdomOptions.length)]
}

function generateLearningPath(profile: UserProfile) {
  const learningPaths = {
    beginner: {
      current_focus: "Investment Fundamentals",
      next_modules: ["Understanding Financial Statements", "Circle of Competence", "Margin of Safety"],
      estimated_completion_time: 4
    },
    intermediate: {
      current_focus: "Business Analysis Skills",
      next_modules: ["Competitive Moats", "Management Quality Assessment", "Valuation Methods"],
      estimated_completion_time: 6
    },
    advanced: {
      current_focus: "Advanced Valuation & Strategy",
      next_modules: ["DCF Modeling", "Industry Analysis", "Capital Allocation Assessment"],
      estimated_completion_time: 8
    },
    expert: {
      current_focus: "Specialized Topics",
      next_modules: ["Behavioral Finance", "Macro Economic Analysis", "Special Situations"],
      estimated_completion_time: 10
    }
  }
  
  return learningPaths[profile.experience_level]
}

function generatePortfolioHealthCheck(profile: UserProfile) {
  if (!profile.current_portfolio) return undefined
  
  const { positions, cash_percentage } = profile.current_portfolio
  const maxWeight = Math.max(...positions.map(p => p.weight))
  const concentrationRisk = maxWeight > 25 ? 'high' : maxWeight > 15 ? 'moderate' : 'low'
  
  // Calculate Buffett alignment score based on portfolio characteristics
  let buffettScore = 50 // Base score
  
  // Adjust for concentration (Buffett likes concentrated portfolios in known businesses)
  if (concentrationRisk === 'moderate') buffettScore += 10
  if (concentrationRisk === 'low') buffettScore -= 5
  
  // Adjust for cash position
  if (cash_percentage >= 5 && cash_percentage <= 15) buffettScore += 10
  if (cash_percentage > 20) buffettScore -= 5
  
  // Adjust for quality stocks (simplified - based on common Buffett holdings)
  const qualityStocks = ['AAPL', 'BRK.B', 'KO', 'JPM', 'BAC', 'CVX', 'OXY']
  const qualityWeight = positions
    .filter(p => qualityStocks.includes(p.symbol))
    .reduce((sum, p) => sum + p.weight, 0)
  buffettScore += Math.min(qualityWeight * 0.5, 20) // Max 20 point bonus
  
  const suggestions = []
  if (concentrationRisk === 'high') {
    suggestions.push("Consider reducing positions above 20% unless you have deep knowledge of the business")
  }
  if (cash_percentage < 5) {
    suggestions.push("Maintain 5-10% cash for opportunities during market volatility")
  }
  if (qualityWeight < 50) {
    suggestions.push("Consider increasing allocation to quality businesses with strong competitive moats")
  }
  
  return {
    buffett_alignment_score: Math.min(100, Math.max(0, buffettScore)),
    concentration_risk: concentrationRisk,
    diversification_assessment: `Portfolio shows ${concentrationRisk} concentration risk with ${positions.length} positions`,
    suggested_improvements: suggestions
  }
}

function generateMarketTimingAdvice(profile: UserProfile) {
  return {
    current_market_phase: "Elevated valuations with selective opportunities",
    recommended_action: profile.experience_level === 'beginner' 
      ? "Focus on learning and dollar-cost averaging into quality businesses"
      : "Be patient and selective - wait for quality companies at reasonable prices",
    buffett_perspective: "Market timing is impossible to predict. Focus on buying wonderful businesses at fair prices and holding them for the long term."
  }
}