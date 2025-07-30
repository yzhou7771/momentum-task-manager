'use client'

export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  static async showNotification(title: string, options?: NotificationOptions) {
    const hasPermission = await this.requestPermission()
    
    if (!hasPermission) {
      console.warn('Notification permission not granted')
      return
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    })

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close()
    }, 5000)

    return notification
  }

  static showMorningPlanningNotification() {
    return this.showNotification('Good morning! Time to plan your day 🌅', {
      body: 'Open Momentum to organize your tasks and build momentum for a productive day.',
      tag: 'morning-planning',
      requireInteraction: true
    })
  }

  static showTaskReminderNotification(taskTitle: string) {
    return this.showNotification(`Reminder: ${taskTitle}`, {
      body: 'This task is waiting for your attention.',
      tag: 'task-reminder',
      requireInteraction: false
    })
  }

  static showTaskCompletedNotification(taskTitle: string) {
    return this.showNotification('Great job! 🎉', {
      body: `You completed: ${taskTitle}`,
      tag: 'task-completed',
      requireInteraction: false
    })
  }

  static scheduleMorningNotification(hour: number = 9, minute: number = 0) {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers not supported - cannot schedule notifications')
      return
    }

    const now = new Date()
    const scheduledTime = new Date()
    scheduledTime.setHours(hour, minute, 0, 0)

    // If the time has passed today, schedule for tomorrow
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }

    const delay = scheduledTime.getTime() - now.getTime()

    setTimeout(() => {
      this.showMorningPlanningNotification()
      // Schedule the next day
      this.scheduleMorningNotification(hour, minute)
    }, delay)
  }

  static isSupported(): boolean {
    return 'Notification' in window
  }

  static getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied'
    }
    return Notification.permission
  }
}