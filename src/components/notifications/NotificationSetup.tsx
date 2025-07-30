'use client'

import React, { useEffect } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/Button'
import { Bell, BellOff, CheckCircle } from 'lucide-react'

interface NotificationSetupProps {
  className?: string
}

export function NotificationSetup({ className }: NotificationSetupProps) {
  const {
    permission,
    isSupported,
    requestPermission,
    scheduleMorningNotifications
  } = useNotifications()

  useEffect(() => {
    // Auto-schedule morning notifications if permission is already granted
    if (permission === 'granted') {
      scheduleMorningNotifications(9, 0) // 9:00 AM
    }
  }, [permission, scheduleMorningNotifications])

  const handleEnableNotifications = async () => {
    const granted = await requestPermission()
    if (granted) {
      scheduleMorningNotifications(9, 0) // 9:00 AM
    }
  }

  if (!isSupported) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <BellOff className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-700">Notifications not supported</p>
            <p className="text-xs text-gray-500">Your browser doesn't support push notifications</p>
          </div>
        </div>
      </div>
    )
  }

  if (permission === 'granted') {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">Notifications enabled</p>
            <p className="text-xs text-green-600">You'll receive morning planning reminders at 9:00 AM</p>
          </div>
        </div>
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <BellOff className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Notifications blocked</p>
            <p className="text-xs text-red-600">Please enable notifications in your browser settings</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">Enable morning notifications</p>
            <p className="text-xs text-blue-600">Get reminded to plan your day each morning</p>
          </div>
        </div>
        <Button
          onClick={handleEnableNotifications}
          size="sm"
          className="ml-3"
        >
          Enable
        </Button>
      </div>
    </div>
  )
}