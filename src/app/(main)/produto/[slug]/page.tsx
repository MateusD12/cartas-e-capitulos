import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Download, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductGallery } from '@/components/produto/ProductGallery'
import { FAQ } from '@/components/produto/FAQ'
import { formatCurrency, getCategoryLabel, getCategoryColor } from '@/lib/utils'
import type { Product } from '@/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data as Product | null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.description ?? `${product.name} — imprimível digital em PDF`,
    openGraph: {
      title: product.name,
      description: product.description ?? `${product.name} — imprimível digital em PDF`,
      images: product.cover_image_url ? [{ url: product.cover_image_url }] : [],
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Galeria */}
        <ProductGallery coverUrl={product.cover_image_url} name={product.name} />

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getCategoryColor(product.category)}`}>
              {getCategoryLabel(product.category)}
            </span>
            {product.age_range && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                {product.age_range}
              </span>
            )}
            {product.theme && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                {product.theme}
              </span>
            )}
          </div>

          <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-800 leading-tight">
            {product.name}
          </h1>

          {product.description && (
            <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>
          )}

          {/* Badge download imediato */}
          <div className="mt-6 flex items-center gap-2 bg-brand-green/20 border border-brand-green rounded-xl px-4 py-3">
            <Download size={16} className="text-brand-green-dark flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700">
              Download imediato após confirmação do pagamento
            </span>
          </div>

          {/* Avaliações fictícias para confiança */}
          <div className="mt-4 flex items-center gap-1.5">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={14} className="fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-xs text-gray-400 ml-1">4.9 · muito bem avaliado</span>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-8">
            <p className="font-display font-bold text-4xl text-gray-900">
              {formatCurrency(product.price)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Pagamento único · acesso permanente</p>

            <a
              href={`/checkout?produto=${product.slug}`}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-brand-green hover:bg-brand-green-dark text-gray-800 font-display font-bold py-4 rounded-xl transition-colors shadow-sm text-base"
            >
              Comprar agora
            </a>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="font-display font-bold text-xl text-gray-800 mb-6">Perguntas frequentes</h2>
        <FAQ />
      </div>
    </div>
  )
}
