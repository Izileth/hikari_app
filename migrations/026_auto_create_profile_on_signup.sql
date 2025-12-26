-- migrations/026_auto_create_profile_on_signup.sql

-- ========= INÍCIO DA MIGRATION =========

-- O objetivo desta migração é automatizar a criação de um perfil na tabela `public.profiles`
-- sempre que um novo usuário se registra no sistema de autenticação do Supabase (`auth.users`).
-- Isso é feito através de uma função e um gatilho (trigger).

-- -----------------------------------------------------
-- 1. Função para manipular a criação de um novo usuário
-- -----------------------------------------------------
-- Esta função será acionada pelo gatilho e é responsável por inserir
-- os dados do novo usuário de autenticação na tabela 'profiles'.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Insere um novo registro na tabela 'profiles'.
  -- - 'user_id' é preenchido com o ID do novo usuário (da tabela auth.users).
  -- - 'email' é preenchido com o email do novo usuário.
  -- - 'name' é extraído dos metadados do usuário (geralmente fornecidos no momento do registro).
  -- - 'slug' será gerado automaticamente pelo gatilho 'set_profile_slug_trigger' que já existe.
  insert into public.profiles (user_id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

-- -----------------------------------------------------
-- 2. Gatilho para acionar a função após a criação de um usuário
-- -----------------------------------------------------
-- Este gatilho é disparado DEPOIS (AFTER) que um novo registro é inserido (INSERT) 
-- na tabela 'auth.users' e executa a função 'handle_new_user' para cada novo usuário.
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ========= FIM DA MIGRATION =========
