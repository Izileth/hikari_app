-- Migração para adicionar políticas de Row-Level Security (RLS) 
-- às tabelas 'post_likes' e 'post_comments'

-- ========= INÍCIO DA MIGRATION =========

-- -----------------------------------------------------
-- Políticas para a tabela 'post_likes'
-- -----------------------------------------------------

-- 1. Habilitar RLS na tabela
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- 2. Política de SELECT: Permitir que qualquer usuário autenticado leia as curtidas.
--    As curtidas são consideradas dados públicos no contexto de um post.
CREATE POLICY "Allow authenticated users to read likes"
ON public.post_likes FOR SELECT
TO authenticated
USING (true);

-- 3. Política de INSERT: Permitir que um usuário autenticado curta um post.
--    A verificação garante que o usuário só pode inserir uma curtida com seu próprio profile_id.
CREATE POLICY "Allow users to insert their own likes"
ON public.post_likes FOR INSERT
TO authenticated
WITH CHECK ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) );

-- 4. Política de DELETE: Permitir que um usuário autenticado remova sua própria curtida.
CREATE POLICY "Allow users to delete their own likes"
ON public.post_likes FOR DELETE
TO authenticated
USING ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) );


-- -----------------------------------------------------
-- Políticas para a tabela 'post_comments'
-- -----------------------------------------------------

-- 1. Habilitar RLS na tabela
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- 2. Política de SELECT: Permitir que qualquer usuário autenticado leia os comentários.
CREATE POLICY "Allow authenticated users to read comments"
ON public.post_comments FOR SELECT
TO authenticated
USING (true);

-- 3. Política de INSERT: Permitir que um usuário autenticado comente em um post.
CREATE POLICY "Allow users to insert their own comments"
ON public.post_comments FOR INSERT
TO authenticated
WITH CHECK ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) );

-- 4. Política de UPDATE: Permitir que um usuário autenticado edite seus próprios comentários.
CREATE POLICY "Allow users to update their own comments"
ON public.post_comments FOR UPDATE
TO authenticated
USING ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) )
WITH CHECK ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) );

-- 5. Política de DELETE: Permitir que um usuário autenticado delete seus próprios comentários.
CREATE POLICY "Allow users to delete their own comments"
ON public.post_comments FOR DELETE
TO authenticated
USING ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) );


-- ========= FIM DA MIGRATION =========
