-- migrations/025_remove_password_from_profiles.sql

-- ========= INÍCIO DA MIGRATION =========

-- O objetivo desta migração é remover a coluna 'password' da tabela 'profiles'.
-- Esta coluna é redundante e representa um risco de segurança, além de causar
-- falhas de 'NOT NULL constraint' na inserção de novos perfis. A autenticação
-- é de responsabilidade exclusiva do sistema 'auth' do Supabase.

ALTER TABLE public.profiles
DROP COLUMN IF EXISTS password;

-- ========= FIM DA MIGRATION =========
