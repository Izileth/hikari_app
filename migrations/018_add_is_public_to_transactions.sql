-- migrations/018_add_is_public_to_transactions.sql

-- Migração para adicionar uma coluna 'is_public' à tabela 'transactions'
-- e ajustar as políticas de RLS para permitir a leitura de transações públicas.

-- ========= INÍCIO DA MIGRATION =========

-- 1. Adicionar a coluna 'is_public' à tabela 'transactions'
ALTER TABLE public.transactions
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT FALSE;

-- Adiciona um comentário para explicar o novo campo 'is_public'
COMMENT ON COLUMN public.transactions.is_public IS 'Indica se a transação é visível publicamente para outros usuários (true) ou privada (false).';

-- 2. Atualizar a política de SELECT para 'transactions'
--    Permitir que usuários autenticados leiam suas próprias transações OU transações públicas.
-- Drop existing policy if it exists to prevent errors during re-migration
DROP POLICY IF EXISTS "Allow users to manage their own transactions" ON public.transactions;

CREATE POLICY "Allow users to read their own and public transactions"
ON public.transactions FOR SELECT
TO authenticated
USING ( profile_id = (SELECT id FROM public.profiles WHERE email = auth.email()) OR is_public = TRUE );

-- As políticas de INSERT, UPDATE e DELETE permanecem as mesmas, garantindo que
-- os usuários só possam criar, atualizar ou deletar SUAS PRÓPRIAS transações.
-- A coluna 'is_public' é definida pelo usuário para suas próprias transações.

-- ========= FIM DA MIGRATION =========