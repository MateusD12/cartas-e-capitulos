'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').then((reg) => {
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
      reg.addEventListener('updatefound', () => {
        const worker = reg.installing
        if (!worker) return
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' })
          }
        })
      })
    }).catch(() => {})
  }, [])

  return null
}
