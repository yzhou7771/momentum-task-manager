'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Navigation } from '@/components/layout/Navigation'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { Settings } from '@/components/settings/Settings'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user, loading } = useAuth()
  const [activeView, setActiveView] = useState<'dashboard' | 'settings'>('dashboard')
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Momentum...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <Navigation activeView={activeView} onViewChange={setActiveView} />
        
        <main className="pb-8">
          {activeView === 'dashboard' ? <Dashboard /> : <Settings />}
        </main>
      </div>
    </ProtectedRoute>
  )
}