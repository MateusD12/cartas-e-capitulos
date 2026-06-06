'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { CountdownTimer } from './CountdownTimer'

interface QRCodeDisplayProps {
  qrCode: string
  qrCodeBase64: string
  expiresAt: string
  onExpire: () => void
}

export function QRCodeDisplay({ qrCode, qrCodeBase64, expiresAt, onExpire }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(qrCode)
    setCopied(true)
    toast.success('Código copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* QR Code */}
      <div className="flex justify-center">
        {qrCodeBase64 ? (
          <img
            src={`data:image/png;base64,${qrCodeBase64}`}
            alt="QR Code Pix"
            className="w-48 h-48 rounded-xl border border-gray-100"
          />
        ) : (
          <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
            <span className="text-gray-400 text-sm">QR Code</span>
          </div>
        )}
      </div>

      {/* Timer */}
      <div className="flex justify-center">
        <CountdownTimer expiresAt={expiresAt} onExpire={onExpire} />
      </div>

      {/* Pix copia e cola */}
      <div>
        <p className="text-xs text-gray-500 mb-2 text-center">Ou copie o código Pix</p>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
          <p className="flex-1 text-xs text-gray-600 font-mono truncate select-all">{qrCode}</p>
          <button
            onClick={handleCopy}
            aria-label="Copiar código Pix"
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400">
        Abra o app do seu banco → Pix → Pagar com QR Code ou Copia e Cola
      </p>
    </div>
  )
}
