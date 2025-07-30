'use client'

import React, { useState, useEffect } from 'react'
import { Task } from '@/lib/supabase'
import { 
  getEnergyAwareRecommendations, 
  getCurrentEnergyProfile, 
  TaskRecommendation 
} from '@/lib/energy-recommendations'
import { 
  Lightbulb,
  Zap,
  Brain,
  Coffee,
  Users,
  FileText,
  RefreshCw,
  TrendingUp
} from 'lucide-react'

interface SmartRecommendationsProps {
  tasks: Task[]
  onTaskSelect?: (task: Task) => void
}

export function SmartRecommendations({ tasks, onTaskSelect }: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [hasEnergyData, setHasEnergyData] = useState(false)

  useEffect(() => {
    generateRecommendations()
  }, [tasks])

  const generateRecommendations = async () => {
    setLoading(true)
    try {
      const energyProfile = await getCurrentEnergyProfile()
      setHasEnergyData(!!energyProfile)
      
      const recs = await getEnergyAwareRecommendations(tasks, energyProfile || undefined)
      setRecommendations(recs.slice(0, 5)) // Top 5 recommendations
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
      // Fallback to simple priority-based recommendations
      const fallbackRecs = tasks
        .filter(task => task.status === 'inbox')
        .map(task => ({
          task,
          score: task.priority * 10,
          reason: `Priority ${task.priority}/10`,
          energyMatch: false
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
      
      setRecommendations(fallbackRecs)
    } finally {
      setLoading(false)
    }
  }

  const getEnergyIcon = (energyType?: string) => {
    switch (energyType) {
      case 'creative': return Brain
      case 'administrative': return FileText
      case 'physical': return Zap
      case 'social': return Users
      default: return FileText
    }
  }

  const getEnergyColor = (energyType?: string) => {
    switch (energyType) {
      case 'creative': return 'text-purple-600'
      case 'administrative': return 'text-blue-600'
      case 'physical': return 'text-green-600'
      case 'social': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-red-600'
    if (priority >= 6) return 'text-orange-600'
    if (priority >= 4) return 'text-yellow-600'
    return 'text-green-600'
  }

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

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No recommendations available</p>
          <p className="text-sm text-gray-400 mt-1">
            Add some tasks to your inbox to get smart recommendations
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Smart Recommendations
          </h3>
        </div>
        <button
          onClick={generateRecommendations}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh recommendations"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const EnergyIcon = getEnergyIcon(rec.task.energy_type)
          const isTopRecommendation = index === 0 && rec.energyMatch

          return (
            <div
              key={rec.task.id}
              className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                isTopRecommendation 
                  ? 'border-yellow-200 bg-yellow-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onTaskSelect?.(rec.task)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {isTopRecommendation && (
                      <TrendingUp className="w-4 h-4 text-yellow-600" />
                    )}
                    <span className="text-xs font-medium text-gray-500">
                      #{index + 1} RECOMMENDED
                    </span>
                    {rec.energyMatch && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Energy Match
                      </span>
                    )}
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1">
                    {rec.task.title}
                  </h4>
                  
                  {rec.task.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {rec.task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <EnergyIcon className={`w-4 h-4 ${getEnergyColor(rec.task.energy_type)}`} />
                      <span className="capitalize">{rec.task.energy_type || 'general'}</span>
                    </div>
                    
                    <div className={`font-medium ${getPriorityColor(rec.task.priority)}`}>
                      Priority {rec.task.priority}/10
                    </div>
                    
                    {rec.task.time_estimate && (
                      <div className="flex items-center space-x-1">
                        <Coffee className="w-4 h-4" />
                        <span>{rec.task.time_estimate}m</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-600 italic">
                    {rec.reason}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {Math.round(rec.score)}
                  </div>
                  <div className="text-xs text-gray-500">score</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {!hasEnergyData && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Get Better Recommendations
              </h4>
              <p className="text-sm text-blue-700">
                Log your energy and mood to receive personalized task recommendations 
                that match your current state and optimize your productivity.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}