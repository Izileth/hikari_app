-- migrations/028_readd_password_to_profiles.sql

-- ========= INÍCIO DA MIGRATION =========

-- O objetivo desta migração é reintroduzir a coluna 'password' na tabela 'profiles',
-- conforme solicitado para reverter a estratégia de criação de perfil.

-- A coluna será adicionada como NULLABLE para evitar que cause erros de 'NOT NULL constraint'
-- em operações de INSERT que não forneçam este campo, uma vez que a autenticação
-- é gerida pelo schema 'auth' do Supabase.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS password VARCHAR(255);


-- ========= FIM DA MIGRATION =========
