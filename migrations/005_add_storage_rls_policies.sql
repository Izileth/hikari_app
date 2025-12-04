-- Migração SQL para adicionar as políticas de Row-Level Security (RLS)
-- ao Supabase Storage para os buckets 'avatars' e 'banners'.

-- ========= INÍCIO DA MIGRATION =========

-- -----------------------------------------------------
-- Políticas para o bucket 'avatars'
-- -----------------------------------------------------

-- 1. Política para permitir que usuários autenticados insiram arquivos no seu próprio diretório
CREATE POLICY "Allow authenticated inserts on avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 2. Política para permitir que usuários autenticados atualizem seus próprios arquivos
CREATE POLICY "Allow authenticated updates on avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Política para permitir que usuários autenticados deletem seus próprios arquivos
CREATE POLICY "Allow authenticated deletes on avatars"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Política para permitir que qualquer usuário leia os avatares (bucket é público)
-- Acesso de leitura público é geralmente configurado no bucket, mas uma política explícita pode ser útil.
CREATE POLICY "Allow public read access on avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');


-- -----------------------------------------------------
-- Políticas para o bucket 'banners'
-- -----------------------------------------------------

-- 1. Política para permitir que usuários autenticados insiram arquivos no seu próprio diretório
CREATE POLICY "Allow authenticated inserts on banners"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 2. Política para permitir que usuários autenticados atualizem seus próprios arquivos
CREATE POLICY "Allow authenticated updates on banners"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Política para permitir que usuários autenticados deletem seus próprios arquivos
CREATE POLICY "Allow authenticated deletes on banners"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Política para permitir que qualquer usuário leia os banners (bucket é público)
CREATE POLICY "Allow public read access on banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');


-- ========= FIM DA MIGRATION =========
