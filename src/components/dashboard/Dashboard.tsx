'use client'

import React, { useState } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { useNotifications } from '@/hooks/useNotifications'
import { TaskInput } from '@/components/tasks/TaskInput'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskEditModal } from '@/components/tasks/TaskEditModal'
import { NotificationSetup } from '@/components/notifications/NotificationSetup'
import { MoodEnergyCheckIn } from '@/components/energy/MoodEnergyCheckIn'
import { EnergyPatterns } from '@/components/energy/EnergyPatterns'
import { SmartRecommendations } from '@/components/recommendations/SmartRecommendations'
import { HabitTracker } from '@/components/habits/HabitTracker'
import { ProductivityAnalytics } from '@/components/analytics/ProductivityAnalytics'
import { HealthIntegration } from '@/components/health/HealthIntegration'
import { Task } from '@/lib/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Progress } from '@/components/ui/Progress'
import { 
  Calendar,
  Target,
  TrendingUp,
  CheckCircle2,
  Brain,
  BarChart3
} from 'lucide-react'

export function Dashboard() {
  const { 
    tasks: allTasks, 
    loading, 
    error,
    createMultipleTasks,
    updateTask,
    deleteTask,
    moveToActive,
    completeTask,
    moveToInbox
  } = useTasks()

  const { showTaskCompleted } = useNotifications()
  const [activeTab, setActiveTab] = useState('all')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Filter tasks by status
  const inboxTasks = allTasks.filter(task => task.status === 'inbox')
  const activeTasks = allTasks.filter(task => task.status === 'active')
  const completedTasks = allTasks.filter(task => task.status === 'completed')

  // Calculate progress metrics
  const totalTasks = allTasks.length
  const completedCount = completedTasks.length
  const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0

  const handleTasksCreated = async (tasks: Array<{
    title: string
    description?: string
    priority: number
    time_estimate?: number
    tags?: string[]
    energy_type?: 'creative' | 'administrative' | 'physical' | 'social'
  }>) => {
    try {
      console.log('📝 Creating tasks:', tasks)
      const taskData = tasks.map(task => ({
        ...task,
        status: 'inbox' as const
      }))
      console.log('📤 Sending to createMultipleTasks:', taskData)
      const newTasks = await createMultipleTasks(taskData)
      console.log('✅ Tasks created successfully:', newTasks)
    } catch (error) {
      console.error('❌ Failed to create tasks:', error)
      // 显示错误消息给用户
      alert(`创建任务失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      const task = allTasks.find(t => t.id === taskId)
      await completeTask(taskId)
      
      if (task) {
        showTaskCompleted(task.title)
      }
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsEditModalOpen(true)
  }

  const handleSaveTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(taskId, updates)
      // Could add a success notification here if desired
    } catch (error) {
      console.error('Failed to update task:', error)
      // The TaskEditModal will handle displaying the error
      throw error
    }
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingTask(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Good morning! Let's build momentum 🚀
        </h1>
        <p className="text-gray-600">
          Plan your day and let AI organize your tasks for maximum productivity
        </p>
      </div>

      {/* Progress Overview */}
      {totalTasks > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{totalTasks}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{completedCount}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{activeTasks.length}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{Math.round(completionRate)}%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Daily Progress</span>
              <span>{completedCount} of {totalTasks} tasks completed</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </div>
      )}

      {/* Notification Setup */}
      <NotificationSetup />

      {/* Task Input */}
      <TaskInput onTasksCreated={handleTasksCreated} disabled={loading} />

      {/* Task Lists */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tasks ({totalTasks})</TabsTrigger>
          <TabsTrigger value="energy">
            <Brain className="w-4 h-4 mr-1" />
            Energy
          </TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-1" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SmartRecommendations 
                tasks={allTasks} 
                onTaskSelect={() => {}}
              />
              
              {inboxTasks.length > 0 && (
                <TaskList
                  tasks={inboxTasks}
                  title="📥 Inbox"
                  emptyMessage="No tasks in your inbox"
                  onComplete={handleCompleteTask}
                  onMoveToActive={moveToActive}
                  onMoveToInbox={moveToInbox}
                  onDelete={deleteTask}
                  onEdit={handleEditTask}
                />
              )}

              {activeTasks.length > 0 && (
                <TaskList
                  tasks={activeTasks}
                  title="⚡ Active"
                  emptyMessage="No active tasks"
                  onComplete={handleCompleteTask}
                  onMoveToActive={moveToActive}
                  onMoveToInbox={moveToInbox}
                  onDelete={deleteTask}
                  onEdit={handleEditTask}
                />
              )}

              {completedTasks.length > 0 && (
                <TaskList
                  tasks={completedTasks.slice(0, 5)}
                  title="✅ Recently Completed"
                  emptyMessage="No completed tasks"
                  onComplete={handleCompleteTask}
                  onMoveToActive={moveToActive}
                  onMoveToInbox={moveToInbox}
                  onDelete={deleteTask}
                  onEdit={handleEditTask}
                />
              )}
            </div>
            
            <div className="space-y-6">
              <MoodEnergyCheckIn />
              <EnergyPatterns />
            </div>
          </div>
        </TabsContent>

        {/* Energy Tab */}
        <TabsContent value="energy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MoodEnergyCheckIn />
            <EnergyPatterns />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SmartRecommendations 
              tasks={allTasks} 
              onTaskSelect={() => {}}
            />
            <HealthIntegration />
          </div>
        </TabsContent>


        {/* Habits Tab */}
        <TabsContent value="habits">
          <HabitTracker />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <ProductivityAnalytics />
        </TabsContent>


      </Tabs>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Task Edit Modal */}
      <TaskEditModal
        task={editingTask}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveTask}
      />
    </div>
  )
}