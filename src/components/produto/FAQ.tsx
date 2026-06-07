'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Como recebo o arquivo ap&oacute;s o pagamento?',
    a: 'Assim que o Pix for confirmado (normalmente em segundos), o bot&atilde;o de download fica dispon&iacute;vel na &aacute;rea "Meus Pedidos". Voc&ecirc; pode baixar o PDF quantas vezes quiser.',
  },
  {
    q: 'Posso imprimir em casa?',
    a: 'Sim! Todos os arquivos s&atilde;o otimizados para impress&atilde;o dom&eacute;stica em papel A4. Recomendamos papel 180g para melhor resultado.',
  },
  {
    q: 'Quantas vezes posso baixar o arquivo?',
    a: 'Sem limite. O arquivo fica dispon&iacute;vel permanentemente na sua conta.',
  },
  {
    q: 'Posso compartilhar o arquivo?',
    a: 'Os arquivos s&atilde;o para uso pessoal e familiar. N&atilde;o &eacute; permitida a revenda ou distribui&ccedil;&atilde;o em massa.',
  },
  {
    q: 'E se meu pagamento n&atilde;o for confirmado?',
    a: 'O Pix tem validade de 15 minutos. Se expirar sem confirma&ccedil;&atilde;o, basta fazer um novo pedido. Em caso de d&uacute;vidas, entre em contato.',
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
