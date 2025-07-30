'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { VoiceInput } from './VoiceInput'
import { analyzeTaskInput } from '@/lib/claude'
import { Plus, Wand2 } from 'lucide-react'

interface TaskInputProps {
  onTasksCreated: (tasks: Array<{
    title: string
    description?: string
    priority: number
    time_estimate?: number
    tags?: string[]
  }>) => void
  disabled?: boolean
}

export function TaskInput({ onTasksCreated, disabled = false }: TaskInputProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showVoice, setShowVoice] = useState(false)

  const handleSubmit = async (text: string) => {
    if (!text.trim() || loading) return

    setLoading(true)
    try {
      const analysis = await analyzeTaskInput(text)
      
      const tasks = analysis.tasks.map(task => ({
        title: task.title,
        description: task.description,
        priority: task.priority,
        time_estimate: task.timeEstimate,
        tags: task.tags || []
      }))

      onTasksCreated(tasks)
      setInput('')
      setShowVoice(false)
    } catch (error) {
      console.error('Failed to process tasks:', error)
      // Fallback: create simple task
      onTasksCreated([{
        title: text.trim(),
        priority: 5,
        time_estimate: 30,
        tags: []
      }])
      setInput('')
    } finally {
      setLoading(false)
    }
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(input)
  }

  const handleVoiceTranscript = (transcript: string) => {
    handleSubmit(transcript)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 gentle-hover">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Add New Tasks
        </h2>
        <p className="text-sm text-gray-600">
          Type or speak your tasks - AI will organize them for you
        </p>
      </div>

      {!showVoice ? (
        <form onSubmit={handleTextSubmit} className="space-y-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your tasks (e.g., 'Call dentist, finish report by Friday, buy groceries')"
            disabled={disabled || loading}
          />
          
          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={!input.trim() || disabled || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tasks
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowVoice(true)}
              disabled={disabled || loading}
            >
              🎤 Voice
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <VoiceInput
            onTranscript={handleVoiceTranscript}
            disabled={disabled || loading}
          />
          
          <Button
            variant="outline"
            onClick={() => setShowVoice(false)}
            className="w-full"
            disabled={loading}
          >
            Switch to Text Input
          </Button>
        </div>
      )}
    </div>
  )
}