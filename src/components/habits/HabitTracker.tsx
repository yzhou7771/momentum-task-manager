'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { supabase, Habit, HabitCompletion } from '@/lib/supabase'
import { HabitEditModal } from './HabitEditModal'
import { 
  Plus,
  CheckCircle2,
  Circle,
  Target,
  Trash2,
  Edit3,
  Calendar,
  TrendingUp
} from 'lucide-react'

interface HabitWithCompletions extends Habit {
  completions: HabitCompletion[]
  todayCompletions: number
}

export function HabitTracker() {
  const [habits, setHabits] = useState<HabitWithCompletions[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitDescription, setNewHabitDescription] = useState('')
  const [newHabitFrequency, setNewHabitFrequency] = useState(1)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    try {
      // Fetch habits
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (habitsError) throw habitsError

      // Fetch today's completions for all habits
      const today = new Date().toISOString().split('T')[0]
      const { data: completionsData, error: completionsError } = await supabase
        .from('habit_completions')
        .select('*')
        .gte('completed_at', `${today}T00:00:00.000Z`)
        .lt('completed_at', `${today}T23:59:59.999Z`)

      if (completionsError) throw completionsError

      // Combine habits with their completions
      const habitsWithCompletions: HabitWithCompletions[] = (habitsData || []).map(habit => {
        const habitCompletions = completionsData?.filter(c => c.habit_id === habit.id) || []
        return {
          ...habit,
          completions: habitCompletions,
          todayCompletions: habitCompletions.length
        }
      })

      setHabits(habitsWithCompletions)
    } catch (error) {
      console.error('Failed to fetch habits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitName.trim()) return

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: newHabitName.trim(),
          description: newHabitDescription.trim() || null,
          target_frequency: newHabitFrequency
        })
        .select()
        .single()

      if (error) throw error

      // Add to local state
      setHabits(prev => [...prev, {
        ...data,
        completions: [],
        todayCompletions: 0
      }])

      // Reset form
      setNewHabitName('')
      setNewHabitDescription('')
      setNewHabitFrequency(1)
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to add habit:', error)
      alert('Failed to add habit. Please try again.')
    }
  }

  const handleCompleteHabit = async (habitId: string) => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      // Update local state
      setHabits(prev => prev.map(habit => 
        habit.id === habitId 
          ? {
              ...habit,
              completions: [...habit.completions, data],
              todayCompletions: habit.todayCompletions + 1
            }
          : habit
      ))
    } catch (error) {
      console.error('Failed to complete habit:', error)
      alert('Failed to complete habit. Please try again.')
    }
  }

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return

    try {
      const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', habitId)

      if (error) throw error

      // Remove from local state
      setHabits(prev => prev.filter(habit => habit.id !== habitId))
    } catch (error) {
      console.error('Failed to delete habit:', error)
      alert('Failed to delete habit. Please try again.')
    }
  }

  const getStreakDays = async (habitId: string) => {
    // This would require more complex logic to calculate streaks
    // For now, return a placeholder
    return 0
  }

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit)
    setIsEditModalOpen(true)
  }

  const handleSaveHabit = async (habitId: string, updates: Partial<Habit>) => {
    try {
      const { error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', habitId)

      if (error) throw error

      // Update local state optimistically
      setHabits(prev => prev.map(habit => 
        habit.id === habitId 
          ? { ...habit, ...updates }
          : habit
      ))
    } catch (error) {
      console.error('Failed to update habit:', error)
      // The HabitEditModal will handle displaying the error
      throw error
    }
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingHabit(null)
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Daily Habits</h3>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Habit
        </Button>
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <form onSubmit={handleAddHabit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Habit Name
              </label>
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="e.g., Drink 8 glasses of water"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={newHabitDescription}
                onChange={(e) => setNewHabitDescription(e.target.value)}
                placeholder="Additional details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target frequency per day
              </label>
              <select
                value={newHabitFrequency}
                onChange={(e) => setNewHabitFrequency(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>
                    {num} time{num > 1 ? 's' : ''} per day
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2">
              <Button
                type="submit"
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Add Habit
              </Button>
              <Button
                type="button"
                onClick={() => setShowAddForm(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No habits yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Add some daily habits to start tracking your progress
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => {
            const isCompleted = habit.todayCompletions >= habit.target_frequency
            const progressPercentage = Math.min((habit.todayCompletions / habit.target_frequency) * 100, 100)
            
            return (
              <div
                key={habit.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCompleted 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <button
                      onClick={() => !isCompleted && handleCompleteHabit(habit.id)}
                      disabled={isCompleted}
                      className={`transition-colors ${
                        isCompleted 
                          ? 'text-green-600 cursor-default'
                          : 'text-gray-400 hover:text-green-600 cursor-pointer'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${
                          isCompleted ? 'text-green-800 line-through' : 'text-gray-900'
                        }`}>
                          {habit.name}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{habit.todayCompletions}/{habit.target_frequency}</span>
                        </div>
                      </div>
                      
                      {habit.description && (
                        <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
                      )}
                      
                      {/* Progress Bar */}
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!isCompleted && habit.todayCompletions < habit.target_frequency && (
                      <Button
                        onClick={() => handleCompleteHabit(habit.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Mark Done
                      </Button>
                    )}
                    
                    <button
                      onClick={() => handleEditHabit(habit)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="Edit habit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete habit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Today's Summary */}
      {habits.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Today's Progress</span>
            </div>
            <div className="text-gray-900 font-medium">
              {habits.filter(h => h.todayCompletions >= h.target_frequency).length} of {habits.length} completed
            </div>
          </div>
          
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 bg-green-500 rounded-full transition-all duration-300"
                style={{ 
                  width: `${habits.length > 0 ? (habits.filter(h => h.todayCompletions >= h.target_frequency).length / habits.length) * 100 : 0}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Habit Edit Modal */}
      <HabitEditModal
        habit={editingHabit}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveHabit}
      />
    </div>
  )
}