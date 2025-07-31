'use client'

import React, { useState, useEffect } from 'react'
import { Task } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, Save, Loader2 } from 'lucide-react'

interface TaskEditModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (taskId: string, updates: Partial<Task>) => Promise<void>
}

export function TaskEditModal({ task, isOpen, onClose, onSave }: TaskEditModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 5,
    time_estimate: 30,
    tags: [] as string[],
    energy_type: 'administrative' as 'creative' | 'administrative' | 'physical' | 'social'
  })
  const [tagsInput, setTagsInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 5,
        time_estimate: task.time_estimate || 30,
        tags: task.tags || [],
        energy_type: task.energy_type || 'administrative'
      })
      setTagsInput(task.tags?.join(', ') || '')
      setErrors({})
    }
  }, [task])

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
    if (!task) return

    // Validate form
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters'
    }
    
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters'
    }
    
    if (formData.priority < 1 || formData.priority > 10 || isNaN(formData.priority)) {
      newErrors.priority = 'Priority must be a number between 1 and 10'
    }
    
    if (formData.time_estimate && (formData.time_estimate < 1 || formData.time_estimate > 480 || isNaN(formData.time_estimate))) {
      newErrors.time_estimate = 'Time estimate must be a number between 1 and 480 minutes'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      // Parse tags from input
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const updates = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        time_estimate: formData.time_estimate || undefined,
        tags: tags.length > 0 ? tags : undefined,
        energy_type: formData.energy_type
      }

      await onSave(task.id, updates)
      onClose()
    } catch (error) {
      console.error('Failed to update task:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update task. Please try again.'
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

  if (!isOpen || !task) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Task</h2>
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
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title"
              disabled={loading}
              maxLength={200}
              className={errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            />
            <div className="mt-1 text-xs text-gray-500 text-right">
              {formData.title.length}/200 characters
            </div>
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
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
              placeholder="Enter task description (optional)"
              rows={3}
              maxLength={1000}
              disabled={loading}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none ${
                errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            />
            <div className="mt-1 text-xs text-gray-500 text-right">
              {formData.description.length}/1000 characters
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Priority and Time Estimate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority (1-10)
              </label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 5)}
                disabled={loading}
                className={errors.priority ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
              )}
            </div>

            <div>
              <label htmlFor="time_estimate" className="block text-sm font-medium text-gray-700 mb-1">
                Time (minutes)
              </label>
              <Input
                id="time_estimate"
                type="number"
                min="1"
                max="480"
                value={formData.time_estimate || ''}
                onChange={(e) => handleInputChange('time_estimate', parseInt(e.target.value) || undefined)}
                placeholder="30"
                disabled={loading}
                className={errors.time_estimate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.time_estimate && (
                <p className="mt-1 text-sm text-red-600">{errors.time_estimate}</p>
              )}
            </div>
          </div>

          {/* Energy Type */}
          <div>
            <label htmlFor="energy_type" className="block text-sm font-medium text-gray-700 mb-1">
              Energy Type
            </label>
            <select
              id="energy_type"
              value={formData.energy_type}
              onChange={(e) => handleInputChange('energy_type', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="administrative">Administrative</option>
              <option value="creative">Creative</option>
              <option value="physical">Physical</option>
              <option value="social">Social</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Enter tags separated by commas (e.g., work, urgent, meeting)"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate multiple tags with commas
            </p>
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
              disabled={loading || !formData.title.trim()}
              className="flex-1"
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