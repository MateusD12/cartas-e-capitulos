'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Power } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { ProductForm } from '@/components/admin/ProductForm'
import { formatCurrency, getCategoryLabel } from '@/lib/utils'
import type { Product } from '@/types'

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts((data ?? []) as Product[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  const toggleActive = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)
    if (error) { toast.error('Erro ao atualizar produto'); return }
    toast.success(product.is_active ? 'Produto desativado' : 'Produto ativado')
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-2xl text-gray-800">Produtos</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-brand-green hover:bg-brand-green-dark text-gray-800 font-medium px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} />
          Novo produto
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-gray-500 font-medium">Nome</th>
                <th className="text-left p-4 text-gray-500 font-medium hidden md:table-cell">Categoria</th>
                <th className="text-left p-4 text-gray-500 font-medium hidden lg:table-cell">Tema</th>
                <th className="text-right p-4 text-gray-500 font-medium">Preço</th>
                <th className="text-center p-4 text-gray-500 font-medium">Status</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{p.name}</td>
                  <td className="p-4 text-gray-500 hidden md:table-cell">{getCategoryLabel(p.category)}</td>
                  <td className="p-4 text-gray-400 hidden lg:table-cell">{p.theme ?? '—'}</td>
                  <td className="p-4 text-right font-medium text-gray-900">{formatCurrency(p.price)}</td>
                  <td className="p-4 text-center">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${p.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {p.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => { setEditing(p); setShowForm(true) }}
                        aria-label="Editar"
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => toggleActive(p)}
                        aria-label={p.is_active ? 'Desativar' : 'Ativar'}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <Power size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400">
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load() }}
        />
      )}
    </div>
  )
}
