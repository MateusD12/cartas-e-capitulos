'use client'

import { ShoppingBag, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const { user, profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="font-display font-bold text-xl text-gray-800 hover:opacity-80 transition-opacity">
          Cartas <span className="text-brand-green-dark">&</span> Capítulos
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="/?categoria=educativo" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Educativo
          </a>
          <a href="/?categoria=datas_especiais" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Datas Especiais
          </a>
          <a href="/?categoria=papelaria" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Papelaria
          </a>
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {profile?.is_admin && (
                <a
                  href="/admin"
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
                >
                  <LayoutDashboard size={15} />
                  Admin
                </a>
              )}
              <a
                href="/cliente/pedidos"
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
              >
                <ShoppingBag size={15} />
                Meus pedidos
              </a>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                <LogOut size={15} />
                Sair
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5"
              >
                Entrar
              </a>
              <a
                href="/cadastro"
                className="flex items-center gap-1.5 text-sm bg-brand-green hover:bg-brand-green-dark text-gray-800 font-medium px-4 py-1.5 rounded-lg transition-colors"
              >
                <User size={15} />
                Criar conta
              </a>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
          <a href="/?categoria=educativo" className="block py-2 text-sm text-gray-600">Educativo</a>
          <a href="/?categoria=datas_especiais" className="block py-2 text-sm text-gray-600">Datas Especiais</a>
          <a href="/?categoria=papelaria" className="block py-2 text-sm text-gray-600">Papelaria</a>
          <div className="pt-2 border-t border-gray-100">
            {user ? (
              <>
                <a href="/cliente/pedidos" className="block py-2 text-sm text-gray-600">Meus pedidos</a>
                {profile?.is_admin && <a href="/admin" className="block py-2 text-sm text-gray-600">Admin</a>}
                <button onClick={signOut} className="block py-2 text-sm text-red-500">Sair</button>
              </>
            ) : (
              <>
                <a href="/login" className="block py-2 text-sm text-gray-600">Entrar</a>
                <a href="/cadastro" className="block py-2 text-sm text-gray-600 font-medium">Criar conta</a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
