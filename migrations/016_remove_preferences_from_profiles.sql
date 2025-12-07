-- migrations/016_remove_preferences_from_profiles.sql

-- 1. Remove the preferences column from the profiles table
ALTER TABLE public.profiles
DROP COLUMN preferences;
