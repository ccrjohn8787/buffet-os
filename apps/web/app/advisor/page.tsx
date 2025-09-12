'use client'

import { useState } from 'react'
import { Search, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Brain, BookOpen, Lightbulb } from 'lucide-react'

interface FrameworkAnalysis {
  circle_of_competence: { score: number; assessment: string }
  business_quality: {
    moat_strength: 'weak' | 'moderate' | 'strong' | 'very_strong'
    competitive_advantages: string[]
    industry_dynamics: string
  }
  management_quality: {
    capital_allocation_grade: 'A' | 'B' | 'C' | 'D' | 'F'
    leadership_assessment: string
    shareholder_alignment: string
  }
  financial_strength: {
    roe_assessment: string
    debt_management: string
    financial_stability: number
    key_metrics: { metric: string; value: string; assessment: string }[]
  }
  valuation: {
    margin_of_safety: number
    intrinsic_value_estimate: string
    current_price_assessment: string
    value_opportunity: boolean
  }
}

interface CompanyAnalysis {
  ticker: string
  company_name: string
  last_updated: string
  buffett_framework_score: number
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid' | 'strong_avoid'
  framework_analysis: FrameworkAnalysis
  ai_insights: {
    buffett_would_invest: boolean
    confidence_level: number
    investment_thesis: string
    key_risks: string[]
    historical_parallels: string[]
    timeline_outlook: string
  }
  supporting_quotes: {
    quote: string
    source: string
    relevance: string
  }[]
  personalized_advice?: {
    risk_profile_match: boolean
    portfolio_fit: string
    action_items: string[]
  }
}

