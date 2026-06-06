-- ============================================================
-- Cartas & Capítulos — Schema SQL
-- Projeto Supabase: bgoteptsgdqwnlgqdzjg
-- ============================================================

-- Perfis de usuários (espelho de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email      TEXT,
  full_name  TEXT,
  is_admin   BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Produtos imprimíveis
CREATE TABLE IF NOT EXISTS public.products (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  description       TEXT,
  price             NUMERIC(10,2) NOT NULL,
  category          TEXT NOT NULL CHECK (category IN ('educativo','datas_especiais','papelaria')),
  age_range         TEXT,          -- ex: "3-6 anos" (só para 'educativo')
  theme             TEXT,          -- ex: "Dia dos Pais", "Matemática"
  cover_image_url   TEXT,
  pdf_storage_path  TEXT,          -- caminho no bucket privado product-pdfs
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- Pedidos
CREATE TABLE IF NOT EXISTS public.orders (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id),
  product_id     UUID REFERENCES public.products(id),
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','failed')),
  mp_payment_id  TEXT,
  amount         NUMERIC(10,2) NOT NULL,
  buyer_name     TEXT,
  buyer_email    TEXT,
  buyer_cpf      TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  paid_at        TIMESTAMPTZ
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders   ENABLE ROW LEVEL SECURITY;

-- profiles: usuário gerencia apenas o próprio perfil
CREATE POLICY "profiles_own_all" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- products: leitura pública de produtos ativos
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (is_active = true);

-- orders: usuário lê e cria apenas os próprios pedidos
CREATE POLICY "orders_user_read" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_user_insert" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Trigger: criar perfil automaticamente ao registrar usuário
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  admin_emails TEXT[] := ARRAY['madadasa1@gmail.com', 'fptrindade02@gmail.com'];
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email = ANY(admin_emails)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Storage buckets (executar no painel Supabase ou via CLI)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-covers', 'product-covers', true)  ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-pdfs',   'product-pdfs',   false) ON CONFLICT DO NOTHING;
