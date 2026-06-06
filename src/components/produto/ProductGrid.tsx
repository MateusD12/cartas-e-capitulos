import { ProductCard } from './ProductCard'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Nenhum produto encontrado.</p>
        <a href="/" className="text-brand-green-dark text-sm mt-2 inline-block hover:underline">
          Ver todos os produtos
        </a>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
