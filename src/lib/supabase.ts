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