'use client'

import { useState, useEffect } from 'react'
import { User, BookOpen, TrendingUp, AlertTriangle, CheckCircle, Clock, Lightbulb, Target, Shield, Heart } from 'lucide-react'

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
  user_profile: {
    user_id: string
    investment_style: string
    experience_level: string
    risk_tolerance: string
    time_horizon: string
    preferred_sectors: string[]
    current_portfolio?: {
      total_value: number
      positions: { symbol: string; weight: number }[]
      cash_percentage: number
    }
    learning_goals: string[]
  }
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

export default function PersonalizedInsightsPage() {
  const [insights, setInsights] = useState<PersonalizedInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [error, setError] = useState('')

  useEffect(() => {
    loadPersonalizedInsights()
  }, [])

  const loadPersonalizedInsights = async () => {
    try {
      const response = await fetch('/api/insights?user_id=demo_user_1')
      if (!response.ok) throw new Error('Failed to load insights')
      const data = await response.json()
      setInsights(data)
    } catch (err) {
      setError('Unable to load personalized insights. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'market_opportunity': return TrendingUp
      case 'portfolio_advice': return Target  
      case 'learning_tip': return BookOpen
      case 'behavioral_finance': return Heart
      case 'risk_management': return Shield
      default: return Lightbulb
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'market_opportunity': return 'text-green-600 bg-green-50 border-green-200'
      case 'portfolio_advice': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'learning_tip': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'behavioral_finance': return 'text-pink-600 bg-pink-50 border-pink-200'
      case 'risk_management': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-100'
      case 'medium': return 'text-yellow-700 bg-yellow-100'
      case 'low': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600'
      case 'moderate': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your personalized insights...</p>
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
            onClick={loadPersonalizedInsights}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!insights) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Personal Buffett Insights</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tailored investment guidance based on Warren Buffett's principles and your unique profile
          </p>
        </div>

        {/* User Profile Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-semibold">Your Investment Profile</h3>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-gray-500">Style</span>
              <div className="font-semibold capitalize">{insights.user_profile.investment_style}</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Experience</span>
              <div className="font-semibold capitalize">{insights.user_profile.experience_level}</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Risk Tolerance</span>
              <div className="font-semibold capitalize">{insights.user_profile.risk_tolerance}</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Time Horizon</span>
              <div className="font-semibold capitalize">{insights.user_profile.time_horizon}-term</div>
            </div>
          </div>
        </div>

        {/* Daily Wisdom */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-semibold">Today's Wisdom for You</h3>
          </div>
          <blockquote className="text-lg italic text-gray-700 mb-4">
            "{insights.daily_wisdom.quote}"
          </blockquote>
          <div className="text-sm text-gray-500 mb-4">— {insights.daily_wisdom.source}</div>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Personal Application</h4>
            <p className="text-gray-700">{insights.daily_wisdom.personal_application}</p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Reflection Prompt</h4>
            <p className="text-gray-700">{insights.daily_wisdom.reflection_prompt}</p>
          </div>
        </div>

        {/* Portfolio Health Check */}
        {insights.portfolio_health_check && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-semibold">Portfolio Health Check</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {insights.portfolio_health_check.buffett_alignment_score}/100
                </div>
                <p className="text-sm text-gray-600">Buffett Alignment Score</p>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold capitalize mb-2 ${getRiskColor(insights.portfolio_health_check.concentration_risk)}`}>
                  {insights.portfolio_health_check.concentration_risk}
                </div>
                <p className="text-sm text-gray-600">Concentration Risk</p>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-700 mb-2">
                  {insights.user_profile.current_portfolio?.positions.length || 0} positions
                </div>
                <p className="text-sm text-gray-600">Portfolio Size</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-3">Suggested Improvements</h4>
              <ul className="space-y-1">
                {insights.portfolio_health_check.suggested_improvements.map((suggestion, index) => (
                  <li key={index} className="text-yellow-700 flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="flex border-b overflow-x-auto">
            {[
              { id: 'overview', label: 'All Insights', icon: Lightbulb },
              { id: 'learning', label: 'Learning Path', icon: BookOpen },
              { id: 'market', label: 'Market Advice', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
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
            {/* All Insights Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {insights.insights.map((insight, index) => {
                  const IconComponent = getCategoryIcon(insight.category)
                  return (
                    <div key={insight.insight_id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg border ${getCategoryColor(insight.category)}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold">{insight.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                                {insight.priority} priority
                              </span>
                              <span className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                {insight.estimated_reading_time} min read
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="font-medium text-blue-900 mb-2">Buffett Principle</h5>
                        <p className="text-blue-800 italic">"{insight.buffett_principle}"</p>
                      </div>

                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">Personal Message</h5>
                        <p className="text-gray-700">{insight.personalized_message}</p>
                      </div>

                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">Action Items</h5>
                        <ul className="space-y-1">
                          {insight.action_items.map((item, itemIndex) => (
                            <li key={itemIndex} className="text-gray-700 flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">Supporting Quote</h5>
                        <blockquote className="text-gray-700 italic mb-2">
                          "{insight.supporting_quote.text}"
                        </blockquote>
                        <div className="text-sm text-gray-500">
                          {insight.supporting_quote.source} ({insight.supporting_quote.year})
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {insight.related_concepts.map((concept, conceptIndex) => (
                          <span key={conceptIndex} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Learning Path Tab */}
            {activeTab === 'learning' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                  <h4 className="text-xl font-semibold mb-4">Your Recommended Learning Path</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Current Focus</h5>
                      <p className="text-lg text-purple-700 font-semibold">
                        {insights.recommended_learning_path.current_focus}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Estimated Time</h5>
                      <p className="text-lg text-blue-700 font-semibold">
                        {insights.recommended_learning_path.estimated_completion_time} weeks
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-4">Next Modules to Complete</h5>
                  <div className="space-y-3">
                    {insights.recommended_learning_path.next_modules.map((module, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <span className="text-gray-700 font-medium">{module}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Your Learning Goals</h5>
                  <div className="flex flex-wrap gap-2">
                    {insights.user_profile.learning_goals.map((goal, index) => (
                      <span key={index} className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Market Advice Tab */}
            {activeTab === 'market' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-xl font-semibold text-blue-900 mb-4">Current Market Advice</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-blue-800 mb-2">Market Phase</h5>
                      <p className="text-blue-700">{insights.market_timing_advice.current_market_phase}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-blue-800 mb-2">Recommended Action</h5>
                      <p className="text-blue-700">{insights.market_timing_advice.recommended_action}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-blue-800 mb-2">Buffett's Perspective</h5>
                      <p className="text-blue-700 italic">{insights.market_timing_advice.buffett_perspective}</p>
                    </div>
                  </div>
                </div>

                {insights.user_profile.preferred_sectors && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Your Preferred Sectors</h5>
                    <div className="flex flex-wrap gap-3">
                      {insights.user_profile.preferred_sectors.map((sector, index) => (
                        <span key={index} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">
                          {sector}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          Insights generated on {new Date(insights.generation_date).toLocaleString()} • 
          Personalized for your {insights.user_profile.investment_style} investment style
        </div>
      </div>
    </div>
  )
}