export default function AIAdvisorPage() {
  const [ticker, setTicker] = useState('')
  const [analysis, setAnalysis] = useState<CompanyAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const analyzeCompany = async () => {
    if (!ticker.trim()) return

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/ai-advisor?ticker=${ticker.toUpperCase()}&user_profile=balanced&personalized=true`)
      
      if (!response.ok) {
        throw new Error('Failed to analyze company')
      }
      
      const data = await response.json()
      setAnalysis(data)
    } catch (err) {
      setError('Unable to analyze company. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_buy': return <TrendingUp className="w-6 h-6 text-green-600" />
      case 'buy': return <TrendingUp className="w-6 h-6 text-green-500" />
      case 'hold': return <Target className="w-6 h-6 text-yellow-500" />
      case 'avoid': return <TrendingDown className="w-6 h-6 text-red-500" />
      case 'strong_avoid': return <AlertTriangle className="w-6 h-6 text-red-600" />
      default: return null
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_buy': return 'bg-green-100 text-green-800 border-green-200'
      case 'buy': return 'bg-green-50 text-green-700 border-green-100'
      case 'hold': return 'bg-yellow-50 text-yellow-700 border-yellow-100'
      case 'avoid': return 'bg-red-50 text-red-700 border-red-100'
      case 'strong_avoid': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-100'
    }
  }

  const getMoatColor = (strength: string) => {
    switch (strength) {
      case 'very_strong': return 'text-green-600'
      case 'strong': return 'text-green-500'
      case 'moderate': return 'text-yellow-500'
      case 'weak': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600'
      case 'B': return 'text-green-500'
      case 'C': return 'text-yellow-500'
      case 'D': return 'text-red-500'
      case 'F': return 'text-red-600'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Investment Advisor</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get AI-powered investment analysis through Warren Buffett's proven framework. 
            Analyze companies like the Oracle of Omaha himself.
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex gap-4 max-w-md mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter ticker symbol (e.g. AAPL, KO)"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && analyzeCompany()}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={analyzeCompany}
              disabled={loading || !ticker.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Analyze
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="mt-4 text-center text-red-600">{error}</div>
          )}
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{analysis.company_name}</h2>
                  <p className="text-lg text-gray-600">{analysis.ticker}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {analysis.buffett_framework_score}/100
                  </div>
                  <p className="text-sm text-gray-500">Buffett Score</p>
                </div>
              </div>

              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getRecommendationColor(analysis.recommendation)}`}>
                {getRecommendationIcon(analysis.recommendation)}
                <span className="font-semibold capitalize">
                  {analysis.recommendation.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-semibold">AI Insights</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {analysis.ai_insights.buffett_would_invest ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {analysis.ai_insights.buffett_would_invest 
                        ? 'Buffett would likely invest' 
                        : 'Buffett would likely avoid'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({analysis.ai_insights.confidence_level}% confidence)
                  </span>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Investment Thesis</h4>
                  <p className="text-gray-700">{analysis.ai_insights.investment_thesis}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Key Risks</h4>
                  <ul className="space-y-1">
                    {analysis.ai_insights.key_risks.map((risk, index) => (
                      <li key={index} className="text-gray-700 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Historical Parallels</h4>
                  <ul className="space-y-1">
                    {analysis.ai_insights.historical_parallels.map((parallel, index) => (
                      <li key={index} className="text-gray-700 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {parallel}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Framework Analysis */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-semibold">Buffett Framework Analysis</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Circle of Competence */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Circle of Competence</h4>
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {analysis.framework_analysis.circle_of_competence.score}/100
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    {analysis.framework_analysis.circle_of_competence.assessment}
                  </p>
                </div>

                {/* Business Quality */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Business Quality</h4>
                  <div className="mb-2">
                    <span className={`text-lg font-semibold capitalize ${getMoatColor(analysis.framework_analysis.business_quality.moat_strength)}`}>
                      {analysis.framework_analysis.business_quality.moat_strength.replace('_', ' ')} Moat
                    </span>
                  </div>
                  <div className="space-y-1">
                    {analysis.framework_analysis.business_quality.competitive_advantages.map((advantage, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {advantage}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Management Quality */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Management Quality</h4>
                  <div className="mb-2">
                    <span className={`text-2xl font-bold ${getGradeColor(analysis.framework_analysis.management_quality.capital_allocation_grade)}`}>
                      {analysis.framework_analysis.management_quality.capital_allocation_grade}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">Capital Allocation</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    {analysis.framework_analysis.management_quality.leadership_assessment}
                  </p>
                </div>

                {/* Financial Strength */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Financial Strength</h4>
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {analysis.framework_analysis.financial_strength.financial_stability}/100
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">
                    {analysis.framework_analysis.financial_strength.roe_assessment}
                  </p>
                  <div className="space-y-1">
                    {analysis.framework_analysis.financial_strength.key_metrics.map((metric, index) => (
                      <div key={index} className="text-xs text-gray-600 flex justify-between">
                        <span>{metric.metric}</span>
                        <span className="font-medium">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Valuation */}
              <div className="mt-6 border rounded-lg p-4">
                <h4 className="font-medium mb-2">Valuation Analysis</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Margin of Safety</span>
                    <div className={`text-lg font-semibold ${analysis.framework_analysis.valuation.margin_of_safety > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analysis.framework_analysis.valuation.margin_of_safety > 0 ? '+' : ''}
                      {analysis.framework_analysis.valuation.margin_of_safety}%
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Intrinsic Value</span>
                    <div className="text-lg font-semibold text-gray-900">
                      {analysis.framework_analysis.valuation.intrinsic_value_estimate}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Value Opportunity</span>
                    <div className={`text-lg font-semibold ${analysis.framework_analysis.valuation.value_opportunity ? 'text-green-600' : 'text-red-600'}`}>
                      {analysis.framework_analysis.valuation.value_opportunity ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm mt-2">
                  {analysis.framework_analysis.valuation.current_price_assessment}
                </p>
              </div>
            </div>

            {/* Personalized Advice */}
            {analysis.personalized_advice && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-6 h-6 text-purple-500" />
                  <h3 className="text-xl font-semibold">Personalized Advice</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {analysis.personalized_advice.risk_profile_match ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    )}
                    <span>
                      {analysis.personalized_advice.risk_profile_match 
                        ? 'Matches your risk profile' 
                        : 'Consider your risk tolerance'}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Portfolio Fit</h4>
                    <p className="text-gray-700">{analysis.personalized_advice.portfolio_fit}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Action Items</h4>
                    <ul className="space-y-1">
                      {analysis.personalized_advice.action_items.map((item, index) => (
                        <li key={index} className="text-gray-700 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Supporting Quotes */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6 text-green-500" />
                <h3 className="text-xl font-semibold">Buffett's Wisdom</h3>
              </div>
              
              <div className="space-y-4">
                {analysis.supporting_quotes.map((quote, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <blockquote className="text-gray-700 italic mb-2">
                      "{quote.quote}"
                    </blockquote>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{quote.source}</span>
                      <span className="font-medium">{quote.relevance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}