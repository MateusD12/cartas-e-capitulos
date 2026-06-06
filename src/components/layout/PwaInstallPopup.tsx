'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaInstallPopup() {
  const [visible, setVisible] = useState(false)
  const [hiding, setHiding] = useState(false)
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      promptRef.current = e as BeforeInstallPromptEvent
      if (!sessionStorage.getItem('pwa-dismissed')) setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    setHiding(true)
    sessionStorage.setItem('pwa-dismissed', '1')
    setTimeout(() => { setVisible(false); setHiding(false) }, 350)
  }

  async function install() {
    if (!promptRef.current) return
    await promptRef.current.prompt()
    const { outcome } = await promptRef.current.userChoice
    if (outcome === 'accepted') { setVisible(false); promptRef.current = null }
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes ccSlideIn {
          from { transform: translateY(24px) translateX(8px); opacity: 0; }
          to   { transform: translateY(0)    translateX(0);   opacity: 1; }
        }
        @keyframes ccSlideOut {
          from { transform: translateY(0)    translateX(0);   opacity: 1; }
          to   { transform: translateY(16px) translateX(8px); opacity: 0; }
        }
      `}</style>

      <div
        role="dialog"
        aria-label="Instalar Cartas & Capítulos"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 20,
          width: 300,
          zIndex: 99999,
          borderRadius: 20,
          padding: '16px 16px 14px',
          background: '#ffffff',
          border: '1.5px solid #A8D8A8',
          boxShadow: '0 8px 32px rgba(168,216,168,0.25), 0 2px 8px rgba(0,0,0,0.08)',
          animation: hiding
            ? 'ccSlideOut 0.32s ease forwards'
            : 'ccSlideIn 0.42s cubic-bezier(0.22, 0.68, 0, 1.2) forwards',
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <img
            src="/icons/icon-192.png"
            alt=""
            style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, border: '1px solid #e5e7eb' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-nunito), sans-serif',
              fontWeight: 700,
              fontSize: 14,
              color: '#1a1a1a',
              lineHeight: 1.3,
            }}>
              Cartas &amp; Capítulos
            </div>
            <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 3, lineHeight: 1.4 }}>
              Instale o app para acesso<br />rápido direto da tela inicial
            </div>
          </div>
          <button
            onClick={dismiss}
            aria-label="Fechar"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9ca3af', padding: 4, flexShrink: 0,
              display: 'flex', alignItems: 'center', borderRadius: 6,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ height: 1, background: '#f3f4f6', marginBottom: 12 }} />

        {/* Botão instalar */}
        <button
          onClick={install}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: '#A8D8A8',
            color: '#1f4e1f',
            border: 'none',
            borderRadius: 12,
            padding: '10px 16px',
            fontFamily: 'var(--font-nunito), sans-serif',
            fontWeight: 700,
            fontSize: 13.5,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#7fc47f' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#A8D8A8' }}
        >
          <Download size={15} />
          Instalar app
        </button>
      </div>
    </>
  )
}
