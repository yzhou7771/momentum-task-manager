'use client'

import React from 'react'
import { Task } from '@/lib/supabase'
import { TaskItem } from './TaskItem'
import { Inbox, Play, CheckCircle } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  title: string
  emptyMessage: string
  onComplete: (taskId: string) => void
  onMoveToActive: (taskId: string) => void
  onMoveToInbox: (taskId: string) => void
  onDelete: (taskId: string) => void
  onEdit?: (task: Task) => void
}

export function TaskList({ 
  tasks, 
  title, 
  emptyMessage, 
  onComplete, 
  onMoveToActive, 
  onMoveToInbox, 
  onDelete,
  onEdit 
}: TaskListProps) {
  const getStatusIcon = () => {
    if (title.toLowerCase().includes('inbox')) return <Inbox className="w-5 h-5" />
    if (title.toLowerCase().includes('active')) return <Play className="w-5 h-5" />
    if (title.toLowerCase().includes('completed')) return <CheckCircle className="w-5 h-5" />
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-500">({tasks.length})</span>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-gray-400 mb-2">
            {getStatusIcon()}
          </div>
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={onComplete}
              onMoveToActive={onMoveToActive}
              onMoveToInbox={onMoveToInbox}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}