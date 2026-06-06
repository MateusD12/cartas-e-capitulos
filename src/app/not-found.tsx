import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green/10 via-white to-brand-blue/10 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <FileQuestion size={48} className="text-gray-300 mx-auto mb-4" />
        <h1 className="font-display font-bold text-2xl text-gray-800">Página não encontrada</h1>
        <p className="text-gray-500 mt-2 text-sm">
          O endereço que você acessou não existe ou foi removido.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex items-center gap-2 bg-brand-green hover:bg-brand-green-dark text-gray-800 font-display font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Voltar para a loja
        </a>
      </div>
    </div>
  )
}
