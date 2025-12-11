-- migrations/017_add_feed_posts_rls_policy.sql

-- Migração para adicionar políticas de Row-Level Security (RLS) à tabela 'feed_posts'

-- ========= INÍCIO DA MIGRATION =========

-- 1. Habilitar RLS na tabela
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

-- 2. Política de SELECT: Permitir que usuários autenticados leiam seus próprios posts.
CREATE POLICY "Allow users to read their own feed posts"
ON public.feed_posts FOR SELECT
TO authenticated
USING ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) );

-- 3. Política de INSERT: Permitir que usuários autenticados criem posts para si mesmos.
CREATE POLICY "Allow users to insert their own feed posts"
ON public.feed_posts FOR INSERT
TO authenticated
WITH CHECK ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) );

-- 4. Política de UPDATE: Permitir que usuários atualizem apenas seus próprios posts.
CREATE POLICY "Allow users to update their own feed posts"
ON public.feed_posts FOR UPDATE
TO authenticated
USING ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) )
WITH CHECK ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) );

-- 5. Política de DELETE: Permitir que usuários deletem apenas seus próprios posts.
CREATE POLICY "Allow users to delete their own feed posts"
ON public.feed_posts FOR DELETE
TO authenticated
USING ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) );

-- ========= FIM DA MIGRATION =========