'use client'

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { QRCodeDisplay } from '@/components/checkout/QRCodeDisplay'
import { formatCurrency, validateCPF, maskCPF } from '@/lib/utils'
import type { Product, CheckoutResponse } from '@/types'

type Step = 'form' | 'pix' | 'success'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = searchParams.get('produto')
  const supabase = createClient()

  const [product, setProduct] = useState<Product | null>(null)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [step, setStep] = useState<Step>('form')

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Pix state
  const [pixData, setPixData] = useState<CheckoutResponse | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load user data
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push(`/login?next=/checkout?produto=${slug}`); return }
      setEmail(user.email ?? '')
      supabase.from('profiles').select('full_name').eq('id', user.id).single().then(({ data }) => {
        if (data?.full_name) setName(data.full_name)
      })
    })
  }, [slug, router, supabase])

  // Load product
  useEffect(() => {
    if (!slug) { setLoadingProduct(false); return }
    supabase.from('products').select('*').eq('slug', slug).eq('is_active', true).single()
      .then(({ data }) => { setProduct(data as Product); setLoadingProduct(false) })
  }, [slug, supabase])

  const stopPolling = useCallback(() => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
  }, [])

  const startPolling = useCallback((orderId: string) => {
    pollingRef.current = setInterval(async () => {
      const res = await fetch(`/api/pedidos/${orderId}/status`)
      if (!res.ok) return
      const { status } = await res.json()
      if (status === 'paid') { stopPolling(); setStep('success') }
      if (status === 'failed') { stopPolling(); toast.error('Pagamento não aprovado.') }
    }, 5000)
  }, [stopPolling])

  useEffect(() => () => stopPolling(), [stopPolling])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateCPF(cpf)) { toast.error('CPF inválido.'); return }
    if (!product) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, name, email, cpf: cpf.replace(/\D/g, '') }),
      })
      if (!res.ok) { const { error } = await res.json(); throw new Error(error ?? 'Erro ao gerar Pix') }
      const data: CheckoutResponse = await res.json()
      setPixData(data)
      setStep('pix')
      startPolling(data.orderId)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingProduct) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Produto não encontrado.</p>
        <a href="/" className="text-brand-green-dark text-sm mt-2 inline-block hover:underline">← Voltar</a>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <CheckCircle2 size={56} className="text-brand-green-dark mx-auto mb-4" />
          <h1 className="font-display font-bold text-2xl text-gray-800">Pagamento confirmado!</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Seu PDF está disponível para download na área de pedidos.
          </p>
          <a
            href="/cliente/pedidos"
            className="mt-8 inline-flex items-center gap-2 bg-brand-green hover:bg-brand-green-dark text-gray-800 font-display font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Ir para meus pedidos
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-2xl text-gray-800 mb-2">Finalizar compra</h1>

      {/* Resumo */}
      <div className="bg-brand-green/10 border border-brand-green/30 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="font-medium text-gray-800 text-sm">{product.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">Download imediato em PDF</p>
          </div>
          <span className="font-display font-bold text-gray-900 whitespace-nowrap">
            {formatCurrency(product.price)}
          </span>
        </div>
      </div>

      {step === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600" htmlFor="name">Nome completo</label>
            <input
              id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              placeholder="Como aparece no CPF"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600" htmlFor="email">E-mail</label>
            <input
              id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600" htmlFor="cpf">CPF</label>
            <input
              id="cpf" type="text" required value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              placeholder="000.000.000-00"
              maxLength={14}
              aria-label="CPF"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-green hover:bg-brand-green-dark text-gray-800 font-display font-bold py-4 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-base"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
            {submitting ? 'Gerando Pix...' : 'Gerar Pix'}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-2">
            <ShieldCheck size={14} />
            Pagamento seguro via Mercado Pago
          </div>
        </form>
      )}

      {step === 'pix' && pixData && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-center text-sm font-medium text-gray-700 mb-6">
            Escaneie o QR Code ou copie o código Pix
          </p>
          <QRCodeDisplay
            qrCode={pixData.qrCode}
            qrCodeBase64={pixData.qrCodeBase64}
            expiresAt={pixData.expiresAt}
            onExpire={() => { stopPolling(); toast.error('O Pix expirou. Faça um novo pedido.') }}
          />
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400 justify-center">
            <Loader2 size={12} className="animate-spin" />
            Aguardando confirmação do pagamento...
          </div>
        </div>
      )}
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
