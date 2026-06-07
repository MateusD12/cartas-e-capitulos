'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useFavorites } from '@/hooks/useFavorites'
import { ProductGrid } from '@/components/produto/ProductGrid'
import type { Product } from '@/types'

export default function ClienteFavoritosPage() {
  const { user, loading } = useAuth()
  const { favorites } = useFavorites(user?.id)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?next=/cliente/favoritos')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user && !loading) {
      setLoadingProducts(false)
      return
    }

    async function loadFavorites() {
      setLoadingProducts(true)
      const supabase = createClient()
      if (favorites.length === 0) {
        setProducts([])
        setLoadingProducts(false)
        return
      }

      const { data } = await supabase
        .from('products')
        .select('*')
        .in('id', favorites)
        .eq('is_active', true)

      setProducts((data ?? []) as Product[])
      setLoadingProducts(false)
    }

    loadFavorites()
  }, [favorites, user, loading])

  if (loading || !user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <p className="text-gray-500">Carregando favoritos...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Meus Favoritos</h1>
        <p className="mt-2 text-gray-500">Produtos salvos para comprar depois.</p>
      </div>

      {loadingProducts ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm text-gray-500">Carregando produtos...</div>
      ) : favorites.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm text-gray-500">
          <p className="text-lg font-medium text-gray-900">Nenhum favorito ainda</p>
          <p className="mt-2">Clique no coração de um produto para salvá-lo e voltar depois.</p>
            <button
            type="button"
            onClick={() => router.push('/')}
            className="mt-4 rounded-2xl bg-brand-green px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-brand-green-dark transition"
          >
            Ver cat&aacute;logo
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <ProductGrid products={products} />
        </div>
      )}
    </div>
  )
}
