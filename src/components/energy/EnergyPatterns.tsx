'use client'

import React, { useState, useEffect } from 'react'
import { supabase, MoodEnergyLog } from '@/lib/supabase'
import { 
  Battery, 
  BatteryLow, 
  Zap, 
  Coffee,
  Brain,
  MessageCircle,
  AlertCircle,
  Frown,
  TrendingUp,
  Calendar
} from 'lucide-react'

export function EnergyPatterns() {
  const [logs, setLogs] = useState<MoodEnergyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week')

  useEffect(() => {
    fetchLogs()
  }, [timeRange])

  const fetchLogs = async () => {
    try {
      const startDate = new Date()
      if (timeRange === 'week') {
        startDate.setDate(startDate.getDate() - 7)
      } else {
        startDate.setDate(startDate.getDate() - 30)
      }

      const { data, error } = await supabase
        .from('mood_energy_logs')
        .select('*')
        .gte('logged_at', startDate.toISOString())
        .order('logged_at', { ascending: false })

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error('Failed to fetch energy patterns:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEnergyIcon = (level: string) => {
    switch (level) {
      case 'low': return BatteryLow
      case 'medium': return Battery
      case 'high': return Zap
      default: return Battery
    }
  }

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'frustrated': return Frown
      case 'tired': return Coffee
      case 'neutral': return MessageCircle
      case 'focused': return AlertCircle
      case 'energetic': return Zap
      case 'creative': return Brain
      default: return MessageCircle
    }
  }

  const getEnergyColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'high': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'frustrated': return 'text-red-500'
      case 'tired': return 'text-gray-500'
      case 'neutral': return 'text-gray-400'
      case 'focused': return 'text-blue-500'
      case 'energetic': return 'text-orange-500'
      case 'creative': return 'text-purple-500'
      default: return 'text-gray-500'
    }
  }

  const calculateStats = () => {
    if (logs.length === 0) return null

    const energyStats = logs.reduce((acc, log) => {
      acc[log.energy_level] = (acc[log.energy_level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const moodStats = logs.reduce((acc, log) => {
      acc[log.mood] = (acc[log.mood] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostCommonEnergy = Object.entries(energyStats).sort(([,a], [,b]) => b - a)[0]
    const mostCommonMood = Object.entries(moodStats).sort(([,a], [,b]) => b - a)[0]

    return {
      totalLogs: logs.length,
      averageLogsPerDay: (logs.length / (timeRange === 'week' ? 7 : 30)).toFixed(1),
      mostCommonEnergy: mostCommonEnergy ? mostCommonEnergy[0] : 'unknown',
      mostCommonMood: mostCommonMood ? mostCommonMood[0] : 'unknown'
    }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Energy Patterns</h3>
        </div>
        <div className="flex rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeRange === 'week'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeRange === 'month'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No energy logs yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Start logging your energy and mood to see patterns
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{stats.totalLogs}</div>
                <div className="text-sm text-gray-600">Check-ins</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{stats.averageLogsPerDay}</div>
                <div className="text-sm text-gray-600">Per day</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900 capitalize">{stats.mostCommonEnergy}</div>
                <div className="text-sm text-gray-600">Common energy</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900 capitalize">{stats.mostCommonMood}</div>
                <div className="text-sm text-gray-600">Common mood</div>
              </div>
            </div>
          )}

          {/* Recent Logs */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Check-ins</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {logs.slice(0, 10).map((log) => {
                const EnergyIcon = getEnergyIcon(log.energy_level)
                const MoodIcon = getMoodIcon(log.mood)
                const logDate = new Date(log.logged_at)
                
                return (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <EnergyIcon className={`w-4 h-4 ${getEnergyColor(log.energy_level)}`} />
                        <MoodIcon className={`w-4 h-4 ${getMoodColor(log.mood)}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {log.energy_level} energy, {log.mood}
                        </div>
                        {log.notes && (
                          <div className="text-xs text-gray-600 mt-1">{log.notes}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {logDate.toLocaleDateString()} {logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}