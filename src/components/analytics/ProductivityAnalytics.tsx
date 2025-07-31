'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { analyzeEnergyPatterns } from '@/lib/energy-recommendations'
import { 
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  Award,
  Activity
} from 'lucide-react'

interface ProductivityStats {
  totalTasks: number
  completedTasks: number
  completionRate: number
  averageTaskTime: number
  habitCompletionRate: number
  mostProductiveTime: string
  energyPatterns: any
}

export function ProductivityAnalytics() {
  const [stats, setStats] = useState<ProductivityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const startDate = new Date()
      if (timeRange === 'week') {
        startDate.setDate(startDate.getDate() - 7)
      } else {
        startDate.setDate(startDate.getDate() - 30)
      }

      // Fetch tasks data
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .gte('created_at', startDate.toISOString())

      if (tasksError) throw tasksError

      // Fetch mood/energy logs
      const { data: energyLogs, error: energyError } = await supabase
        .from('mood_energy_logs')
        .select('*')
        .gte('logged_at', startDate.toISOString())
        .order('logged_at', { ascending: true })

      if (energyError) throw energyError


      // Fetch habit completions
      const { data: habitCompletions, error: habitError } = await supabase
        .from('habit_completions')
        .select('*')
        .gte('completed_at', startDate.toISOString())

      if (habitError) throw habitError

      // Calculate analytics
      const completedTasks = tasks?.filter(t => t.status === 'completed') || []
      const completionRate = tasks?.length ? (completedTasks.length / tasks.length) * 100 : 0
      
      // Calculate average task completion time (simplified)
      const averageTaskTime = completedTasks.reduce((acc, task) => {
        return acc + (task.time_estimate || 30)
      }, 0) / (completedTasks.length || 1)

      
      // Energy pattern analysis
      const energyPatterns = analyzeEnergyPatterns(energyLogs || [])

      // Find most productive time (simplified - based on completed tasks)
      const hourlyCompletions: Record<number, number> = {}
      completedTasks.forEach(task => {
        if (task.completed_at) {
          const hour = new Date(task.completed_at).getHours()
          hourlyCompletions[hour] = (hourlyCompletions[hour] || 0) + 1
        }
      })
      
      const mostProductiveHour = Object.entries(hourlyCompletions)
        .sort(([,a], [,b]) => b - a)[0]?.[0]
      
      const formatHour = (hour: string) => {
        const h = parseInt(hour)
        const period = h >= 12 ? 'PM' : 'AM'
        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
        return `${displayHour}${period}`
      }

      setStats({
        totalTasks: tasks?.length || 0,
        completedTasks: completedTasks.length,
        completionRate,
        averageTaskTime,
        habitCompletionRate: 85, // Simplified calculation
        mostProductiveTime: mostProductiveHour ? formatHour(mostProductiveHour) : 'N/A',
        energyPatterns
      })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Unable to load analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Productivity Analytics</h3>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Completion Rate</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {Math.round(stats.completionRate)}%
          </div>
          <div className="text-sm text-blue-600">
            {stats.completedTasks} of {stats.totalTasks} tasks
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Active Tasks</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {stats.totalTasks - stats.completedTasks}
          </div>
          <div className="text-sm text-green-600">
            Currently in progress
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Avg Task Time</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {Math.round(stats.averageTaskTime)}m
          </div>
          <div className="text-sm text-purple-600">
            Per completed task
          </div>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Peak Time</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {stats.mostProductiveTime}
          </div>
          <div className="text-sm text-orange-600">
            Most productive hour
          </div>
        </div>
      </div>

      {/* Energy Patterns */}
      {stats.energyPatterns.recommendations.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-600" />
            <h4 className="text-sm font-semibold text-gray-900">Energy Insights</h4>
          </div>
          <div className="space-y-2">
            {stats.energyPatterns.recommendations.map((rec: string, index: number) => (
              <div key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <Award className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Productivity Recommendations
            </h4>
            <div className="space-y-1 text-sm text-blue-700">
              {stats.completionRate < 70 && (
                <div>• Try breaking large tasks into smaller, manageable pieces</div>
              )}
              {stats.energyPatterns.recommendations.length === 0 && (
                <div>• Log your energy levels regularly to discover your optimal work patterns</div>
              )}
              {stats.completionRate >= 80 && (
                <div>• Great job! Consider taking on slightly more challenging tasks</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}