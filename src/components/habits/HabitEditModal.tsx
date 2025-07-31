'use client'

import React, { useState, useEffect } from 'react'
import { Habit } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, Save, Loader2 } from 'lucide-react'

interface HabitEditModalProps {
  habit: Habit | null
  isOpen: boolean
  onClose: () => void
  onSave: (habitId: string, updates: Partial<Habit>) => Promise<void>
}

export function HabitEditModal({ habit, isOpen, onClose, onSave }: HabitEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_frequency: 1
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data when habit changes
  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || '',
        description: habit.description || '',
        target_frequency: habit.target_frequency || 1
      })
      setErrors({})
    }
  }, [habit])

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, loading, onClose])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!habit) return

    // Validate form
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Habit name is required'
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Habit name must be less than 100 characters'
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }
    
    if (formData.target_frequency < 1 || formData.target_frequency > 10 || isNaN(formData.target_frequency)) {
      newErrors.target_frequency = 'Target frequency must be a number between 1 and 10'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const updates = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        target_frequency: formData.target_frequency
      }

      await onSave(habit.id, updates)
      onClose()
    } catch (error) {
      console.error('Failed to update habit:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update habit. Please try again.'
      setErrors({ general: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen || !habit) return null

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-emerald-50/80 via-green-50/80 to-teal-50/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Habit</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Habit Name *
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Drink 8 glasses of water"
              disabled={loading}
              maxLength={100}
              className={errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            />
            <div className="mt-1 text-xs text-gray-500 text-right">
              {formData.name.length}/100 characters
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional details (optional)"
              rows={3}
              maxLength={500}
              disabled={loading}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none ${
                errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            />
            <div className="mt-1 text-xs text-gray-500 text-right">
              {formData.description.length}/500 characters
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Target Frequency */}
          <div>
            <label htmlFor="target_frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Target frequency per day
            </label>
            <select
              id="target_frequency"
              value={formData.target_frequency}
              onChange={(e) => handleInputChange('target_frequency', parseInt(e.target.value))}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>
                  {num} time{num > 1 ? 's' : ''} per day
                </option>
              ))}
            </select>
            {errors.target_frequency && (
              <p className="mt-1 text-sm text-red-600">{errors.target_frequency}</p>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}