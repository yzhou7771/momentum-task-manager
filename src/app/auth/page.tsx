'use client'

import React, { useState } from 'react'
import { AuthForm } from '@/components/auth/AuthForm'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Momentum
          </h1>
          <p className="text-gray-600">
            Your smart, adaptive task manager
          </p>
        </div>
        
        <AuthForm mode={mode} onToggleMode={toggleMode} />
      </div>
    </div>
  )
}