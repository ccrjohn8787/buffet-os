'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ThermometerSun, Activity, Target, DollarSign, Shield, Eye } from 'lucide-react'

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
  predictability: number
  regulatory_environment: 'supportive' | 'neutral' | 'challenging'
  long_term_outlook: string
}

interface MarketAnalysis {
  analysis_date: string
  market_temperature: 'ice_cold' | 'cold' | 'cool' | 'warm' | 'hot' | 'overheated'
  fear_greed_indicator: number
  opportunity_score: number
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
  insights?: {
    market_phase: string
    value_opportunities: string[]
    buffett_score: number
    key_themes: string[]
    next_review_date: string
  }
}

export default function MarketAnalysisPage() {
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [error, setError] = useState('')

  useEffect(() => {
    loadMarketAnalysis()
  }, [])

  const loadMarketAnalysis = async () => {
    try {
      const response = await fetch('/api/market-analysis')
      if (!response.ok) throw new Error('Failed to load market analysis')
      const data = await response.json()
      setAnalysis(data)
    } catch (err) {
      setError('Unable to load market analysis. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getTemperatureIcon = (temp: string) => {
    switch (temp) {
      case 'ice_cold': return '🧊'
      case 'cold': return '❄️'  
      case 'cool': return '🌤️'
      case 'warm': return '☀️'
      case 'hot': return '🔥'
      case 'overheated': return '🌡️'
      default: return '🌡️'
    }
  }

  const getTemperatureColor = (temp: string) => {
    switch (temp) {
      case 'ice_cold': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'cold': return 'text-blue-500 bg-blue-50 border-blue-100'
      case 'cool': return 'text-green-600 bg-green-50 border-green-200'
      case 'warm': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'hot': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'overheated': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getFavorabilityColor = (favorability: string) => {
    switch (favorability) {
      case 'very_favorable': return 'text-green-700 bg-green-100'
      case 'favorable': return 'text-green-600 bg-green-50'
      case 'neutral': return 'text-gray-600 bg-gray-50'
      case 'unfavorable': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getValuationColor = (valuation: string) => {
    switch (valuation) {
      case 'undervalued': return 'text-green-700'
      case 'fairly_valued': return 'text-blue-600'
      case 'overvalued': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getMoatStrength = (strength: string) => {
    const shields = {
      'weak': '🛡️',
      'moderate': '🛡️🛡️',
      'strong': '🛡️🛡️🛡️',
      'very_strong': '🛡️🛡️🛡️🛡️'
    }
    return shields[strength as keyof typeof shields] || '🛡️'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing market conditions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadMarketAnalysis}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Market Analysis</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time market insights through Warren Buffett's investment lens
          </p>
        </div>

        {/* Market Temperature & Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl mb-2">{getTemperatureIcon(analysis.market_temperature)}</div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getTemperatureColor(analysis.market_temperature)}`}>
              {analysis.market_temperature.replace('_', ' ').toUpperCase()}
            </div>
            <p className="text-xs text-gray-500 mt-2">Market Temperature</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-red-500 mb-2">{analysis.fear_greed_indicator}</div>
            <div className="text-sm text-gray-600">Fear & Greed Index</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  analysis.fear_greed_indicator > 75 ? 'bg-red-500' :
                  analysis.fear_greed_indicator > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${analysis.fear_greed_indicator}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{analysis.opportunity_score}</div>
            <div className="text-sm text-gray-600">Opportunity Score</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  analysis.opportunity_score > 70 ? 'bg-green-500' :
                  analysis.opportunity_score > 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${analysis.opportunity_score}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{analysis.insights?.buffett_score || 0}</div>
            <div className="text-sm text-gray-600">Buffett Score</div>
            <p className="text-xs text-gray-500 mt-1">Investment attractiveness</p>
          </div>
        </div>

        {/* Buffett Wisdom */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-semibold">Buffett's Market Wisdom</h3>
          </div>
          <blockquote className="text-lg italic text-gray-700 mb-4 pl-4 border-l-4 border-blue-500">
            "{analysis.buffett_market_wisdom.relevant_quote}"
          </blockquote>
          <div className="flex justify-between items-start text-sm">
            <span className="text-gray-500">{analysis.buffett_market_wisdom.source}</span>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Current Market Application</h4>
            <p className="text-blue-800">{analysis.buffett_market_wisdom.current_applicability}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="flex border-b">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'trends', label: 'Market Trends', icon: TrendingUp },
              { id: 'sectors', label: 'Sector Analysis', icon: Target },
              { id: 'risks', label: 'Risks & Opportunities', icon: Shield }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Market Phase */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Market Phase</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{analysis.insights?.market_phase}</p>
                </div>

                {/* Key Themes */}
                {analysis.insights?.key_themes && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Key Themes</h4>
                    <ul className="space-y-2">
                      {analysis.insights.key_themes.map((theme, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-blue-500 mt-1">•</span>
                          {theme}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Value Opportunities */}
                {analysis.insights?.value_opportunities && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Value Opportunities</h4>
                    <ul className="space-y-2">
                      {analysis.insights.value_opportunities.map((opportunity, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommended Actions */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Recommended Approach</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-800 mb-2">{analysis.recommended_actions.market_condition}</h5>
                    <p className="text-yellow-700 mb-3">{analysis.recommended_actions.suggested_approach}</p>
                    <p className="text-yellow-600 text-sm"><strong>Reasoning:</strong> {analysis.recommended_actions.reasoning}</p>
                    <p className="text-yellow-600 text-sm mt-2"><strong>Historical Parallel:</strong> {analysis.recommended_actions.historical_parallel}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Market Trends Tab */}
            {activeTab === 'trends' && (
              <div className="space-y-4">
                {analysis.market_trends.map((trend, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">{trend.metric}</h4>
                      <div className="flex items-center gap-2">
                        {trend.trend_direction === 'up' ? (
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        ) : trend.trend_direction === 'down' ? (
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        ) : (
                          <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
                        )}
                        <span className="font-bold text-xl text-gray-900">{trend.current_value}</span>
                        {trend.opportunity_indicator && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" title="Opportunity Indicator"></div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-1">Buffett's Perspective</h5>
                        <p className="text-blue-800 text-sm">{trend.buffett_perspective}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-1">Historical Context</h5>
                        <p className="text-gray-700 text-sm">{trend.historical_context}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sectors Tab */}
            {activeTab === 'sectors' && (
              <div className="grid gap-4">
                {analysis.sector_analysis.map((sector, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg">{sector.sector}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getFavorabilityColor(sector.buffett_favorability)}`}>
                          {sector.buffett_favorability.replace('_', ' ')}
                        </span>
                        <span className={`font-semibold ${getValuationColor(sector.current_valuation)}`}>
                          {sector.current_valuation.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium">Moat Strength</span>
                        </div>
                        <div className="text-lg">{getMoatStrength(sector.moat_strength)} {sector.moat_strength.replace('_', ' ')}</div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium">Predictability</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                              style={{ width: `${sector.predictability}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{sector.predictability}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium mb-2">Key Companies</h5>
                      <div className="flex flex-wrap gap-2">
                        {sector.key_companies.map(company => (
                          <span key={company} className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                            {company}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-1">Long-term Outlook</h5>
                      <p className="text-gray-700 text-sm">{sector.long_term_outlook}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Risks Tab */}
            {activeTab === 'risks' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Systemic Risks
                  </h4>
                  <ul className="space-y-2">
                    {analysis.risk_factors.systemic_risks.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-red-500 mt-1">⚠️</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Opportunities
                  </h4>
                  <ul className="space-y-2">
                    {analysis.risk_factors.opportunities.map((opportunity, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-green-500 mt-1">💡</span>
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-3 text-blue-900">Buffett's Approach</h4>
                  <p className="text-blue-800">{analysis.risk_factors.buffett_approach}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          Last updated: {new Date(analysis.analysis_date).toLocaleString()} • 
          Next review: {analysis.insights?.next_review_date ? new Date(analysis.insights.next_review_date).toLocaleDateString() : 'Tomorrow'}
        </div>
      </div>
    </div>
  )
}