'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { supabase, Task, PomodoroSession } from '@/lib/supabase'
import { 
  Play,
  Pause,
  RotateCcw,
  Timer,
  CheckCircle2,
  Coffee
} from 'lucide-react'

interface PomodoroTimerProps {
  selectedTask?: Task | null
  onSessionComplete?: (session: PomodoroSession) => void
}

type TimerPhase = 'work' | 'shortBreak' | 'longBreak'

export function PomodoroTimer({ selectedTask, onSessionComplete }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [phase, setPhase] = useState<TimerPhase>('work')
  const [sessionCount, setSessionCount] = useState(0)
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Timer durations in minutes
  const durations = {
    work: 25,
    shortBreak: 5,
    longBreak: 15
  }

  useEffect(() => {
    // Create audio element for notifications
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/y')

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const handleTimerComplete = async () => {
    setIsRunning(false)
    
    // Play notification sound
    if (audioRef.current) {
      try {
        await audioRef.current.play()
      } catch (error) {
        console.log('Could not play notification sound')
      }
    }

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${phase === 'work' ? 'Work' : 'Break'} session complete!`, {
        body: phase === 'work' ? 'Time for a break!' : 'Ready to get back to work?',
        icon: '/favicon.ico'
      })
    }

    if (phase === 'work') {
      // Complete the work session in database
      if (currentSession) {
        try {
          await supabase
            .from('pomodoro_sessions')
            .update({
              completed: true,
              completed_at: new Date().toISOString()
            })
            .eq('id', currentSession.id)

          if (onSessionComplete) {
            onSessionComplete({ ...currentSession, completed: true })
          }
        } catch (error) {
          console.error('Failed to update session:', error)
        }
      }

      setSessionCount(count => count + 1)
      
      // Determine next phase
      const newSessionCount = sessionCount + 1
      if (newSessionCount % 4 === 0) {
        setPhase('longBreak')
        setTimeLeft(durations.longBreak * 60)
      } else {
        setPhase('shortBreak')
        setTimeLeft(durations.shortBreak * 60)
      }
    } else {
      // Break is over, back to work
      setPhase('work')
      setTimeLeft(durations.work * 60)
    }
  }

  const handleStart = async () => {
    if (phase === 'work' && !currentSession) {
      // Create new pomodoro session
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          console.error('User not authenticated for pomodoro session')
          setIsRunning(true) // Still allow timer to run without saving
          return
        }

        const { data, error } = await supabase
          .from('pomodoro_sessions')
          .insert({
            user_id: user.id,
            task_id: selectedTask?.id || null,
            duration_minutes: durations.work,
            completed: false
          })
          .select()
          .single()

        if (error) throw error
        setCurrentSession(data)
      } catch (error) {
        console.error('Failed to create pomodoro session:', error)
      }
    }

    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(durations[phase] * 60)
    if (currentSession && phase === 'work') {
      setCurrentSession(null)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getPhaseInfo = () => {
    switch (phase) {
      case 'work':
        return {
          title: 'Focus Time',
          subtitle: selectedTask ? `Working on: ${selectedTask.title}` : 'Time to focus!',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      case 'shortBreak':
        return {
          title: 'Short Break',
          subtitle: 'Take a quick breather',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      case 'longBreak':
        return {
          title: 'Long Break',
          subtitle: 'You\'ve earned this break!',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        }
    }
  }

  const phaseInfo = getPhaseInfo()

  return (
    <div className={`rounded-xl border-2 p-6 ${phaseInfo.bgColor} ${phaseInfo.borderColor}`}>
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          {phase === 'work' ? (
            <Timer className={`w-6 h-6 ${phaseInfo.color}`} />
          ) : (
            <Coffee className={`w-6 h-6 ${phaseInfo.color}`} />
          )}
          <h3 className={`text-lg font-semibold ${phaseInfo.color}`}>
            {phaseInfo.title}
          </h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-6">
          {phaseInfo.subtitle}
        </p>

        {/* Timer Display */}
        <div className={`text-6xl font-mono font-bold mb-6 ${phaseInfo.color}`}>
          {formatTime(timeLeft)}
        </div>

        {/* Progress Ring */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              opacity="0.2"
              className={phaseInfo.color}
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={2 * Math.PI * 56}
              strokeDashoffset={2 * Math.PI * 56 * (timeLeft / (durations[phase] * 60))}
              className={phaseInfo.color}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              className={`bg-gray-900 hover:bg-gray-800 text-white px-6 py-3`}
            >
              <Play className="w-5 h-5 mr-2" />
              Start
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              variant="outline"
              className="px-6 py-3"
            >
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </Button>
          )}
          
          <Button
            onClick={handleReset}
            variant="outline"
            className="px-6 py-3"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </Button>
        </div>

        {/* Session Counter */}
        <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>{sessionCount} sessions completed</span>
          </div>
          {sessionCount > 0 && (
            <div>
              Next long break in {4 - (sessionCount % 4)} sessions
            </div>
          )}
        </div>
      </div>
    </div>
  )
}