'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Como recebo o arquivo após o pagamento?',
    a: 'Assim que o Pix for confirmado (normalmente em segundos), o botão de download fica disponível na área "Meus Pedidos". Você pode baixar o PDF quantas vezes quiser.',
  },
  {
    q: 'Posso imprimir em casa?',
    a: 'Sim! Todos os arquivos são otimizados para impressão doméstica em papel A4. Recomendamos papel 180g para melhor resultado.',
  },
  {
    q: 'Quantas vezes posso baixar o arquivo?',
    a: 'Sem limite. O arquivo fica disponível permanentemente na sua conta.',
  },
  {
    q: 'Posso compartilhar o arquivo?',
    a: 'Os arquivos são para uso pessoal e familiar. Não é permitida a revenda ou distribuição em massa.',
  },
  {
    q: 'E se meu pagamento não for confirmado?',
    a: 'O Pix tem validade de 15 minutos. Se expirar sem confirmação, basta fazer um novo pedido. Em caso de dúvidas, entre em contato.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="font-medium text-gray-800 text-sm pr-4">{faq.q}</span>
            <ChevronDown
              size={16}
              className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
            />
          </button>
          {open === i && (
            <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
