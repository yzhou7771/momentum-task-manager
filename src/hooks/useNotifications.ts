'use client'

import { useState, useEffect } from 'react'
import { NotificationService } from '@/lib/notifications'

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported(NotificationService.isSupported())
    if (NotificationService.isSupported()) {
      setPermission(NotificationService.getPermissionStatus())
    }
  }, [])

  const requestPermission = async () => {
    const granted = await NotificationService.requestPermission()
    setPermission(granted ? 'granted' : 'denied')
    return granted
  }

  const showMorningNotification = () => {
    return NotificationService.showMorningPlanningNotification()
  }

  const showTaskReminder = (taskTitle: string) => {
    return NotificationService.showTaskReminderNotification(taskTitle)
  }

  const showTaskCompleted = (taskTitle: string) => {
    return NotificationService.showTaskCompletedNotification(taskTitle)
  }

  const scheduleMorningNotifications = (hour: number = 9, minute: number = 0) => {
    if (permission === 'granted') {
      NotificationService.scheduleMorningNotification(hour, minute)
    }
  }

  return {
    permission,
    isSupported,
    requestPermission,
    showMorningNotification,
    showTaskReminder,
    showTaskCompleted,
    scheduleMorningNotifications
  }
}