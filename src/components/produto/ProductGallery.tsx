'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FileDown } from 'lucide-react'

interface ProductGalleryProps {
  coverUrl: string | null
  name: string
}

export function ProductGallery({ coverUrl, name }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)

  const images = coverUrl ? [coverUrl] : []

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-gradient-to-br from-brand-green/20 to-brand-blue/20 rounded-2xl flex items-center justify-center">
        <FileDown size={48} className="text-gray-300" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="aspect-[3/4] relative rounded-2xl overflow-hidden bg-gray-50">
        <Image
          src={images[selected]}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              aria-label={`Imagem ${i + 1}`}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                selected === i ? 'border-brand-green-dark' : 'border-transparent'
              }`}
            >
              <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
