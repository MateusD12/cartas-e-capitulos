import { AdminNav } from '@/components/admin/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      {/* pb-20: espaço para o bottom nav no mobile */}
      <main className="flex-1 p-4 md:p-8 overflow-auto pb-20 md:pb-8">
        {children}
      </main>
    </div>
  )
}
