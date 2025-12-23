
-- Corrigir a tabela de seguidores para usar INT em vez de UUID

-- Remover as policies existentes
DROP POLICY IF EXISTS "user_can_follow_other_users" ON followers;
DROP POLICY IF EXISTS "user_can_unfollow_other_users" ON followers;
DROP POLICY IF EXISTS "all_users_can_see_follower_relationships" ON followers;

-- Remover as constraints de chave estrangeira existentes
ALTER TABLE followers DROP CONSTRAINT IF EXISTS followers_follower_id_fkey;
ALTER TABLE followers DROP CONSTRAINT IF EXISTS followers_following_id_fkey;

-- Alterar o tipo das colunas para INT
ALTER TABLE followers ALTER COLUMN follower_id TYPE INT;
ALTER TABLE followers ALTER COLUMN following_id TYPE INT;

-- Adicionar as constraints de chave estrangeira novamente
ALTER TABLE followers ADD CONSTRAINT fk_follower FOREIGN KEY (follower_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE followers ADD CONSTRAINT fk_following FOREIGN KEY (following_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Recriar as policies
CREATE POLICY "user_can_follow_other_users"
ON followers
FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = followers.follower_id AND profiles.user_id = auth.uid()));

CREATE POLICY "user_can_unfollow_other_users"
ON followers
FOR DELETE
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = followers.follower_id AND profiles.user_id = auth.uid()));

CREATE POLICY "all_users_can_see_follower_relationships"
ON followers
FOR SELECT
USING (true);
