import type { Metadata, Viewport } from 'next'
import { Nunito, Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { PwaInstallPopup } from '@/components/layout/PwaInstallPopup'
import { ServiceWorkerRegistrar } from '@/components/layout/ServiceWorkerRegistrar'
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

export const viewport: Viewport = {
  themeColor: '#A8D8A8',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'Cartas & Capítulos — Imprimíveis que encantam',
    template: '%s | Cartas & Capítulos',
  },
  description:
    'Jogos educativos, presentes para datas especiais e papelaria digital em PDF. Baixe e imprima em casa.',
  keywords: ['imprimíveis', 'PDF', 'jogos educativos', 'papelaria digital', 'Dia dos Pais', 'Dia das Mães'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cartas & Capítulos',
  },
  openGraph: {
    siteName: 'Cartas & Capítulos',
    locale: 'pt_BR',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} ${inter.variable}`}>
      <body>
        <ServiceWorkerRegistrar />
        {children}
        <Toaster richColors position="top-right" />
        <PwaInstallPopup />
      </body>
    </html>
  )
}
