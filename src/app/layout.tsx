import type { Metadata } from 'next'
import { Nunito, Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Cartas & Capítulos — Imprimíveis que encantam',
    template: '%s | Cartas & Capítulos',
  },
  description:
    'Jogos educativos, presentes para datas especiais e papelaria digital em PDF. Baixe e imprima em casa.',
  keywords: ['imprimíveis', 'PDF', 'jogos educativos', 'papelaria digital', 'Dia dos Pais', 'Dia das Mães'],
  openGraph: {
    siteName: 'Cartas & Capítulos',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} ${inter.variable}`}>
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
