# Histórico — Cartas & Capítulos

## v1.0.0 — 2026-06-06

### Criação inicial do projeto

**Stack:** Next.js 16 · TypeScript · Tailwind CSS 4 · Supabase · Mercado Pago

**Funcionalidades implementadas:**
- E-commerce de imprimíveis digitais (PDF) com 3 categorias: Educativo, Datas Especiais, Papelaria
- Autenticação dupla: email+senha e Google OAuth via Supabase Auth
- Catálogo com filtros dinâmicos por categoria e tema
- Página de produto (PDP) com galeria, badge de download imediato, FAQ e OG tags
- Checkout transparente com geração de QR Code Pix via Mercado Pago SDK
- Timer de 15 minutos e polling de status a cada 5s para confirmação de pagamento
- Webhook do Mercado Pago com validação HMAC SHA256
- Download seguro via signed URL do Supabase Storage (60s de validade)
- Área do cliente: histórico de pedidos com botão de download para pedidos pagos
- Painel admin: dashboard com métricas + gráfico de vendas (Recharts)
- Admin: CRUD de produtos com upload de imagem (bucket público) e PDF (bucket privado)
- Admin: controle de pedidos com filtros e geração de link de download para suporte
- Middleware Next.js protegendo `/cliente/**` e `/admin/**`
- Trigger SQL: criação automática de perfil ao registrar usuário
- RLS policies para todas as tabelas
- Página 404 customizada
- SEO: metadata global + OG tags por produto via `generateMetadata`
- Mobile-first com identidade visual verde/azul bebê + Nunito + Inter

**Infra:**
- Supabase projeto: `bgoteptsgdqwnlgqdzjg`
- Buckets: `product-covers` (público) e `product-pdfs` (privado)
- Deploy: Vercel (conta madadasa1@gmail.com)
- GitHub: MateusD12/cartas-e-capitulos
