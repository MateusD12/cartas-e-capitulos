'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FileDown } from 'lucide-react'

interface ProductGalleryProps {
  coverUrl: string | null
  previewUrls?: string[]
  name: string
}

export function ProductGallery({ coverUrl, previewUrls = [], name }: ProductGalleryProps) {
  const images = [
    ...(coverUrl ? [coverUrl] : []),
    ...previewUrls,
  ]

  const [selected, setSelected] = useState(0)

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
          alt={selected === 0 ? name : `Preview ${selected} — ${name}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        {selected > 0 && (
          <div className="absolute top-2 left-2 bg-brand-blue/90 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
            Preview
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              aria-label={i === 0 ? 'Capa' : `Preview ${i}`}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                selected === i ? 'border-brand-green-dark shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
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
