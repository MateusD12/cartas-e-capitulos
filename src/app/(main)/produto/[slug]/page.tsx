import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Download, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductGallery } from '@/components/produto/ProductGallery'
import { FAQ } from '@/components/produto/FAQ'
import { ProductGrid } from '@/components/produto/ProductGrid'
import { formatCurrency, getCategoryLabel, getCategoryColor } from '@/lib/utils'
import type { Product } from '@/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data as Product | null
}

async function getDownloadCount(productId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId)
    .eq('status', 'paid')
  return count ?? 0
}

async function getRelated(category: string, currentId: string): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .neq('id', currentId)
    .limit(4)
  return (data ?? []) as Product[]
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

  const [downloadCount, related] = await Promise.all([
    getDownloadCount(product.id),
    getRelated(product.category, product.id),
  ])

  const previews: string[] = (product as unknown as { preview_image_urls?: string[] }).preview_image_urls ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Galeria com previews */}
        <ProductGallery
          coverUrl={product.cover_image_url}
          previewUrls={previews}
          name={product.name}
        />

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

          {/* Prova social real */}
          {downloadCount > 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <Users size={15} className="text-brand-green-dark" />
              <span>
                <strong className="text-gray-700">{downloadCount}</strong>{' '}
                {downloadCount === 1 ? 'pessoa baixou' : 'pessoas baixaram'} esse imprimível
              </span>
            </div>
          )}

          {/* Badge download imediato */}
          <div className="mt-5 flex items-center gap-2 bg-brand-green/20 border border-brand-green rounded-xl px-4 py-3">
            <Download size={16} className="text-brand-green-dark flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700">
              Download imediato após confirmação do pagamento
            </span>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-8">
            <p className="font-display font-bold text-4xl text-gray-900">
              {formatCurrency(product.price)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Pagamento único · acesso permanente · <a href="/politica" className="underline hover:text-gray-600">política de reembolso</a></p>

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

      {/* Produtos relacionados */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display font-bold text-xl text-gray-800 mb-6">
            Você também pode gostar
          </h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  )
}
