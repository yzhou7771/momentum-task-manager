import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database Types
export interface User {
  id: string
  email: string
  name?: string
  timezone?: string
  preferences?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  priority: number // 1-10
  time_estimate?: number // minutes
  status: 'inbox' | 'active' | 'completed'
  tags?: string[]
  energy_type?: 'creative' | 'administrative' | 'physical' | 'social'
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface UserProfile {
  id: string
  user_id: string
  notification_settings: Record<string, any>
  energy_patterns?: Record<string, any>
  productivity_stats?: Record<string, any>
  created_at: string
  updated_at: string
}

// Level 2 Types
export interface MoodEnergyLog {
  id: string
  user_id: string
  energy_level: 'low' | 'medium' | 'high'
  mood: 'frustrated' | 'tired' | 'neutral' | 'focused' | 'energetic' | 'creative'
  notes?: string
  logged_at: string
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  description?: string
  target_frequency: number // times per day
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HabitCompletion {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  notes?: string
}

export interface PomodoroSession {
  id: string
  user_id: string
  task_id?: string
  duration_minutes: number
  completed: boolean
  started_at: string
  completed_at?: string
}