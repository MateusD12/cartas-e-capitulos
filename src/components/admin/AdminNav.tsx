'use client'

import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, LogOut } from 'lucide-react'

const navItems = [
  { href: '/admin',          icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/produtos', icon: Package,          label: 'Produtos'  },
  { href: '/admin/pedidos',  icon: ShoppingBag,      label: 'Pedidos'   },
]

export function AdminNav() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <>
      {/* ── Sidebar desktop ─────────────────────────────── */}
      <aside className="hidden md:flex w-56 bg-white border-r border-gray-200 flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-100">
          <span className="font-display font-bold text-gray-800 text-sm">Cartas & Capítulos</span>
          <p className="text-xs text-gray-400 mt-0.5">Painel Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => (
            <a
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(href)
                  ? 'bg-brand-green/30 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-brand-green/15 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              {label}
            </a>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <a
            href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
            Sair
          </a>
        </div>
      </aside>

      {/* ── Bottom nav mobile ────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex">
        {navItems.map(({ href, icon: Icon, label }) => (
          <a
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs transition-colors ${
              isActive(href)
                ? 'text-brand-green-dark font-semibold'
                : 'text-gray-400'
            }`}
          >
            <Icon size={20} strokeWidth={isActive(href) ? 2.5 : 1.8} />
            {label}
          </a>
        ))}
        <a
          href="/api/auth/signout"
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs text-gray-400"
        >
          <LogOut size={20} strokeWidth={1.8} />
          Sair
        </a>
      </nav>
    </>
  )
}
