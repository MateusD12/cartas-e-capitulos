'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  ChevronDown,
  Folder,
  Store,
  User,
  Heart,
  ShoppingBag,
  LayoutDashboard,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { ProductGrid } from './ProductGrid'
import { SkeletonGrid } from './SkeletonCard'
import { getCategoryLabel } from '@/lib/utils'
import type { Product } from '@/types'


function normalizeThemes(raw?: string | null) {
  return raw
    ? raw
        .split(',')
        .map((theme) => theme.trim())
        .filter(Boolean)
    : []
}

export function ProductCatalog() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [themeFilter, setThemeFilter] = useState('')
  const [sortOption, setSortOption] = useState<'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'>('price-asc')

  useEffect(() => {
    const supabase = createClient()

    async function loadProducts() {
      setLoading(true)
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      setProducts((data ?? []) as Product[])
      setLoading(false)
    }

    loadProducts()
  }, [])

  const categoryOptions = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.category.trim()).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [products]
  )

  const themeOptions = useMemo(() => {
    const set = new Set<string>()
    products.forEach((product) => {
      normalizeThemes(product.theme).forEach((theme) => set.add(theme))
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [products])

  const [expandedSidebarCategory, setExpandedSidebarCategory] = useState<string | null>(null)
  const { user, profile, loading: authLoading, signOut } = useAuth()

  const categoriesWithThemes = useMemo(() => {
    const map = new Map<string, Set<string>>()
    products.forEach((product) => {
      const category = product.category?.trim() || 'Sem categoria'
      const themes = normalizeThemes(product.theme)

      if (!map.has(category)) map.set(category, new Set())
      themes.forEach((theme) => map.get(category)?.add(theme))
    })

    return Array.from(map.entries())
      .map(([category, themes]) => ({
        category,
        themes: Array.from(themes).sort((a, b) => a.localeCompare(b, 'pt-BR')),
      }))
      .sort((a, b) => a.category.localeCompare(b.category, 'pt-BR'))
  }, [products])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    const result = products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        normalizeThemes(product.theme).some((theme) => theme.toLowerCase().includes(query))

      const matchesCategory = !categoryFilter || product.category === categoryFilter
      const matchesTheme =
        !themeFilter ||
        normalizeThemes(product.theme).some((theme) => theme.toLowerCase() === themeFilter.toLowerCase())

      return matchesSearch && matchesCategory && matchesTheme
    })

    return result.sort((a, b) => {
      if (sortOption === 'price-asc') return a.price - b.price
      if (sortOption === 'price-desc') return b.price - a.price
      if (sortOption === 'name-asc') return a.name.localeCompare(b.name, 'pt-BR')
      return b.name.localeCompare(a.name, 'pt-BR')
    })
  }, [products, search, categoryFilter, themeFilter, sortOption])

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter('')
    setThemeFilter('')
    setSortOption('price-asc')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-6">
        <aside className="hidden lg:flex w-72 bg-white border border-gray-200 rounded-3xl flex-col flex-shrink-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Categoria</p>
            <div className="mt-3 space-y-1">
              {categoriesWithThemes.map((item) => (
                <button
                  key={item.category}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(item.category)
                    setThemeFilter('')
                    setExpandedSidebarCategory(item.category)
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded-2xl transition text-gray-600 hover:bg-gray-50`}
                >
                  <Folder size={16} />
                  <span className="truncate">{item.category}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Conta</p>
            <div className="mt-3 space-y-1">
              {!authLoading && !user ? (
                <>
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left bg-brand-green/10 hover:bg-brand-green/20 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-green text-gray-800 flex-shrink-0">
                      <User size={16} />
                    </span>
                    <span className="text-sm font-semibold text-gray-800">Entrar</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => router.push('/cliente/conta')}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600 flex-shrink-0">
                      <User size={16} />
                    </span>
                    <span className="text-sm font-medium text-gray-700">Minha conta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push('/cliente/favoritos')}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-pink-50 text-pink-600 flex-shrink-0">
                      <Heart size={16} />
                    </span>
                    <span className="text-sm font-medium text-gray-700">Favoritos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push('/cliente/pedidos')}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-green/20 text-green-700 flex-shrink-0">
                      <ShoppingBag size={16} />
                    </span>
                    <span className="text-sm font-medium text-gray-700">Meus pedidos</span>
                  </button>
                </>
              )}
            </div>

            <div className="mt-4">
              <div className="space-y-2">
                {!authLoading && profile?.is_admin && (
                  <button
                    type="button"
                    onClick={() => router.push('/admin')}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600 flex-shrink-0">
                      <LayoutDashboard size={16} />
                    </span>
                    <span className="text-sm font-medium text-gray-700">Admin</span>
                  </button>
                )}

                {user && (
                  <button
                    type="button"
                    onClick={() => { signOut(); router.push('/') }}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600 flex-shrink-0">
                      <LogOut size={16} />
                    </span>
                    <span className="text-sm font-medium">Sair</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>

        <div>
          <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Cat&aacute;logo</p>
                <h1 className="mt-2 text-3xl font-display font-bold text-gray-900">Produtos dispon&iacute;veis</h1>
              </div>
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="relative block">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nome, tema ou palavra-chave"
                  className="w-full rounded-3xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-gray-700 outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                />
              </label>
              <div className="grid gap-2">
                <label className="block text-sm font-medium text-gray-600">Ordenar</label>
                <select
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value as 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc')}
                  className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                >
                  <option value="price-asc">Preço: menor → maior</option>
                  <option value="price-desc">Preço: maior → menor</option>
                  <option value="name-asc">A → Z</option>
                  <option value="name-desc">Z → A</option>
                </select>
              </div>
            </div>

            {(search || categoryFilter || themeFilter || sortOption !== 'price-asc') && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {search && <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">Busca: {search}</span>}
                {categoryFilter && <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">Categoria: {getCategoryLabel(categoryFilter)}</span>}
                {themeFilter && <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">Subcategoria: {themeFilter}</span>}
                {sortOption !== 'price-asc' && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                    Ordenar: {sortOption === 'price-desc' ? 'Preço maior → menor' : sortOption === 'name-asc' ? 'A → Z' : 'Z → A'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full bg-white px-3 py-1 text-sm text-brand-green border border-brand-green hover:bg-brand-green/10 transition"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>

            <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Produtos dispon&iacute;veis</p>
              <p className="text-xl font-semibold text-gray-900">{loading ? 'Carregando...' : `${filteredProducts.length} item${filteredProducts.length === 1 ? '' : 's'}`}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
              <span className="rounded-3xl border border-gray-200 bg-white px-3 py-2">Categorias: {categoryOptions.length}</span>
              <span className="rounded-3xl border border-gray-200 bg-white px-3 py-2">Subcategorias: {themeOptions.length}</span>
            </div>
          </div>

          <div className="mt-6">
            {loading ? <SkeletonGrid /> : <ProductGrid products={filteredProducts} />}
          </div>

        </div>
      </div>
    </div>
  )
}
