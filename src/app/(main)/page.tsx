import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/produto/ProductGrid'
import { SkeletonGrid } from '@/components/produto/SkeletonCard'
import { getCategoryLabel } from '@/lib/utils'
import type { Product, ProductCategory } from '@/types'

const categories: { value: ProductCategory; label: string }[] = [
  { value: 'educativo', label: 'Educativo' },
  { value: 'datas_especiais', label: 'Datas Especiais' },
  { value: 'papelaria', label: 'Papelaria' },
]

async function fetchProducts(categoria?: string, tema?: string): Promise<Product[]> {
  const supabase = await createClient()
  let query = supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false })
  if (categoria) query = query.eq('category', categoria)
  if (tema) query = query.ilike('theme', `%${tema}%`)
  const { data } = await query
  return (data ?? []) as Product[]
}

interface PageProps {
  searchParams: Promise<{ categoria?: string; tema?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const { categoria, tema } = await searchParams
  const products = await fetchProducts(categoria, tema)

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-green/30 via-white to-brand-blue/30 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-gray-800 leading-tight">
            Imprimíveis que <span className="text-brand-green-dark">encantam</span>
          </h1>
          <p className="mt-4 text-gray-600 text-lg md:text-xl max-w-xl mx-auto">
            Jogos educativos, presentes especiais e papelaria em PDF. Baixe e imprima em minutos.
          </p>
          <a
            href="#catalogo"
            className="mt-8 inline-flex items-center gap-2 bg-brand-green hover:bg-brand-green-dark text-gray-800 font-display font-semibold px-8 py-3 rounded-full transition-colors shadow-sm"
          >
            Ver catálogo ↓
          </a>
        </div>
      </section>

      {/* Catálogo */}
      <section id="catalogo" className="max-w-6xl mx-auto px-4 py-12">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <a
              href="/"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !categoria
                  ? 'bg-brand-green text-gray-800 shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos
            </a>
            {categories.map((cat) => (
              <a
                key={cat.value}
                href={`/?categoria=${cat.value}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  categoria === cat.value
                    ? 'bg-brand-green text-gray-800 shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </a>
            ))}
          </div>
          {(categoria || tema) && (
            <a href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors ml-auto">
              Limpar filtros ×
            </a>
          )}
        </div>

        {/* Grid */}
        <Suspense fallback={<SkeletonGrid />}>
          <ProductGrid products={products} />
        </Suspense>
      </section>
    </>
  )
}
