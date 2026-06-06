export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-display font-bold text-gray-800">
              Cartas <span className="text-brand-green-dark">&</span> Capítulos
            </span>
            <p className="text-xs text-gray-400 mt-1">Imprimíveis que encantam</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="/?categoria=educativo" className="hover:text-gray-800 transition-colors">Educativo</a>
            <a href="/?categoria=datas_especiais" className="hover:text-gray-800 transition-colors">Datas Especiais</a>
            <a href="/?categoria=papelaria" className="hover:text-gray-800 transition-colors">Papelaria</a>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Cartas & Capítulos. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
