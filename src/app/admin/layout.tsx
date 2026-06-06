import { LayoutDashboard, Package, ShoppingBag, LogOut } from 'lucide-react'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/produtos', icon: Package, label: 'Produtos' },
  { href: '/admin/pedidos', icon: ShoppingBag, label: 'Pedidos' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <span className="font-display font-bold text-gray-800 text-sm">
            Cartas & Capítulos
          </span>
          <p className="text-xs text-gray-400 mt-0.5">Painel Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-brand-green/20 hover:text-gray-900 transition-colors"
            >
              <Icon size={16} />
              {label}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <a
            href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogOut size={16} />
            Sair
          </a>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
