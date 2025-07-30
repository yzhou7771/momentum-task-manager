'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { 
  Heart,
  Activity,
  Moon,
  Footprints,
  Smartphone,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react'

interface HealthData {
  steps?: number
  sleep_hours?: number
  heart_rate?: number
  logged_at: string
}

export function HealthIntegration() {
  const [healthData, setHealthData] = useState<HealthData[]>([])
  const [loading, setLoading] = useState(false)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualData, setManualData] = useState({
    steps: '',
    sleep_hours: '',
    heart_rate: ''
  })

  useEffect(() => {
    fetchHealthData()
  }, [])

  const fetchHealthData = async () => {
    try {
      // For now, we'll store health data in user preferences
      // In a real implementation, this would integrate with health APIs
      const { data, error } = await supabase
        .from('user_profiles')
        .select('productivity_stats')
        .single()

      if (error) throw error

      const healthLogs = data?.productivity_stats?.health_data || []
      setHealthData(healthLogs)
    } catch (error) {
      console.error('Failed to fetch health data:', error)
    }
  }

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newHealthEntry: HealthData = {
        ...(manualData.steps && { steps: parseInt(manualData.steps) }),
        ...(manualData.sleep_hours && { sleep_hours: parseFloat(manualData.sleep_hours) }),
        ...(manualData.heart_rate && { heart_rate: parseInt(manualData.heart_rate) }),
        logged_at: new Date().toISOString()
      }

      // Get current user profile
      const { data: profile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('productivity_stats')
        .single()

      if (fetchError) throw fetchError

      const currentStats = profile?.productivity_stats || {}
      const healthData = currentStats.health_data || []
      
      const updatedHealthData = [...healthData, newHealthEntry]

      // Update user profile with new health data
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          productivity_stats: {
            ...currentStats,
            health_data: updatedHealthData
          }
        })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)

      if (updateError) throw updateError

      setHealthData(updatedHealthData)
      setManualData({ steps: '', sleep_hours: '', heart_rate: '' })
      setShowManualEntry(false)
    } catch (error) {
      console.error('Failed to save health data:', error)
      alert('Failed to save health data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getHealthInsights = () => {
    if (healthData.length === 0) return []

    const insights = []
    const recent = healthData.slice(-7) // Last 7 entries

    // Sleep insights
    const avgSleep = recent
      .filter(d => d.sleep_hours)
      .reduce((acc, d) => acc + (d.sleep_hours || 0), 0) / recent.filter(d => d.sleep_hours).length

    if (avgSleep && avgSleep < 7) {
      insights.push('Your average sleep is below 7 hours. Consider going to bed earlier for better energy levels.')
    } else if (avgSleep && avgSleep >= 8) {
      insights.push('Great sleep habits! Your 8+ hours of sleep likely contributes to better productivity.')
    }

    // Steps insights
    const avgSteps = recent
      .filter(d => d.steps)
      .reduce((acc, d) => acc + (d.steps || 0), 0) / recent.filter(d => d.steps).length

    if (avgSteps && avgSteps < 5000) {
      insights.push('Consider adding more physical movement to your day. A short walk can boost energy and focus.')
    } else if (avgSteps && avgSteps >= 10000) {
      insights.push('Excellent activity level! Your daily movement likely helps maintain high energy throughout the day.')
    }

    return insights
  }

  const insights = getHealthInsights()

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">Health Integration</h3>
        </div>
        <Button
          onClick={() => setShowManualEntry(true)}
          size="sm"
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Add Data
        </Button>
      </div>

      {/* Integration Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <Smartphone className="w-6 h-6 text-blue-500" />
            <div>
              <h4 className="font-medium text-gray-900">Apple Health</h4>
              <p className="text-sm text-gray-600">Connect your iPhone health data</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <AlertCircle className="w-4 h-4" />
            <span>Requires iOS app for full integration</span>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <Activity className="w-6 h-6 text-green-500" />
            <div>
              <h4 className="font-medium text-gray-900">Google Fit</h4>
              <p className="text-sm text-gray-600">Connect your Android health data</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <AlertCircle className="w-4 h-4" />
            <span>Web API integration coming soon</span>
          </div>
        </div>
      </div>

      {/* Manual Entry Form */}
      {showManualEntry && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-4">Manual Health Data Entry</h4>
          <form onSubmit={handleManualEntry} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Steps
                </label>
                <input
                  type="number"
                  value={manualData.steps}
                  onChange={(e) => setManualData(prev => ({ ...prev, steps: e.target.value }))}
                  placeholder="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sleep (hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={manualData.sleep_hours}
                  onChange={(e) => setManualData(prev => ({ ...prev, sleep_hours: e.target.value }))}
                  placeholder="7.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resting Heart Rate
                </label>
                <input
                  type="number"
                  value={manualData.heart_rate}
                  onChange={(e) => setManualData(prev => ({ ...prev, heart_rate: e.target.value }))}
                  placeholder="65"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                type="submit"
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Health Data'
                )}
              </Button>
              <Button
                type="button"
                onClick={() => setShowManualEntry(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Health Data */}
      {healthData.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Recent Health Data</h4>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {healthData.slice(-5).reverse().map((data, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  {data.steps && (
                    <div className="flex items-center space-x-2">
                      <Footprints className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700">{data.steps.toLocaleString()} steps</span>
                    </div>
                  )}
                  {data.sleep_hours && (
                    <div className="flex items-center space-x-2">
                      <Moon className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700">{data.sleep_hours}h sleep</span>
                    </div>
                  )}
                  {data.heart_rate && (
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-700">{data.heart_rate} bpm</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(data.logged_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Insights */}
      {insights.length > 0 && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-900 mb-2">Health Insights</h4>
              <div className="space-y-1">
                {insights.map((insight, index) => (
                  <p key={index} className="text-sm text-green-700">• {insight}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {healthData.length === 0 && (
        <div className="text-center py-8">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No health data yet</p>
          <p className="text-sm text-gray-400 mb-4">
            Add your health data manually or connect a health app to get personalized insights
          </p>
          <Button
            onClick={() => setShowManualEntry(true)}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Add Your First Entry
          </Button>
        </div>
      )}

      {/* Integration Coming Soon */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Full Health Integration Coming Soon
            </h4>
            <p className="text-sm text-blue-700">
              We're working on direct integrations with Apple Health, Google Fit, and other popular health platforms. 
              For now, you can manually enter your key health metrics to get personalized productivity insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}