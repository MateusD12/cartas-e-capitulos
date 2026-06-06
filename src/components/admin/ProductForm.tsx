'use client'

import { useState, useEffect } from 'react'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import type { Product, ProductCategory } from '@/types'

const categories: { value: ProductCategory; label: string }[] = [
  { value: 'educativo', label: 'Educativo' },
  { value: 'datas_especiais', label: 'Datas Especiais' },
  { value: 'papelaria', label: 'Papelaria' },
]

interface ProductFormProps {
  product?: Product | null
  onClose: () => void
  onSaved: () => void
}

export function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    category: (product?.category ?? 'educativo') as ProductCategory,
    age_range: product?.age_range ?? '',
    theme: product?.theme ?? '',
    is_active: product?.is_active ?? true,
  })
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  useEffect(() => {
    if (!product) setForm((f) => ({ ...f, slug: slugify(f.name) }))
  }, [form.name, product])

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) throw error
    if (bucket === 'product-covers') {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return data.publicUrl
    }
    return path
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      let cover_image_url = product?.cover_image_url
      let pdf_storage_path = product?.pdf_storage_path

      if (coverFile) {
        const ext = coverFile.name.split('.').pop()
        cover_image_url = await uploadFile(coverFile, 'product-covers', `${form.slug}.${ext}`)
      }
      if (pdfFile) {
        const ext = pdfFile.name.split('.').pop()
        pdf_storage_path = await uploadFile(pdfFile, 'product-pdfs', `${form.slug}.${ext}`)
      }

      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        price: parseFloat(form.price),
        category: form.category,
        age_range: form.age_range || null,
        theme: form.theme || null,
        cover_image_url,
        pdf_storage_path,
        is_active: form.is_active,
      }

      const { error } = product
        ? await supabase.from('products').update(payload).eq('id', product.id)
        : await supabase.from('products').insert(payload)

      if (error) throw error
      toast.success(product ? 'Produto atualizado!' : 'Produto criado!')
      onSaved()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar produto')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display font-bold text-gray-800">
            {product ? 'Editar produto' : 'Novo produto'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Nome</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Slug (URL)</label>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-green" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Descrição</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-green" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Preço (R$)</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Categoria</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green bg-white">
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Faixa etária</label>
              <input value={form.age_range} onChange={(e) => setForm({ ...form, age_range: e.target.value })} placeholder="Ex: 3-6 anos"
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Tema</label>
              <input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} placeholder="Ex: Dia dos Pais"
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Imagem de capa</label>
            <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-green/20 file:text-gray-700 file:text-sm cursor-pointer" />
            {product?.cover_image_url && <p className="text-xs text-gray-400 mt-1">Capa atual: {product.cover_image_url.split('/').pop()}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Arquivo PDF</label>
            <input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-gray-700 file:text-sm cursor-pointer" />
            {product?.pdf_storage_path && <p className="text-xs text-gray-400 mt-1">PDF atual: {product.pdf_storage_path.split('/').pop()}</p>}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-brand-green-dark" />
            <label htmlFor="is_active" className="text-sm text-gray-600">Produto ativo (visível na loja)</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 bg-brand-green hover:bg-brand-green-dark text-gray-800 font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
