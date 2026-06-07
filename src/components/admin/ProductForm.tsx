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

function joinValues(values: string[]): string | null {
  return values.length > 0 ? values.join(', ') : null
}

export function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [categoryOptions, setCategoryOptions] = useState<string[]>([])
  const [themeOptions, setThemeOptions] = useState<string[]>([])
  const [categoryInput, setCategoryInput] = useState(product?.category ?? '')
  const [categoryFocused, setCategoryFocused] = useState(false)
  const [themeInput, setThemeInput] = useState('')
  const [themeFocused, setThemeFocused] = useState(false)
  const [themeTags, setThemeTags] = useState<string[]>(
    product?.theme ? product.theme.split(',').map((tag) => tag.trim()).filter(Boolean) : []
  )
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    age_range: product?.age_range ?? '',
    is_active: product?.is_active ?? true,
  })
  const [coverFiles, setCoverFiles] = useState<File[]>([])
  const [pdfFiles, setPdfFiles] = useState<File[]>([])

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

  const filteredCategoryOptions = categoryOptions.filter((category) =>
    category.toLowerCase().includes(categoryInput.toLowerCase())
  )

  const filteredThemeOptions = themeOptions.filter(
    (theme) =>
      theme.toLowerCase().includes(themeInput.toLowerCase()) && !themeTags.includes(theme)
  )

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

  const uploadFiles = async (files: File[], bucket: string, slug: string) => {
    return Promise.all(
      files.map(async (file, index) => {
        const ext = file.name.split('.').pop() ?? 'bin'
        const path = `${slug}-${Date.now()}-${index}.${ext}`
        return uploadFile(file, bucket, path)
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const slug = slugify(form.name)
      const existingCoverUrls = product?.cover_image_url ? product.cover_image_url.split(',').map((item) => item.trim()).filter(Boolean) : []
      const existingPdfPaths = product?.pdf_storage_path ? product.pdf_storage_path.split(',').map((item) => item.trim()).filter(Boolean) : []

      let cover_image_url = joinValues(existingCoverUrls)
      let pdf_storage_path = joinValues(existingPdfPaths)

      if (coverFiles.length > 0) {
        const uploadedCoverUrls = await uploadFiles(coverFiles, 'product-covers', slug)
        cover_image_url = joinValues([...existingCoverUrls, ...uploadedCoverUrls])
      }

      if (pdfFiles.length > 0) {
        const uploadedPdfPaths = await uploadFiles(pdfFiles, 'product-pdfs', slug)
        pdf_storage_path = joinValues([...existingPdfPaths, ...uploadedPdfPaths])
      }

      const payload = {
        name: form.name,
        slug,
        description: form.description || null,
        price: parseFloat(form.price),
        category: categoryInput.trim() || null,
        age_range: form.age_range || null,
        theme: joinValues(themeTags),
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

  const existingCoverFiles = product?.cover_image_url ? product.cover_image_url.split(',').map((url) => url.trim()).filter(Boolean) : []
  const existingPdfFiles = product?.pdf_storage_path ? product.pdf_storage_path.split(',').map((path) => path.trim()).filter(Boolean) : []

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
            <p className="text-xs text-gray-500 mt-2">O slug será gerado automaticamente a partir do nome.</p>
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
            <div className="relative">
              <label className="text-sm font-medium text-gray-600">Categoria</label>
              <input
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onFocus={() => setCategoryFocused(true)}
                onBlur={() => setTimeout(() => setCategoryFocused(false), 150)}
                placeholder="Pesquisar ou adicionar"
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
              {categoryFocused && filteredCategoryOptions.length > 0 && (
                <div className="absolute left-0 right-0 z-10 mt-1 max-h-52 overflow-auto rounded-2xl border border-gray-200 bg-white shadow-lg">
                  {filteredCategoryOptions.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setCategoryInput(category)
                        setCategoryFocused(false)
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Digite ou selecione uma categoria. Se não existir, ela será criada automaticamente.</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Subcategorias</label>
            <p className="text-xs text-gray-500">Digite ou selecione uma subcategoria. Separe por vírgula para adicionar várias.</p>
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
            <div className="relative">
              <div className="mt-3 flex gap-2">
                <input
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  onFocus={() => setThemeFocused(true)}
                  onBlur={() => setTimeout(() => setThemeFocused(false), 150)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addThemeTag()
                    }
                  }}
                  placeholder="Pesquisar ou adicionar subcategoria"
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
              {themeFocused && filteredThemeOptions.length > 0 && (
                <div className="absolute left-0 right-0 z-10 mt-1 max-h-52 overflow-auto rounded-2xl border border-gray-200 bg-white shadow-lg">
                  {filteredThemeOptions.map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setThemeInput(theme)
                        setThemeFocused(false)
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
            <label className="text-sm font-medium text-gray-600">Imagens de capa</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setCoverFiles(Array.from(e.target.files ?? []))}
              className="mt-1 w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-green/20 file:text-gray-700 file:text-sm cursor-pointer"
            />
            {coverFiles.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">Selecionados: {coverFiles.map((file) => file.name).join(', ')}</p>
            )}
            {existingCoverFiles.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <p className="font-medium text-gray-700">Capa(s) atual(is):</p>
                {existingCoverFiles.map((url) => (
                  <p key={url} className="truncate">{url}</p>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Arquivos PDF</label>
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={(e) => setPdfFiles(Array.from(e.target.files ?? []))}
              className="mt-1 w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-gray-700 file:text-sm cursor-pointer"
            />
            {pdfFiles.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">Selecionados: {pdfFiles.map((file) => file.name).join(', ')}</p>
            )}
            {existingPdfFiles.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <p className="font-medium text-gray-700">PDF(s) atual(is):</p>
                {existingPdfFiles.map((path) => (
                  <p key={path} className="truncate">{path}</p>
                ))}
              </div>
            )}
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
