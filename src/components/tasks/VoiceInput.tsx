'use client'

import React from 'react'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { Button } from '@/components/ui/Button'
import { Mic, MicOff, Square } from 'lucide-react'

interface VoiceInputProps {
  onTranscript: (transcript: string) => void
  disabled?: boolean
}

export function VoiceInput({ onTranscript, disabled = false }: VoiceInputProps) {
  const {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceInput()

  const handleStartListening = () => {
    resetTranscript()
    startListening()
  }

  const handleStopListening = () => {
    stopListening()
    if (transcript.trim()) {
      onTranscript(transcript.trim())
    }
  }

  if (!isSupported) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-xl">
        <MicOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          Voice input is not supported in this browser
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        {!isListening ? (
          <Button
            onClick={handleStartListening}
            disabled={disabled}
            size="lg"
            className="rounded-full w-16 h-16 bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Mic className="w-6 h-6" />
          </Button>
        ) : (
          <Button
            onClick={handleStopListening}
            size="lg"
            variant="secondary"
            className="rounded-full w-16 h-16 bg-red-100 hover:bg-red-200 text-red-600 shadow-lg animate-pulse"
          >
            <Square className="w-6 h-6" />
          </Button>
        )}
      </div>

      {isListening && (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-sm text-gray-600">Listening...</p>
        </div>
      )}

      {transcript && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-800 mb-1">Transcript:</p>
          <p className="text-blue-700">{transcript}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-gray-500">
          {isListening 
            ? 'Speak your tasks and click stop when finished' 
            : 'Click the microphone to start voice input'
          }
        </p>
      </div>
    </div>
  )
}