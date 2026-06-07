'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingBag, User } from 'lucide-react'

export default function ClienteContaPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?next=/cliente/conta')
    }
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <p className="text-gray-500">Carregando sua conta...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Minha Conta</h1>
        <p className="mt-2 text-gray-500">Aqui você encontra seus dados, histórico de pedidos e favoritos.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Conta</p>
              <h2 className="mt-2 text-lg font-semibold text-gray-900">Dados do usuário</h2>
            </div>
            <span className="rounded-full bg-brand-green/10 px-3 py-2 text-sm font-semibold text-brand-green-dark">Ativo</span>
          </div>
          <div className="mt-6 space-y-3 text-sm text-gray-600">
            <p><span className="font-medium text-gray-900">Nome:</span> {profile?.full_name ?? '—'}</p>
            <p><span className="font-medium text-gray-900">Email:</span> {profile?.email ?? user.email ?? '—'}</p>
            <p><span className="font-medium text-gray-900">Entrou em:</span> {new Date(profile?.created_at ?? Date.now()).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push('/cliente/pedidos')}
          className="rounded-3xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:border-brand-green hover:bg-brand-green/5"
        >
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-brand-green/10 p-3 text-brand-green-dark">
              <ShoppingBag size={20} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Pedidos</p>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">Ver compras</h3>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => router.push('/cliente/favoritos')}
          className="rounded-3xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:border-brand-green hover:bg-brand-green/5"
        >
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-pink-50 p-3 text-pink-600">
              <Heart size={20} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Favoritos</p>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">Produtos salvos</h3>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">O que você pode fazer aqui</h2>
        <ul className="mt-4 space-y-3 text-sm text-gray-600">
          <li>• Ver seus pedidos e links de download.</li>
          <li>• Consultar favoritos para comprar depois.</li>
          <li>• Atualizar informações de conta e perfil.</li>
          <li>• Acompanhar pagamentos e histórico de compras.</li>
        </ul>
      </div>
    </div>
  )
}
