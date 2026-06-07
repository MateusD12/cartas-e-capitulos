'use client'

import { useAuth } from '@/hooks/useAuth'

export function Footer() {
  const { user, loading } = useAuth()

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Marca */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-display font-bold text-gray-800">
              Cartas <span className="text-brand-green-dark">&</span> Capítulos
            </span>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Imprimíveis digitais que encantam — jogos educativos, datas especiais e papelaria.
            </p>
          </div>

          {/* Categorias */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Categorias</h4>
            <ul className="space-y-2">
              <li><a href="/?categoria=educativo"       className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Educativo</a></li>
              <li><a href="/?categoria=datas_especiais" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Datas Especiais</a></li>
              <li><a href="/?categoria=papelaria"       className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Papelaria</a></li>
            </ul>
          </div>

          {/* Conta */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Minha Conta</h4>
            <ul className="space-y-2">
              {loading ? (
                <li>
                  <span className="text-sm text-gray-500">Carregando...</span>
                </li>
              ) : user ? (
                <>
                  <li><a href="/cliente/conta" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Minha conta</a></li>
                  <li><a href="/cliente/favoritos" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Favoritos</a></li>
                  <li><a href="/cliente/pedidos" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Meus pedidos</a></li>
                </>
              ) : (
                <>
                  <li><a href="/login" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Entrar</a></li>
                  <li><a href="/cadastro" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Criar conta</a></li>
                  <li><a href="/cliente/pedidos" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Meus pedidos</a></li>
                </>
              )}
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Ajuda</h4>
            <ul className="space-y-2">
              <li><a href="/politica" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Política de reembolso</a></li>
              <li>
                <a href="mailto:contato@cartasecapitulos.com.br" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
                  contato@cartasecapitulos.com.br
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Cartas & Capítulos. Todos os direitos reservados.
          </p>
          <p className="text-xs text-gray-300">
            Pagamentos processados pelo Mercado Pago
          </p>
        </div>
      </div>
    </footer>
  )
}
