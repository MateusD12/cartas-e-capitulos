# Cartas & Capítulos

E-commerce de imprimíveis digitais (PDF) — jogos educativos, presentes para datas especiais e papelaria.

## Pré-requisitos

- Node.js 20+
- Conta Supabase (projeto "Financeiro" — ref `bgoteptsgdqwnlgqdzjg`)
- Conta Mercado Pago (com MP_ACCESS_TOKEN de produção ou sandbox)

## Instalação

```bash
cd cartas-e-capitulos
npm install
```

## Variáveis de Ambiente

Preencha o `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://bgoteptsgdqwnlgqdzjg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

MP_ACCESS_TOKEN=<mercado_pago_access_token>
MP_WEBHOOK_SECRET=<webhook_secret>

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Schema SQL no Supabase

1. Acesse o painel do Supabase → SQL Editor
2. Cole e execute o conteúdo de `supabase/schema.sql`

## Buckets no Supabase Storage

Crie dois buckets no painel Supabase → Storage:

| Bucket | Visibilidade | Uso |
|--------|-------------|-----|
| `product-covers` | Público | Imagens de capa dos produtos |
| `product-pdfs` | Privado | Arquivos PDF protegidos |

## Google OAuth

1. Supabase → Authentication → Providers → Google
2. Adicione Client ID e Client Secret do Google Cloud Console
3. URL de callback: `https://<seu-dominio>/auth/callback`

## Webhook Mercado Pago

1. Painel Mercado Pago → Suas integrações → Webhooks
2. URL: `https://<seu-dominio>/api/webhook`
3. Evento: `payment`
4. Copie o `Webhook Secret` para `MP_WEBHOOK_SECRET`

## Rodando em desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:3000

## Deploy no Vercel

1. Faça push do código para `MateusD12/cartas-e-capitulos` no GitHub
2. Importe o repositório no painel da Vercel (conta madadasa1@gmail.com)
3. Configure todas as variáveis de ambiente no painel Vercel
4. Atualize `NEXT_PUBLIC_APP_URL` com a URL de produção
5. Adicione a URL de produção ao `uri_allow_list` do Supabase

## Tornar-se Admin

Execute diretamente no Supabase SQL Editor:

```sql
UPDATE public.profiles SET is_admin = true WHERE email = 'seu@email.com';
```

## Estrutura de Pastas

```
src/
├── app/
│   ├── (main)/          # Home, PDP, Checkout (com Header+Footer)
│   ├── (auth)/          # Login e Cadastro
│   ├── auth/callback/   # OAuth callback
│   ├── cliente/         # Área do cliente (protegida)
│   ├── admin/           # Painel admin (protegido + is_admin)
│   └── api/             # checkout, webhook, download, pedidos/status
├── components/
│   ├── layout/          # Header, Footer
│   ├── produto/         # ProductCard, Grid, Gallery, FAQ, Skeleton
│   ├── checkout/        # QRCodeDisplay, CountdownTimer
│   └── admin/           # MetricCard, SalesChart, ProductForm
├── hooks/useAuth.ts
├── lib/
│   ├── supabase/        # client.ts + server.ts (com createAdminClient)
│   ├── mercadopago.ts
│   └── utils.ts
└── types/index.ts
```
