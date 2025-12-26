-- migrations/027_fix_new_user_trigger.sql

-- ========= INÍCIO DA MIGRATION =========

-- O objetivo desta migração é corrigir a função 'handle_new_user', que estava a falhar
-- quando um novo utilizador era criado sem um 'name' nos metadados.
-- A tabela 'profiles' exige que a coluna 'name' não seja nula.

-- -----------------------------------------------------
-- 1. Função Corrigida para manipular a criação de um novo usuário
-- -----------------------------------------------------
-- Esta versão substituí a anterior e adiciona uma lógica de fallback para o nome.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  profile_name text;
begin
  -- Usa a função NULLIF para tratar strings vazias como NULL,
  -- e depois COALESCE para escolher o primeiro valor não nulo.
  -- 1. Tenta usar o 'name' dos metadados.
  -- 2. Se for nulo ou vazio, usa o email do utilizador como 'name'.
  profile_name := COALESCE(NULLIF(new.raw_user_meta_data->>'name', ''), new.email);

  -- Insere o novo registro na tabela 'profiles' com a garantia de que 'name' não será nulo.
  insert into public.profiles (user_id, email, name)
  values (new.id, new.email, profile_name);
  
  return new;
end;
$$ language plpgsql security definer;

-- O gatilho 'on_auth_user_created' continua o mesmo, apenas a função que ele chama foi substituída.

-- ========= FIM DA MIGRATION =========
