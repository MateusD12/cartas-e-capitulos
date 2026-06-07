'use client'

import Image from 'next/image'
import { FileDown, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useFavorites } from '@/hooks/useFavorites'
import { formatCurrency, getCategoryLabel, getCategoryColor } from '@/lib/utils'
import type { Product } from '@/types'

export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth()
  const router = useRouter()
  const { isFavorite, toggleFavorite } = useFavorites(user?.id)

  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (!user) {
      router.push(`/login?next=/produto/${product.slug}`)
      return
    }

    toggleFavorite(product.id)
  }

  const activeFavorite = isFavorite(product.id)

  return (
    <a
      href={`/produto/${product.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
    >
      <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden">
        {product.cover_image_url ? (
          <Image
            src={product.cover_image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-green/30 to-brand-blue/30 flex items-center justify-center">
            <FileDown size={32} className="text-gray-300" />
          </div>
        )}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 z-10 rounded-full bg-white/90 p-2 text-gray-500 shadow-sm hover:bg-white hover:text-red-500 transition-colors"
          aria-label={activeFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart
            size={18}
            className={`${activeFavorite ? 'fill-current text-red-500' : 'text-gray-500'}`}
          />
        </button>
        <div className="absolute top-2 left-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColor(product.category)}`}>
            {getCategoryLabel(product.category)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-gray-800 text-sm leading-snug line-clamp-2">
          {product.name}
        </h3>
        {product.age_range && (
          <p className="text-xs text-gray-400 mt-1">{product.age_range}</p>
        )}
        {product.theme && (
          <p className="text-xs text-gray-500 mt-0.5">{product.theme}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display font-bold text-gray-900">
            {formatCurrency(product.price)}
          </span>
          <span className="text-xs text-brand-green-dark font-medium group-hover:underline">
            Ver →
          </span>
        </div>
      </div>
    </a>
  )
}
