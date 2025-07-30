import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // 检查数据库连接
    const { count: tasksCount, error: connectionError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })

    if (connectionError) {
      return NextResponse.json({
        error: 'Database connection failed',
        details: connectionError
      }, { status: 500 })
    }

    // 检查当前认证状态
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return NextResponse.json({
        error: 'Session check failed',
        details: sessionError
      }, { status: 500 })
    }

    // 获取所有任务（不考虑RLS）
    const { data: allTasks, error: allTasksError } = await supabase
      .from('tasks')
      .select('*')

    // 检查RLS策略
    const debugInfo = {
      database_connection: 'OK',
      total_tasks_count: tasksCount || 0,
      session_exists: !!session,
      user_id: session?.user?.id || 'Not authenticated',
      all_tasks: allTasks || [],
      all_tasks_error: allTasksError,
      rls_policies: 'Check Supabase dashboard for RLS policies'
    }

    return NextResponse.json(debugInfo)

  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: error
    }, { status: 500 })
  }
}