import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  className?: string
}

export function Progress({ value, className }: ProgressProps) {
  return (
    <div className={cn(
      'relative h-2 w-full overflow-hidden rounded-full bg-gray-200',
      className
    )}>
      <div
        className="h-full w-full flex-1 bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
        style={{
          transform: `translateX(-${100 - Math.min(100, Math.max(0, value))}%)`
        }}
      />
    </div>
  )
}