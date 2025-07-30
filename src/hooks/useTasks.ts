'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/lib/supabase'
import { TaskService } from '@/lib/tasks'
import { useAuth } from '@/contexts/AuthContext'

export function useTasks(status?: Task['status']) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchTasks = async () => {
    if (!user) return

    setLoading(true)
    try {
      const data = await TaskService.getTasks(user.id, status)
      setTasks(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [user, status])

  const createTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at'>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const newTask = await TaskService.createTask({
        ...taskData,
        user_id: user.id
      })
      setTasks(prev => [newTask, ...prev])
      return newTask
    } catch (err: any) {
      setError(err.message || 'Failed to create task')
      throw err
    }
  }

  const createMultipleTasks = async (tasksData: Array<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at'>>) => {
    if (!user) {
      console.error('❌ User not authenticated')
      throw new Error('User not authenticated')
    }

    try {
      console.log('🔄 useTasks: Creating tasks for user:', user.id)
      console.log('🔄 useTasks: Tasks data:', tasksData)
      
      const tasksWithUserId = tasksData.map(task => ({ ...task, user_id: user.id }))
      console.log('🔄 useTasks: Tasks with user_id:', tasksWithUserId)
      
      const newTasks = await TaskService.createMultipleTasks(tasksWithUserId)
      console.log('✅ useTasks: New tasks from service:', newTasks)
      
      setTasks(prev => {
        console.log('🔄 useTasks: Previous tasks:', prev.length)
        const updated = [...newTasks, ...prev]
        console.log('🔄 useTasks: Updated tasks:', updated.length)
        return updated
      })
      
      return newTasks
    } catch (err: any) {
      console.error('❌ useTasks error:', err)
      setError(err.message || 'Failed to create tasks')
      throw err
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await TaskService.updateTask(taskId, updates)
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ))
      return updatedTask
    } catch (err: any) {
      setError(err.message || 'Failed to update task')
      throw err
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await TaskService.deleteTask(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (err: any) {
      setError(err.message || 'Failed to delete task')
      throw err
    }
  }

  const moveToActive = async (taskId: string) => {
    return updateTask(taskId, { status: 'active' })
  }

  const completeTask = async (taskId: string) => {
    return updateTask(taskId, { 
      status: 'completed',
      completed_at: new Date().toISOString()
    })
  }

  const moveToInbox = async (taskId: string) => {
    return updateTask(taskId, { 
      status: 'inbox',
      completed_at: undefined
    })
  }

  return {
    tasks,
    loading,
    error,
    createTask,
    createMultipleTasks,
    updateTask,
    deleteTask,
    moveToActive,
    completeTask,
    moveToInbox,
    refetch: fetchTasks
  }
}