
-- Adicionar a coluna user_id à tabela de profiles

-- Adicionar a coluna user_id
ALTER TABLE profiles ADD COLUMN user_id UUID;

-- Popular a nova coluna com os dados da tabela auth.users
UPDATE profiles
SET user_id = (SELECT id FROM auth.users WHERE auth.users.email = profiles.email);

-- Adicionar as constraints NOT NULL e UNIQUE
ALTER TABLE profiles ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- Adicionar a constraint de chave estrangeira
ALTER TABLE profiles ADD CONSTRAINT fk_auth_users FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
