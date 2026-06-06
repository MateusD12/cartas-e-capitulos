export const metadata = {
  title: 'Política de Reembolso',
}

export default function PoliticaPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-display font-bold text-3xl text-gray-800 mb-8">Política de Reembolso</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
        <section>
          <h2 className="font-display font-semibold text-lg text-gray-800 mb-3">Produtos digitais</h2>
          <p>
            Todos os produtos vendidos na Cartas & Capítulos são arquivos digitais em formato PDF entregues
            por download imediato. Por serem produtos digitais, a entrega ocorre no ato da confirmação do
            pagamento e não é possível "devolver" o arquivo após o download.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg text-gray-800 mb-3">Quando reembolsamos</h2>
          <p>Realizamos reembolso integral nas seguintes situações:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>O arquivo não abre no seu computador, tablet ou smartphone</li>
            <li>O conteúdo do arquivo é significativamente diferente do descrito na página do produto</li>
            <li>O arquivo está corrompido ou incompleto</li>
            <li>Você foi cobrado em duplicidade pelo mesmo produto</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg text-gray-800 mb-3">Como solicitar</h2>
          <p>
            Envie um e-mail para{' '}
            <a href="mailto:contato@cartasecapitulos.com.br" className="text-brand-green-dark underline">
              contato@cartasecapitulos.com.br
            </a>{' '}
            com o assunto <strong>"Reembolso"</strong>, informando:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Seu nome completo</li>
            <li>E-mail usado na compra</li>
            <li>Nome do produto</li>
            <li>Descrição do problema</li>
          </ul>
          <p className="mt-3">
            Respondemos em até <strong>2 dias úteis</strong>. O reembolso é processado pelo Mercado Pago
            em até 7 dias corridos após a aprovação.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg text-gray-800 mb-3">Prazo</h2>
          <p>
            Solicitações de reembolso devem ser feitas em até <strong>7 dias corridos</strong> após a
            data da compra, conforme o Código de Defesa do Consumidor (Art. 49).
          </p>
        </section>
      </div>
    </div>
  )
}
