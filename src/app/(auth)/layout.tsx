export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green/20 via-white to-brand-blue/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <span className="text-2xl font-display font-bold text-gray-800">
              Cartas <span className="text-brand-green-dark">&</span> Capítulos
            </span>
          </a>
        </div>
        {children}
      </div>
    </div>
  )
}
