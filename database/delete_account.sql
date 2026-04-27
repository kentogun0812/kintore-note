-- ============================================================
-- KINTORE NOTE - DELETE ACCOUNT MIGRATION
-- Created: 2026-04-27
-- Target: Supabase / PostgreSQL 15+
-- 
-- This migration adds the `delete_own_account()` RPC function
-- that allows authenticated users to permanently delete their
-- own account and all associated data.
--
-- HOW TO RUN:
--   Execute this SQL in the Supabase SQL Editor (Dashboard → SQL Editor)
--   or via the Supabase CLI: `supabase db push`
-- ============================================================

-- ============================================================
-- 1. DELETE OWN ACCOUNT FUNCTION
-- ============================================================
-- 
-- This function is called from the mobile app via `supabase.rpc('delete_own_account')`.
-- It uses SECURITY DEFINER to run with elevated privileges because
-- deleting from `auth.users` requires service-role access.
--
-- CASCADE behavior (from init.sql foreign keys):
--   auth.users → profiles (ON DELETE CASCADE)
--   profiles → training_programs, training_menus, training_sessions,
--              hanko_stamps, body_photos, friendships, posts (ON DELETE CASCADE)
--   training_sessions → session_sets (ON DELETE CASCADE)
--   training_menus → menu_exercises (ON DELETE CASCADE)
--   posts → reactions, comments (ON DELETE CASCADE)
--
-- This means deleting the auth.users row cascades through ALL user data.
-- ============================================================

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get the authenticated user's ID
    current_user_id := auth.uid();
    
    -- Safety check: ensure user is authenticated
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    -- Delete from Supabase Storage (body photo blobs) if any
    -- Note: Storage objects have their own RLS, but we clean up metadata here
    DELETE FROM storage.objects 
    WHERE owner = current_user_id;
    
    -- Delete the user from auth.users
    -- This CASCADE deletes: profiles → all related tables
    DELETE FROM auth.users 
    WHERE id = current_user_id;
END;
$$;

-- ============================================================
-- 2. GRANT EXECUTE PERMISSION
-- ============================================================
-- Allow authenticated users to call this function via RPC
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

-- ============================================================
-- 3. RLS POLICIES FOR BODY PHOTOS (if not yet added)
-- ============================================================
-- Ensure body_photos table has RLS enabled so users can only 
-- access their own photos before deletion
ALTER TABLE public.body_photos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Only create if not exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'body_photos' 
        AND policyname = 'Users can manage their own photos'
    ) THEN
        CREATE POLICY "Users can manage their own photos" 
        ON public.body_photos 
        FOR ALL 
        USING (auth.uid() = user_id);
    END IF;
END
$$;
