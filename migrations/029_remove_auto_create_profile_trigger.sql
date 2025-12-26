-- migrations/029_remove_auto_create_profile_trigger.sql

-- ========= INÍCIO DA MIGRATION =========

-- O objetivo desta migração é remover o gatilho e a função
-- que automatizavam a criação de perfis, revertendo para um
-- modelo onde a aplicação cliente é responsável por esta lógica.

-- 1. Remover o gatilho da tabela auth.users
-- O 'IF EXISTS' garante que o comando não falha se o gatilho já tiver sido removido.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Remover a função que o gatilho executava
-- O 'IF EXISTS' garante que o comando não falha se a função já tiver sido removida.
DROP FUNCTION IF EXISTS public.handle_new_user();


-- ========= FIM DA MIGRATION =========
