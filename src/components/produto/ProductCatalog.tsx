'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Funnel,
  X,
  ArrowUp,
  ArrowDown,
  Sparkles,
  BookOpen,
  Gift,
  ClipboardList,
  ChevronDown,
  Folder,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ProductGrid } from './ProductGrid'
import { SkeletonGrid } from './SkeletonCard'
import { getCategoryLabel } from '@/lib/utils'
import type { Product } from '@/types'

const howItWorks = [
  {
    step: '1',
    title: 'Escolha seu produto',
    desc: 'Busque por tema, categoria ou palavra-chave e encontre o PDF certo para imprimir.',
    color: 'bg-brand-green/20 text-green-700',
  },
  {
    step: '2',
    title: 'Filtre e organize',
    desc: 'Use os filtros para ver por categoria, subcategoria, preço ou ordem alfabética.',
    color: 'bg-brand-blue/20 text-blue-700',
  },
  {
    step: '3',
    title: 'Pague e baixe',
    desc: 'Finalize a compra com Pix, receba o PDF e baixe imediatamente.',
    color: 'bg-purple-100 text-purple-700',
  },
]

function normalizeThemes(raw?: string | null) {
  return raw
    ? raw
        .split(',')
        .map((theme) => theme.trim())
        .filter(Boolean)
    : []
}

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [howOpen, setHowOpen] = useState(false)
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
      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-6">
        <aside className="hidden lg:block rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Navegação</p>
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Início
                </button>
                <button
                  type="button"
                  onClick={() => setHowOpen(true)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Como funciona
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Categorias</p>
              <div className="mt-3 space-y-3">
                {categoriesWithThemes.map((item) => (
                  <div key={item.category} className="rounded-3xl border border-gray-100 bg-gray-50">
                    <button
                      type="button"
                      onClick={() => setExpandedSidebarCategory((current) => (current === item.category ? null : item.category))}
                      onDoubleClick={() => {
                        setCategoryFilter(item.category)
                        setThemeFilter('')
                      }}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                    >
                      <span className="flex items-center gap-2">
                        <Folder size={16} />
                        {item.category}
                      </span>
                      <ChevronDown className={`transition ${expandedSidebarCategory === item.category ? 'rotate-180' : ''}`} size={16} />
                    </button>
                    {expandedSidebarCategory === item.category && item.themes.length > 0 && (
                      <div className="space-y-1 border-t border-gray-100 px-3 py-2">
                        <p className="text-[11px] text-gray-400 mb-2">Clique para expandir. Duplo clique para filtrar.</p>
                        {item.themes.map((theme) => (
                          <button
                            key={theme}
                            type="button"
                            onClick={() => {
                              setCategoryFilter(item.category)
                              setThemeFilter(theme)
                            }}
                            className="w-full rounded-2xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-white hover:text-gray-900 transition"
                          >
                            {theme}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-900 mb-2">Dica</p>
              Use o painel lateral para navegar pelas categorias e subcategorias do catálogo sem precisar do menu superior.
            </div>
          </div>
        </aside>

        <div>
          <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Catálogo</p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Encontre seu produto por nome, tema ou categoria
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setHowOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <Sparkles size={16} /> Como funciona?
            </button>
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-brand-green text-gray-900 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-brand-green-dark transition"
            >
              <Funnel size={16} /> Filtros
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, tema ou palavra-chave"
              className="w-full rounded-3xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-gray-700 outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
            />
          </label>
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center justify-center rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <Funnel size={18} className="mr-2 text-gray-500" /> Ajustar filtros
          </button>
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
          <p className="text-sm text-gray-500">Produtos disponíveis</p>
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

      {filterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-gray-900">Filtros do catálogo</h2>
                <p className="text-sm text-gray-500">Escolha categoria, subcategoria e ordem de exibição.</p>
              </div>
              <button onClick={() => setFilterOpen(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition">
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Categoria</label>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                >
                  <option value="">Todas</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Subcategoria</label>
                <select
                  value={themeFilter}
                  onChange={(event) => setThemeFilter(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                >
                  <option value="">Todas</option>
                  {themeOptions.map((theme) => (
                    <option key={theme} value={theme}>{theme}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Ordenar</label>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSortOption('price-asc')}
                    className={`rounded-3xl border px-4 py-3 text-left text-sm transition ${sortOption === 'price-asc' ? 'border-brand-green bg-brand-green/10 text-gray-900' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <ArrowDown size={16} /> Preço: menor → maior
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortOption('price-desc')}
                    className={`rounded-3xl border px-4 py-3 text-left text-sm transition ${sortOption === 'price-desc' ? 'border-brand-green bg-brand-green/10 text-gray-900' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <ArrowUp size={16} /> Preço: maior → menor
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortOption('name-asc')}
                    className={`rounded-3xl border px-4 py-3 text-left text-sm transition ${sortOption === 'name-asc' ? 'border-brand-green bg-brand-green/10 text-gray-900' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <ArrowUp size={16} /> A → Z
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortOption('name-desc')}
                    className={`rounded-3xl border px-4 py-3 text-left text-sm transition ${sortOption === 'name-desc' ? 'border-brand-green bg-brand-green/10 text-gray-900' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <ArrowDown size={16} /> Z → A
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => { setFilterOpen(false); clearFilters() }}
                className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Limpar tudo
              </button>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="rounded-3xl bg-brand-green px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-brand-green-dark"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {howOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-brand-green">Como funciona</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">Veja o processo em poucos passos</h2>
              </div>
              <button onClick={() => setHowOpen(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition">
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {howItWorks.map((item) => (
                <div key={item.step} className="rounded-3xl border border-gray-200 p-5 text-center">
                  <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-3xl text-xl font-bold ${item.color}`}>
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <p>Este é um mockup rápido do fluxo: primeiro você pesquisa, depois escolhe filtros e, por fim, compra o PDF.</p>
            </div>
          </div>
        </div>
      )}
      </div>
      </div>
    </div>
  )
}
