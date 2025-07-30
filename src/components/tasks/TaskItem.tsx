'use client'

import React, { useState } from 'react'
import { Task } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  MoreHorizontal, 
  Play, 
  Trash2,
  Edit3,
  Archive
} from 'lucide-react'

interface TaskItemProps {
  task: Task
  onComplete: (taskId: string) => void
  onMoveToActive: (taskId: string) => void
  onMoveToInbox: (taskId: string) => void
  onDelete: (taskId: string) => void
  onEdit?: (task: Task) => void
}

export function TaskItem({ 
  task, 
  onComplete, 
  onMoveToActive, 
  onMoveToInbox, 
  onDelete,
  onEdit 
}: TaskItemProps) {
  const [showActions, setShowActions] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-red-600 bg-red-50 border-red-200'
    if (priority >= 6) return 'text-orange-600 bg-orange-50 border-orange-200'
    if (priority >= 4) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'inbox': return 'bg-gray-100 text-gray-700'
      case 'active': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm gentle-hover">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={async () => {
              if (task.status === 'completed') {
                onMoveToInbox(task.id)
              } else if (task.status === 'inbox') {
                // Inbox → Active (不是直接完成)
                onMoveToActive(task.id)
              } else if (task.status === 'active') {
                // Active → Completed
                setIsCompleting(true)
                setTimeout(() => {
                  onComplete(task.id)
                  setIsCompleting(false)
                }, 300)
              }
            }}
            className={`mt-1 flex-shrink-0 ${isCompleting ? 'celebration' : ''}`}
          >
            {task.status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : task.status === 'active' ? (
              <Circle className="w-5 h-5 text-blue-400 hover:text-green-600 transition-colors" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-gray-900 ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className={`text-sm text-gray-600 mt-1 ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                {task.description}
              </p>
            )}

            <div className="flex items-center space-x-2 mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                Priority {task.priority}
              </span>

              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(task.status)}`}>
                {task.status}
              </span>

              {task.time_estimate && (
                <span className="inline-flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {task.time_estimate}m
                </span>
              )}
            </div>

            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
              {task.status === 'inbox' && (
                <button
                  onClick={() => {
                    onMoveToActive(task.id)
                    setShowActions(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Move to Active
                </button>
              )}

              {task.status === 'active' && (
                <button
                  onClick={() => {
                    onMoveToInbox(task.id)
                    setShowActions(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Move to Inbox
                </button>
              )}

              {onEdit && (
                <button
                  onClick={() => {
                    onEdit(task)
                    setShowActions(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}

              <button
                onClick={() => {
                  onDelete(task.id)
                  setShowActions(false)
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}