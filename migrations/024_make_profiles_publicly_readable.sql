-- migrations/024_make_profiles_publicly_readable.sql

-- ========= INÍCIO DA MIGRATION =========

-- O objetivo desta migração é corrigir a política de segurança (RLS) da tabela 'profiles'
-- para permitir que dados de perfis públicos (como nome e avatar) possam ser lidos por
-- outros usuários. Isso é essencial para funcionalidades como mostrar o autor de uma
-- postagem pública no feed.

-- 1. Remover a política de SELECT (leitura) antiga e restritiva.
--    A política anterior só permitia que um usuário lesse o seu próprio perfil.
DROP POLICY IF EXISTS "Enable SELECT for authenticated users on their own profile" ON public.profiles;

-- 2. Criar uma nova política de SELECT mais permissiva.
--    Esta nova política permite que um usuário autenticado leia um perfil se:
--    a) O perfil for o seu próprio (verificando contra o user_id do auth).
--    b) O perfil estiver marcado como público (is_public = TRUE), que é o padrão.
CREATE POLICY "Allow users to read their own or public profiles"
ON public.profiles FOR SELECT
TO authenticated
USING ( (user_id = auth.uid()) OR (is_public = TRUE) );

-- ========= FIM DA MIGRATION =========
