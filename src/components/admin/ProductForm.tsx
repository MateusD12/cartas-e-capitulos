'use client'

import { useState, useEffect } from 'react'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductFormProps {
  product?: Product | null
  onClose: () => void
  onSaved: () => void
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
}

export function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [categoryOptions, setCategoryOptions] = useState<string[]>([])
  const [themeOptions, setThemeOptions] = useState<string[]>([])
  const [themeInput, setThemeInput] = useState('')
  const [themeTags, setThemeTags] = useState<string[]>(
    product?.theme ? product.theme.split(',').map((tag) => tag.trim()).filter(Boolean) : []
  )
  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    category: product?.category ?? '',
    age_range: product?.age_range ?? '',
    is_active: product?.is_active ?? true,
  })
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  useEffect(() => {
    if (!product) setForm((f) => ({ ...f, slug: slugify(f.name) }))
  }, [form.name, product])

  useEffect(() => {
    const loadOptions = async () => {
      const { data } = await supabase.from('products').select('category, theme').order('created_at', { ascending: false })
      const categories = unique((data ?? []).map((item: any) => item.category ?? ''))
      const themes = unique(
        (data ?? [])
          .flatMap((item: any) => (item.theme ? item.theme.split(',').map((t: string) => t.trim()) : []))
          .filter(Boolean)
      )
      setCategoryOptions(categories.filter(Boolean))
      setThemeOptions(themes)
    }

    loadOptions()
  }, [supabase])

  const addThemeTag = () => {
    const values = themeInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
    if (values.length === 0) return
    setThemeTags((current) => unique([...current, ...values]))
    setThemeInput('')
  }

  const removeThemeTag = (tagToRemove: string) => {
    setThemeTags((current) => current.filter((tag) => tag !== tagToRemove))
  }

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
        category: form.category.trim() || null,
        age_range: form.age_range || null,
        theme: themeTags.length > 0 ? themeTags.join(', ') : null,
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
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Slug (URL)</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Categoria</label>
              <input
                list="category-options"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Digite ou selecione"
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
              <datalist id="category-options">
                {categoryOptions.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Subcategorias</label>
            <p className="text-xs text-gray-500">Separe por vírgula para vincular múltiplas subcategorias.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {themeTags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                  {tag}
                  <button type="button" onClick={() => removeThemeTag(tag)} className="text-gray-400 hover:text-gray-600">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                list="theme-options"
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addThemeTag()
                  }
                }}
                placeholder="Ex: Dia dos Pais, Matemática"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
              <button
                type="button"
                onClick={addThemeTag}
                className="rounded-xl bg-brand-green px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-brand-green-dark transition"
              >
                Adicionar
              </button>
            </div>
            <datalist id="theme-options">
              {themeOptions.map((theme) => (
                <option key={theme} value={theme} />
              ))}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Faixa etária</label>
              <input
                value={form.age_range}
                onChange={(e) => setForm({ ...form, age_range: e.target.value })}
                placeholder="Ex: 3-6 anos"
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Tema principal</label>
              <input
                value={themeTags[0] ?? ''}
                disabled
                placeholder="Use as tags acima"
                className="mt-1 w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Imagem de capa</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-green/20 file:text-gray-700 file:text-sm cursor-pointer"
            />
            {product?.cover_image_url && <p className="text-xs text-gray-400 mt-1">Capa atual: {product.cover_image_url.split('/').pop()}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Arquivo PDF</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-gray-700 file:text-sm cursor-pointer"
            />
            {product?.pdf_storage_path && <p className="text-xs text-gray-400 mt-1">PDF atual: {product.pdf_storage_path.split('/').pop()}</p>}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 accent-brand-green-dark"
            />
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
