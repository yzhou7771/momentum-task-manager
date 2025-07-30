import { supabase, Task } from './supabase'

export class TaskService {
  static async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed_at'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async createMultipleTasks(tasksData: Array<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed_at'>>) {
    console.log('🔄 TaskService: Creating tasks:', tasksData)
    
    const { data, error } = await supabase
      .from('tasks')
      .insert(tasksData)
      .select()

    if (error) {
      console.error('❌ TaskService error:', error)
      throw error
    }
    
    console.log('✅ TaskService: Created tasks:', data)
    return data
  }

  static async getTasks(userId: string, status?: Task['status']) {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  static async updateTask(taskId: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteTask(taskId: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) throw error
  }

  static async moveToActive(taskId: string) {
    return this.updateTask(taskId, { status: 'active' })
  }

  static async completeTask(taskId: string) {
    return this.updateTask(taskId, { 
      status: 'completed',
      completed_at: new Date().toISOString()
    })
  }

  static async moveToInbox(taskId: string) {
    return this.updateTask(taskId, { 
      status: 'inbox',
      completed_at: undefined
    })
  }

  static async getTasksByPriority(userId: string, status?: Task['status']) {
    const tasks = await this.getTasks(userId, status)
    return tasks.sort((a, b) => b.priority - a.priority)
  }

  static async searchTasks(userId: string, query: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}