-- ============================================================
-- KINTORE NOTE - DATABASE INITIALIZATION SCRIPT (init.sql)
-- Generated: 2026-04-19
-- Target: Supabase / PostgreSQL 15+
-- ============================================================

-- ============================================================
-- 1. ENUMS
-- ============================================================
CREATE TYPE auth_provider AS ENUM ('apple', 'google', 'email');
CREATE TYPE locale_type AS ENUM ('ja', 'en');
CREATE TYPE weight_unit AS ENUM ('kg', 'lbs');
CREATE TYPE session_status AS ENUM ('draft', 'in_progress', 'completed');
CREATE TYPE photo_angle AS ENUM ('front', 'side_left', 'side_right', 'back');
CREATE TYPE hanko_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'master', 'legend');
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE sub_plan AS ENUM ('monthly', 'semi_annual', 'lifetime');
CREATE TYPE sub_status AS ENUM ('active', 'expired', 'cancelled');
CREATE TYPE reaction_type AS ENUM ('muscle', 'fire', 'flower');

-- ============================================================
-- 2. HELPER FUNCTIONS
-- ============================================================

-- Auto-generate unique KINT-XXXX on profile insert
CREATE OR REPLACE FUNCTION generate_user_code()
RETURNS VARCHAR AS $$
DECLARE
    code VARCHAR(9);
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Remove ambiguous chars (0/O, 1/I)
BEGIN
    LOOP
        code := 'KINT-' || 
            substring(chars, floor(random() * length(chars) + 1)::int, 1) ||
            substring(chars, floor(random() * length(chars) + 1)::int, 1) ||
            substring(chars, floor(random() * length(chars) + 1)::int, 1) ||
            substring(chars, floor(random() * length(chars) + 1)::int, 1);
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_code = code);
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 3. CORE TABLES
-- ============================================================

-- Muscle Groups
CREATE TABLE public.muscle_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ja VARCHAR(50) NOT NULL,
    name_en VARCHAR(50) NOT NULL,
    body_region VARCHAR(20) NOT NULL,              -- upper/lower/core
    sort_order INT DEFAULT 0
);

-- Profiles (extends Supabase Auth)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_code VARCHAR(9) UNIQUE DEFAULT generate_user_code(),
    display_name VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    bio VARCHAR(200),
    locale locale_type DEFAULT 'ja',
    weight_unit weight_unit DEFAULT 'kg',
    streak_current INT DEFAULT 0,
    streak_best INT DEFAULT 0,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_user_code CHECK (user_code ~ '^KINT-[A-Z0-9]{4}$')
);

CREATE UNIQUE INDEX idx_profiles_user_code ON public.profiles(user_code);

-- Exercises
CREATE TABLE public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ja VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    muscle_group_id UUID REFERENCES public.muscle_groups(id),
    secondary_muscle_ids UUID[] DEFAULT '{}',
    image_url TEXT,
    video_url TEXT,
    description_ja TEXT,
    description_en TEXT,
    search_text TSVECTOR,                          -- Full-text search (JP + EN)
    is_system BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exercises_muscle ON public.exercises(muscle_group_id);
CREATE INDEX idx_exercises_search ON public.exercises USING GIN(search_text);

-- Training Programs
CREATE TABLE public.training_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    total_weeks INT NOT NULL CHECK (total_weeks BETWEEN 1 AND 52),
    start_date DATE,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training Menus
CREATE TABLE public.training_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_template BOOLEAN DEFAULT false,
    schedule_days INT[] DEFAULT '{}',              -- 0=Mon, 6=Sun
    program_id UUID REFERENCES public.training_programs(id) ON DELETE SET NULL,
    program_week INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Exercises (junction)
CREATE TABLE public.menu_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id UUID REFERENCES public.training_menus(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercises(id),
    sort_order INT NOT NULL,
    target_sets INT DEFAULT 3,
    target_reps INT DEFAULT 10,
    target_weight_kg DECIMAL(6,2)
);

-- Training Sessions
CREATE TABLE public.training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    menu_id UUID REFERENCES public.training_menus(id),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    total_volume DECIMAL(10,2) DEFAULT 0,
    duration_minutes INT,
    status session_status DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session Sets
CREATE TABLE public.session_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.training_sessions(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercises(id),
    set_order INT NOT NULL,
    weight_kg DECIMAL(6,2) NOT NULL,
    reps INT NOT NULL,
    volume DECIMAL(10,2) GENERATED ALWAYS AS (weight_kg * reps) STORED,
    is_pr BOOLEAN DEFAULT false,
    rpe INT CHECK (rpe BETWEEN 1 AND 10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hanko Stamps
CREATE TABLE public.hanko_stamps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.training_sessions(id),
    stamp_date DATE NOT NULL,
    hanko_tier hanko_tier DEFAULT 'bronze',
    streak_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_hanko_per_day UNIQUE(user_id, stamp_date)
);

-- Body Photos
CREATE TABLE public.body_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    encrypted_storage_key TEXT NOT NULL,
    angle photo_angle NOT NULL,
    body_weight_kg DECIMAL(5,1),
    taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. SOCIAL TABLES
-- ============================================================

-- Friendships
CREATE TABLE public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    addressee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status friendship_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    
    CONSTRAINT no_self_friend CHECK (requester_id != addressee_id),
    CONSTRAINT unique_friendship UNIQUE(requester_id, addressee_id)
);

-- Posts
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.training_sessions(id),
    photo_id UUID REFERENCES public.body_photos(id),
    title VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reactions
CREATE TABLE public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction reaction_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_reaction UNIQUE(post_id, user_id, reaction)
);

-- Comments
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content VARCHAR(200) NOT NULL,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. TRIGGERS & LOGIC
-- ============================================================

-- Auto-detect PR on set insert
CREATE OR REPLACE FUNCTION check_personal_record()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.weight_kg > COALESCE(
        (SELECT MAX(weight_kg) FROM public.session_sets 
         WHERE exercise_id = NEW.exercise_id 
         AND session_id != NEW.session_id
         AND id != NEW.id),
        0
    ) THEN
        NEW.is_pr := true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_pr
    BEFORE INSERT ON public.session_sets
    FOR EACH ROW EXECUTE FUNCTION check_personal_record();

-- Auto-calculate session total volume
CREATE OR REPLACE FUNCTION update_session_volume()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.training_sessions 
    SET total_volume = (
        SELECT COALESCE(SUM(volume), 0) 
        FROM public.session_sets 
        WHERE session_id = NEW.session_id
    )
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_volume
    AFTER INSERT OR UPDATE ON public.session_sets
    FOR EACH ROW EXECUTE FUNCTION update_session_volume();

-- Full-text search index update
CREATE OR REPLACE FUNCTION update_exercise_search()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_text := 
        to_tsvector('simple', COALESCE(NEW.name_ja, '')) ||
        to_tsvector('english', COALESCE(NEW.name_en, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_exercise_search
    BEFORE INSERT OR UPDATE ON public.exercises
    FOR EACH ROW EXECUTE FUNCTION update_exercise_search();

-- ============================================================
-- 6. RLS POLICIES (BASIC)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hanko_stamps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can manage their own menus" ON public.training_menus FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own sessions" ON public.training_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own sets" ON public.session_sets FOR ALL USING (
    EXISTS (SELECT 1 FROM public.training_sessions WHERE id = session_id AND user_id = auth.uid())
);
