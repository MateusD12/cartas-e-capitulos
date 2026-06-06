import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/produto/ProductGrid'
import { SkeletonGrid } from '@/components/produto/SkeletonCard'
import type { Product, ProductCategory } from '@/types'

const categories: { value: ProductCategory; label: string }[] = [
  { value: 'educativo', label: 'Educativo' },
  { value: 'datas_especiais', label: 'Datas Especiais' },
  { value: 'papelaria', label: 'Papelaria' },
]

const howItWorks = [
  {
    step: '1',
    title: 'Escolha seu produto',
    desc: 'Navegue pelo catálogo e encontre o imprimível perfeito para a ocasião.',
    color: 'bg-brand-green/20 text-green-700',
  },
  {
    step: '2',
    title: 'Pague com Pix',
    desc: 'Checkout rápido e seguro. O QR Code expira em 15 minutos.',
    color: 'bg-brand-blue/20 text-blue-700',
  },
  {
    step: '3',
    title: 'Baixe na hora',
    desc: 'Assim que o pagamento for confirmado, o PDF fica disponível para download.',
    color: 'bg-purple-100 text-purple-700',
  },
]

const categoryCards = [
  {
    title: 'Educativo',
    emoji: '🎲',
    desc: 'Jogos e atividades pedagógicas para crianças de 2 a 12 anos. Matemática, Português, lógica e muito mais.',
    href: '/?categoria=educativo',
    gradient: 'from-green-50 to-brand-green/20',
    border: 'border-green-100',
  },
  {
    title: 'Datas Especiais',
    emoji: '🎁',
    desc: 'Kits para Dia dos Pais, Dia das Mães, aniversários, Natal e outras datas que merecem um presente especial.',
    href: '/?categoria=datas_especiais',
    gradient: 'from-pink-50 to-rose-100/50',
    border: 'border-pink-100',
  },
  {
    title: 'Papelaria',
    emoji: '📋',
    desc: 'Planejadores, listas, organizadores e cadernos digitais para o dia a dia mais produtivo.',
    href: '/?categoria=papelaria',
    gradient: 'from-blue-50 to-brand-blue/20',
    border: 'border-blue-100',
  },
]

const benefits = [
  { icon: '⚡', title: 'Download imediato', desc: 'Acesso ao PDF segundos após o pagamento ser aprovado.' },
  { icon: '♾️', title: 'Acesso permanente', desc: 'Baixe quantas vezes quiser. O arquivo não expira.' },
  { icon: '🖨️', title: 'Pronto para imprimir', desc: 'Arquivos otimizados para papel A4 em casa ou gráfica.' },
  { icon: '🔒', title: 'Pagamento seguro', desc: 'Pix via Mercado Pago. Sem cadastro de cartão.' },
]

async function fetchProducts(categoria?: string, tema?: string): Promise<Product[]> {
  const supabase = await createClient()
  let query = supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false })
  if (categoria) query = query.eq('category', categoria)
  if (tema) query = query.ilike('theme', `%${tema}%`)
  const { data } = await query
  return (data ?? []) as Product[]
}

interface PageProps {
  searchParams: Promise<{ categoria?: string; tema?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const { categoria, tema } = await searchParams
  const products = await fetchProducts(categoria, tema)

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-green/30 via-white to-brand-blue/30 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <span className="inline-block bg-white/80 border border-brand-green/40 text-brand-green-dark text-xs font-semibold px-3 py-1 rounded-full mb-5 tracking-wide">
            ✨ Imprimíveis digitais em PDF
          </span>
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-gray-800 leading-tight">
            Presentes e atividades<br className="hidden md:block" />
            que <span className="text-brand-green-dark">encantam</span>
          </h1>
          <p className="mt-5 text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Jogos educativos para crianças, kits para datas especiais e papelaria digital.
            Escolha, pague com Pix e baixe na hora.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#catalogo"
              className="inline-flex items-center gap-2 bg-brand-green hover:bg-brand-green-dark text-gray-800 font-display font-semibold px-8 py-3.5 rounded-full transition-colors shadow-sm"
            >
              Ver catálogo ↓
            </a>
            <a
              href="#como-funciona"
              className="inline-flex items-center gap-2 bg-white/70 hover:bg-white border border-gray-200 text-gray-600 font-medium px-6 py-3.5 rounded-full transition-colors"
            >
              Como funciona?
            </a>
          </div>
        </div>
      </section>

      {/* ── Como Funciona ──────────────────────────────────── */}
      <section id="como-funciona" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-800">
              Simples assim
            </h2>
            <p className="text-gray-500 mt-2">Do clique ao download em menos de 2 minutos</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {howItWorks.map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center p-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-xl mb-4 ${item.color}`}>
                  {item.step}
                </div>
                <h3 className="font-display font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                {/* Conector */}
                {item.step !== '3' && (
                  <div className="hidden md:block absolute right-0 top-1/3 translate-x-1/2 text-gray-200 text-2xl select-none">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categorias ─────────────────────────────────────── */}
      <section className="py-16 bg-gray-50/60">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-800">
              O que você vai encontrar
            </h2>
            <p className="text-gray-500 mt-2">Três categorias, um jeito fácil de surpreender</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {categoryCards.map((cat) => (
              <a
                key={cat.title}
                href={cat.href}
                className={`group block bg-gradient-to-br ${cat.gradient} border ${cat.border} rounded-2xl p-6 hover:shadow-md transition-all duration-200`}
              >
                <span className="text-4xl">{cat.emoji}</span>
                <h3 className="font-display font-bold text-lg text-gray-800 mt-3 mb-2">{cat.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{cat.desc}</p>
                <span className="inline-block mt-4 text-xs font-semibold text-gray-500 group-hover:text-gray-700 transition-colors">
                  Explorar {cat.title} →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vantagens ──────────────────────────────────────── */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="text-center">
                <span className="text-3xl">{b.icon}</span>
                <h4 className="font-display font-semibold text-gray-800 mt-3 mb-1 text-sm">{b.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Catálogo ───────────────────────────────────────── */}
      <section id="catalogo" className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-bold text-2xl text-gray-800">
            {categoria ? `${categories.find(c => c.value === categoria)?.label ?? 'Produtos'}` : 'Todos os produtos'}
          </h2>
          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            <a
              href="/"
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !categoria ? 'bg-brand-green text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos
            </a>
            {categories.map((cat) => (
              <a
                key={cat.value}
                href={`/?categoria=${cat.value}`}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  categoria === cat.value ? 'bg-brand-green text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </a>
            ))}
            {(categoria || tema) && (
              <a href="/" className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Limpar ×
              </a>
            )}
          </div>
        </div>

        <Suspense fallback={<SkeletonGrid />}>
          <ProductGrid products={products} />
        </Suspense>
      </section>
    </>
  )
}
