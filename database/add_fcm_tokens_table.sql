-- ============================================================
-- KINTORE NOTE - ADD FCM TOKENS TABLE MIGRATION
-- Target: Supabase / PostgreSQL 15+
-- ============================================================

-- Create user_fcm_tokens table
CREATE TABLE IF NOT EXISTS public.user_fcm_tokens (
    token TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to allow re-running
DROP POLICY IF EXISTS "Users can manage their own FCM tokens" ON public.user_fcm_tokens;

-- Create RLS policy for the table
CREATE POLICY "Users can manage their own FCM tokens"
    ON public.user_fcm_tokens
    FOR ALL
    USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE public.user_fcm_tokens IS 'Stores Firebase Cloud Messaging (FCM) tokens mapped to active user profiles for push notifications.';
COMMENT ON COLUMN public.user_fcm_tokens.token IS 'The unique FCM registration token issued by Firebase.';
COMMENT ON COLUMN public.user_fcm_tokens.user_id IS 'The Supabase user profile ID matching auth.users.id.';
COMMENT ON COLUMN public.user_fcm_tokens.device_type IS 'The device operating system platform (e.g. ios, android, web).';
