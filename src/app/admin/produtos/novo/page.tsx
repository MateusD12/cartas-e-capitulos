'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ProductForm } from '@/components/admin/ProductForm'

export default function NewAdminProductPage() {
  const router = useRouter()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push('/admin/produtos')}
          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <div>
          <p className="text-sm text-gray-500">Administração de produtos</p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900">Novo produto</h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm">
        <ProductForm
          product={null}
          onClose={() => router.push('/admin/produtos')}
          onSaved={() => router.push('/admin/produtos')}
          variant="page"
        />
      </div>
    </div>
  )
}
