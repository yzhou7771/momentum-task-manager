'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { supabase, MoodEnergyLog } from '@/lib/supabase'
import { 
  Battery, 
  BatteryLow, 
  Zap, 
  Coffee,
  Brain,
  Heart,
  MessageCircle,
  AlertCircle,
  Smile,
  Frown
} from 'lucide-react'

type EnergyLevel = 'low' | 'medium' | 'high'
type MoodType = 'frustrated' | 'tired' | 'neutral' | 'focused' | 'energetic' | 'creative'

interface MoodEnergyCheckInProps {
  onLogSubmitted?: (log: MoodEnergyLog) => void
}

export function MoodEnergyCheckIn({ onLogSubmitted }: MoodEnergyCheckInProps) {
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null)
  const [mood, setMood] = useState<MoodType | null>(null)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const energyOptions = [
    { value: 'low' as EnergyLevel, label: 'Low Energy', icon: BatteryLow, color: 'text-red-500' },
    { value: 'medium' as EnergyLevel, label: 'Medium Energy', icon: Battery, color: 'text-yellow-500' },
    { value: 'high' as EnergyLevel, label: 'High Energy', icon: Zap, color: 'text-green-500' }
  ]

  const moodOptions = [
    { value: 'frustrated' as MoodType, label: 'Frustrated', icon: Frown, color: 'text-red-500' },
    { value: 'tired' as MoodType, label: 'Tired', icon: Coffee, color: 'text-gray-500' },
    { value: 'neutral' as MoodType, label: 'Neutral', icon: MessageCircle, color: 'text-gray-400' },
    { value: 'focused' as MoodType, label: 'Focused', icon: AlertCircle, color: 'text-blue-500' },
    { value: 'energetic' as MoodType, label: 'Energetic', icon: Zap, color: 'text-orange-500' },
    { value: 'creative' as MoodType, label: 'Creative', icon: Brain, color: 'text-purple-500' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!energyLevel || !mood) return

    setIsSubmitting(true)
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('mood_energy_logs')
        .insert({
          user_id: user.id,
          energy_level: energyLevel,
          mood: mood,
          notes: notes.trim() || null
        })
        .select()
        .single()

      if (error) throw error

      // Reset form
      setEnergyLevel(null)
      setMood(null)
      setNotes('')
      setShowForm(false)

      if (onLogSubmitted && data) {
        onLogSubmitted(data)
      }

      // Show success message
      console.log('Mood/energy logged successfully')
    } catch (error) {
      console.error('Failed to log mood/energy:', error)
      alert('Failed to log mood/energy. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!showForm) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
            <Heart className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            How are you feeling?
          </h3>
          <p className="text-gray-600 mb-4">
            Log your energy and mood to get better task recommendations
          </p>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Check In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Energy & Mood Check-in
        </h3>
        <Button
          onClick={() => setShowForm(false)}
          variant="ghost"
          size="sm"
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Energy Level Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Energy Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {energyOptions.map((option) => {
              const IconComponent = option.icon
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setEnergyLevel(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    energyLevel === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className={`w-6 h-6 mx-auto mb-2 ${option.color}`} />
                  <div className="text-sm font-medium text-gray-900">
                    {option.label}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Mood Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Current Mood
          </label>
          <div className="grid grid-cols-3 gap-3">
            {moodOptions.map((option) => {
              const IconComponent = option.icon
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    mood === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 mx-auto mb-2 ${option.color}`} />
                  <div className="text-xs font-medium text-gray-900">
                    {option.label}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything specific you'd like to note..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!energyLevel || !mood || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? 'Logging...' : 'Log Check-in'}
          </Button>
        </div>
      </form>
    </div>
  )
}