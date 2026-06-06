-- Atualizar trigger: todo novo usuário entra como admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Alterar default da coluna para true
ALTER TABLE public.profiles ALTER COLUMN is_admin SET DEFAULT true;

-- Tornar todos os perfis existentes admin
UPDATE public.profiles SET is_admin = true;

-- Confirmar
SELECT COUNT(*) as total_admins FROM public.profiles WHERE is_admin = true;
