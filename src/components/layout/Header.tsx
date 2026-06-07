'use client'

import {
  ShoppingBag,
  User,
  Heart,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  BookOpen,
  Gift,
  ClipboardList,
  LogIn,
  UserPlus,
  Store,
  ChevronDown,
  Folder,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { getCategoryLabel } from '@/lib/utils'

const defaultCategories = [
  { href: '/?categoria=educativo', icon: BookOpen, label: 'Educativo', color: 'text-green-600 bg-green-50' },
  { href: '/?categoria=datas_especiais', icon: Gift, label: 'Datas Especiais', color: 'text-pink-500 bg-pink-50' },
  { href: '/?categoria=papelaria', icon: ClipboardList, label: 'Papelaria', color: 'text-blue-600 bg-blue-50' },
]

export function Header() {
  const { user, profile, loading, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [menuCategories, setMenuCategories] = useState<Array<{ category: string; themes: string[] }>>([])
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    async function loadMenu() {
      const { data } = await supabase.from('products').select('category, theme').eq('is_active', true)
      const map = new Map<string, Set<string>>()

      ;(data ?? []).forEach((item: { category: string | null; theme: string | null }) => {
        const category = item.category?.trim() || 'Sem categoria'
        const themes = item.theme
          ? item.theme
              .split(',')
              .map((theme) => theme.trim())
              .filter(Boolean)
          : []

        if (!map.has(category)) map.set(category, new Set())
        themes.forEach((theme) => map.get(category)?.add(theme))
      })

      setMenuCategories(
        Array.from(map.entries()).map(([category, themes]) => ({
          category,
          themes: Array.from(themes).sort((a, b) => a.localeCompare(b, 'pt-BR')),
        }))
      )
    }

    loadMenu()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const categories = menuCategories.length > 0 ? menuCategories.map((item) => ({
    href: `/?categoria=${encodeURIComponent(item.category)}`,
    icon: BookOpen,
    label: item.category,
    color: 'text-gray-700 bg-gray-100',
  })) : defaultCategories

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <a href="/" className="font-display font-bold text-xl text-gray-800 hover:opacity-80 transition-opacity">
            Cartas <span className="text-brand-green-dark">&</span> Capítulos
          </a>

          {/* Nav desktop */}
          {/* categorias agora aparecem no painel lateral da página principal */}

          {/* Ações desktop */}
          <div className="hidden md:flex items-center gap-2">
            {loading ? null : user ? (
              <>
                <a href="/cliente/conta" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <User size={15} /> Minha conta
                </a>
                <a href="/cliente/favoritos" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <Heart size={15} /> Favoritos
                </a>
                <a href="/cliente/pedidos" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <ShoppingBag size={15} /> Meus pedidos
                </a>
                {profile?.is_admin && (
                  <a href="/admin" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <LayoutDashboard size={15} /> Admin
                  </a>
                )}
                <button onClick={signOut} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  <LogOut size={15} /> Sair
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 transition-colors">
                  Entrar
                </a>
                <a href="/cadastro" className="flex items-center gap-1.5 text-sm bg-brand-green hover:bg-brand-green-dark text-gray-800 font-medium px-4 py-1.5 rounded-lg transition-colors">
                  <User size={15} /> Criar conta
                </a>
              </>
            )}
          </div>

          {/* Botão hamburguer mobile */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* ── Drawer mobile ──────────────────────────────────────── */}
      <div
        onClick={() => setOpen(false)}
        className={`md:hidden fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      <div
        className={`md:hidden fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-display font-bold text-gray-800">
            Cartas <span className="text-brand-green-dark">&</span> Capítulos
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Navegação</p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  router.push('/')
                  setOpen(false)
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 flex-shrink-0">
                  <Store size={16} />
                </span>
                <span className="text-sm font-medium text-gray-700">Início</span>
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Catálogo</p>
              <button
                type="button"
                onClick={() => setCatalogOpen((current) => !current)}
                className="text-xs font-medium text-brand-green hover:text-brand-green-dark"
              >
                {catalogOpen ? 'Fechar' : 'Abrir'}
              </button>
            </div>
            {catalogOpen ? (
              <div className="space-y-1">
                {menuCategories.length === 0 ? (
                  defaultCategories.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                        <item.icon size={16} />
                      </span>
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </a>
                  ))
                ) : (
                  menuCategories.map((item) => (
                    <div key={item.category} className="rounded-2xl border border-gray-100 bg-gray-50">
                      <button
                        type="button"
                        onClick={() => setExpandedCategory((current) => (current === item.category ? null : item.category))}
                        onDoubleClick={() => {
                          router.push(`/?categoria=${encodeURIComponent(item.category)}`)
                          setOpen(false)
                        }}
                        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Folder size={16} />
                          {item.category}
                        </span>
                        <ChevronDown className={`transition ${expandedCategory === item.category ? 'rotate-180' : ''}`} size={16} />
                      </button>
                      <div className="px-3 pb-2">
                        <p className="text-[11px] text-gray-400 mb-2">Clique uma vez para abrir; duas vezes para filtrar</p>
                        {expandedCategory === item.category && item.themes.length > 0 && (
                          <div className="space-y-1">
                            {item.themes.map((theme) => (
                              <button
                                key={theme}
                                type="button"
                                onDoubleClick={() => {
                                  router.push(`/?categoria=${encodeURIComponent(item.category)}&tema=${encodeURIComponent(theme)}`)
                                  setOpen(false)
                                }}
                                className="w-full rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-white hover:text-gray-900 transition-colors"
                              >
                                {theme}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Minha Conta</p>
            <div className="space-y-1">
              {loading ? null : user ? (
                <>
                  <a href="/cliente/conta" onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600 flex-shrink-0">
                      <User size={16} />
                    </span>
                    <span className="text-sm font-medium text-gray-700">Minha conta</span>
                  </a>
                  <a href="/cliente/favoritos" onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-pink-50 text-pink-600 flex-shrink-0">
                      <Heart size={16} />
                    </span>
                    <span className="text-sm font-medium text-gray-700">Favoritos</span>
                  </a>
                  <a href="/cliente/pedidos" onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-green/20 text-green-700 flex-shrink-0">
                      <ShoppingBag size={16} />
                    </span>
                    <span className="text-sm font-medium text-gray-700">Meus pedidos</span>
                  </a>
                  {profile?.is_admin && (
                    <a href="/admin" onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600 flex-shrink-0">
                        <LayoutDashboard size={16} />
                      </span>
                      <span className="text-sm font-medium text-gray-700">Painel Admin</span>
                    </a>
                  )}
                  <button onClick={() => { setOpen(false); signOut() }}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600 flex-shrink-0">
                      <LogOut size={16} />
                    </span>
                    <span className="text-sm font-medium text-gray-700">Sair</span>
                  </button>
                </>
              ) : (
                <>
                  <a href="/login" onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600 flex-shrink-0">
                      <LogIn size={16} />
                    </span>
                    <span className="text-sm font-medium text-gray-700">Entrar</span>
                  </a>
                  <a href="/cadastro" onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl bg-brand-green/10 hover:bg-brand-green/20 transition-colors">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-green text-gray-800 flex-shrink-0">
                      <UserPlus size={16} />
                    </span>
                    <span className="text-sm font-semibold text-gray-800">Criar conta grátis</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
