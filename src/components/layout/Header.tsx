'use client'

import {
  ShoppingBag, User, LogOut, LayoutDashboard,
  Menu, X, BookOpen, Gift, ClipboardList, LogIn, UserPlus, Store,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

const categories = [
  { href: '/?categoria=educativo',       icon: BookOpen,      label: 'Educativo',       color: 'text-green-600 bg-green-50'  },
  { href: '/?categoria=datas_especiais', icon: Gift,          label: 'Datas Especiais', color: 'text-pink-500 bg-pink-50'    },
  { href: '/?categoria=papelaria',       icon: ClipboardList, label: 'Papelaria',       color: 'text-blue-600 bg-blue-50'    },
]

export function Header() {
  const { user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  // Fechar com ESC e travar scroll do body
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <a href="/" className="font-display font-bold text-xl text-gray-800 hover:opacity-80 transition-opacity">
            Cartas <span className="text-brand-green-dark">&</span> Capítulos
          </a>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {categories.map((c) => (
              <a key={c.href} href={c.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                {c.label}
              </a>
            ))}
          </nav>

          {/* Ações desktop */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {profile?.is_admin && (
                  <a href="/admin" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <LayoutDashboard size={15} /> Admin
                  </a>
                )}
                <a href="/cliente/pedidos" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <ShoppingBag size={15} /> Meus pedidos
                </a>
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

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`md:hidden fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Painel lateral */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        {/* Header do drawer */}
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

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">

          {/* Categorias */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Categorias</p>
            <div className="space-y-1">
              {categories.map((c) => (
                <a
                  key={c.href}
                  href={c.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c.color}`}>
                    <c.icon size={16} />
                  </span>
                  <span className="text-sm font-medium text-gray-700">{c.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Conta */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Minha Conta</p>
            <div className="space-y-1">
              {user ? (
                <>
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

        {/* Footer do drawer */}
        <div className="border-t border-gray-100 p-4 space-y-1">
          <a href="/" onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 flex-shrink-0">
              <Store size={15} />
            </span>
            <span className="text-sm text-gray-500">Ver toda a loja</span>
          </a>

          {user && (
            <button onClick={() => { setOpen(false); signOut() }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-400 flex-shrink-0">
                <LogOut size={15} />
              </span>
              <span className="text-sm text-red-400">Sair</span>
            </button>
          )}
        </div>
      </div>
    </>
  )
}
