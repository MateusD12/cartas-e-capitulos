'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  expiresAt: string
  onExpire?: () => void
}

export function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  })

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire?.()
      return
    }
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval)
          onExpire?.()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [secondsLeft, onExpire])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const isUrgent = secondsLeft < 60

  if (secondsLeft <= 0) {
    return (
      <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
        <Clock size={14} />
        Pix expirado
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${isUrgent ? 'text-red-500' : 'text-gray-500'}`}>
      <Clock size={14} className={isUrgent ? 'animate-pulse' : ''} />
      Expira em {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}
