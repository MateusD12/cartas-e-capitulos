import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cartas-e-capitulos.vercel.app'

  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('slug, created_at')
    .eq('is_active', true)

  const productUrls = (products ?? []).map((p) => ({
    url: `${baseUrl}/produto/${p.slug}`,
    lastModified: new Date(p.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: baseUrl,              lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${baseUrl}/politica`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ...productUrls,
  ]
}
