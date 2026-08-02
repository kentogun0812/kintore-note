-- ============================================================
-- KINTORE NOTE - DATABASE INITIALIZATION SCRIPT (init.sql)
-- Target: Supabase / PostgreSQL 15+
-- ============================================================

-- ============================================================
-- 0. CLEANUP (DROP EXISTING OBJECTS)
-- ============================================================
DROP TABLE IF EXISTS public.body_photos CASCADE;
DROP TABLE IF EXISTS public.hanko_stamps CASCADE;
DROP TABLE IF EXISTS public.workout_sets CASCADE;
DROP TABLE IF EXISTS public.workout_exercises CASCADE;
DROP TABLE IF EXISTS public.workout_sessions CASCADE;
DROP TABLE IF EXISTS public.favorite_exercises CASCADE;
DROP TABLE IF EXISTS public.custom_exercises CASCADE;
DROP TABLE IF EXISTS public.custom_muscle_groups CASCADE;
DROP TABLE IF EXISTS public.workout_template_exercises CASCADE;
DROP TABLE IF EXISTS public.workout_templates CASCADE;
DROP TABLE IF EXISTS public.weekly_plans CASCADE;
DROP TABLE IF EXISTS public.exercise_muscles CASCADE;
DROP TABLE IF EXISTS public.exercise_equipment CASCADE;
DROP TABLE IF EXISTS public.exercise_categories CASCADE;
DROP TABLE IF EXISTS public.exercises CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.muscle_groups CASCADE;
DROP TABLE IF EXISTS public.equipment CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.exercise_dataset_versions CASCADE;

DROP FUNCTION IF EXISTS public.generate_user_code() CASCADE;
DROP FUNCTION IF EXISTS public.check_personal_record() CASCADE;
DROP FUNCTION IF EXISTS public.update_session_volume() CASCADE;

DROP TYPE IF EXISTS public.auth_provider CASCADE;
DROP TYPE IF EXISTS public.locale_type CASCADE;
DROP TYPE IF EXISTS public.weight_unit CASCADE;
DROP TYPE IF EXISTS public.photo_angle CASCADE;
DROP TYPE IF EXISTS public.hanko_tier CASCADE;

-- ============================================================
-- 1. ENUMS
-- ============================================================
CREATE TYPE auth_provider AS ENUM ('apple', 'google', 'email');
CREATE TYPE locale_type AS ENUM ('ja', 'en');
CREATE TYPE weight_unit AS ENUM ('kg', 'lbs');
CREATE TYPE photo_angle AS ENUM ('front', 'side_left', 'side_right', 'back');
CREATE TYPE hanko_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'master', 'legend');

-- ============================================================
-- 2. HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION generate_user_code()
RETURNS VARCHAR AS $$
DECLARE
    code VARCHAR(9);
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
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
-- 3. SCHEMA TABLES
-- ============================================================

-- Muscle Groups
CREATE TABLE public.muscle_groups (
    id VARCHAR(50) PRIMARY KEY,
    name_ja VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    body_region VARCHAR(20) NOT NULL,
    sort_order INT DEFAULT 0
);

-- Exercises
CREATE TABLE public.exercises (
    id VARCHAR(50) PRIMARY KEY,
    slug VARCHAR(100) UNIQUE,
    name_ja VARCHAR(200) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    description_ja TEXT,
    description_en TEXT,
    muscle_group_id VARCHAR(50) REFERENCES public.muscle_groups(id) ON DELETE SET NULL,
    difficulty VARCHAR(20) DEFAULT 'Beginner',
    mechanics VARCHAR(20) DEFAULT 'compound',
    force VARCHAR(20) DEFAULT 'push',
    body_region VARCHAR(20) DEFAULT 'upper',
    instructions JSONB,
    image TEXT,
    gif_url TEXT,
    is_default BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 9999,
    is_system BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment
CREATE TABLE public.equipment (
    id VARCHAR(50) PRIMARY KEY,
    name_ja VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL
);

-- Exercise Equipment Junction
CREATE TABLE public.exercise_equipment (
    exercise_id VARCHAR(50) REFERENCES public.exercises(id) ON DELETE CASCADE,
    equipment_id VARCHAR(50) REFERENCES public.equipment(id) ON DELETE CASCADE,
    PRIMARY KEY (exercise_id, equipment_id)
);

-- Categories
CREATE TABLE public.categories (
    id VARCHAR(50) PRIMARY KEY,
    name_ja VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL
);

-- Exercise Categories Junction
CREATE TABLE public.exercise_categories (
    exercise_id VARCHAR(50) REFERENCES public.exercises(id) ON DELETE CASCADE,
    category_id VARCHAR(50) REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (exercise_id, category_id)
);

-- Exercise Muscles Junction
CREATE TABLE public.exercise_muscles (
    exercise_id VARCHAR(50) REFERENCES public.exercises(id) ON DELETE CASCADE,
    muscle_group_id VARCHAR(50) REFERENCES public.muscle_groups(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT true,
    PRIMARY KEY (exercise_id, muscle_group_id)
);

-- Exercise Dataset Versions
CREATE TABLE public.exercise_dataset_versions (
    version_number INT PRIMARY KEY,
    released_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles
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

-- Weekly Plans
CREATE TABLE public.weekly_plans (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    total_weeks INT NOT NULL,
    start_date TEXT,
    is_active BOOLEAN DEFAULT false,
    syncStatus VARCHAR(20) DEFAULT 'synced',
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Workout Templates
CREATE TABLE public.workout_templates (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    weekly_plan_id UUID REFERENCES public.weekly_plans(id) ON DELETE SET NULL,
    plan_week INT,
    syncStatus VARCHAR(20) DEFAULT 'synced',
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Workout Template Exercises
CREATE TABLE public.workout_template_exercises (
    id UUID PRIMARY KEY,
    workout_template_id UUID REFERENCES public.workout_templates(id) ON DELETE CASCADE,
    exercise_id VARCHAR(50) REFERENCES public.exercises(id) ON DELETE CASCADE,
    sort_order INT NOT NULL,
    target_sets INT DEFAULT 1,
    target_reps INT DEFAULT 10,
    target_weight_kg DECIMAL(6,2),
    syncStatus VARCHAR(20) DEFAULT 'synced',
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Muscle Groups
CREATE TABLE public.custom_muscle_groups (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name_ja VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    sort_order INT DEFAULT 0,
    syncStatus VARCHAR(20) DEFAULT 'synced',
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Exercises
CREATE TABLE public.custom_exercises (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name_ja VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    muscle_group_id VARCHAR(50) REFERENCES public.muscle_groups(id) ON DELETE SET NULL,
    syncStatus VARCHAR(20) DEFAULT 'synced',
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Favorite Exercises
CREATE TABLE public.favorite_exercises (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id VARCHAR(50) REFERENCES public.exercises(id) ON DELETE CASCADE,
    syncStatus VARCHAR(20) DEFAULT 'synced',
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Workout Sessions
CREATE TABLE public.workout_sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_template_id UUID REFERENCES public.workout_templates(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    total_volume DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'completed',
    notes TEXT,
    syncStatus VARCHAR(20) DEFAULT 'synced',
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Workout Exercises
CREATE TABLE public.workout_exercises (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id VARCHAR(50) REFERENCES public.exercises(id) ON DELETE CASCADE,
    sort_order INT DEFAULT 0,
    notes TEXT,
    syncStatus VARCHAR(20) DEFAULT 'synced',
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Workout Sets
CREATE TABLE public.workout_sets (
    id UUID PRIMARY KEY,
    workout_exercise_id UUID REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
    weight DECIMAL(6,2) NOT NULL,
    reps INT NOT NULL,
    completed BOOLEAN DEFAULT false,
    syncStatus VARCHAR(20) DEFAULT 'synced',
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Hanko Stamps
CREATE TABLE public.hanko_stamps (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
    stamp_date DATE NOT NULL,
    hanko_tier hanko_tier DEFAULT 'bronze',
    streak_count INT DEFAULT 1,
    syncStatus VARCHAR(20) DEFAULT 'synced',
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_hanko_per_day UNIQUE(user_id, stamp_date)
);

-- Body Photos
CREATE TABLE public.body_photos (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    angle photo_angle NOT NULL,
    key_id TEXT NOT NULL,
    taken_at TIMESTAMPTZ NOT NULL,
    syncStatus VARCHAR(20) DEFAULT 'synced',
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. TRIGGERS & LOGIC
-- ============================================================

-- Auto-calculate session total volume
CREATE OR REPLACE FUNCTION update_session_volume()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.workout_sessions 
    SET total_volume = (
        SELECT COALESCE(SUM(weight * reps), 0) 
        FROM public.workout_sets ws
        JOIN public.workout_exercises we ON ws.workout_exercise_id = we.id
        WHERE we.session_id = NEW.session_id
    )
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate session volume on set insert/update
-- (Note: Since we update sets, the trigger should watch workout_sets table)
-- We will hook this when set volume changes.

-- ============================================================
-- 5. RLS POLICIES (BASIC)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hanko_stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_template_exercises ENABLE ROW LEVEL SECURITY;

-- User-owned data policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can manage their own templates" ON public.workout_templates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own sessions" ON public.workout_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own sets" ON public.workout_sets FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.workout_exercises we
        JOIN public.workout_sessions ws ON we.session_id = ws.id
        WHERE we.id = workout_exercise_id AND ws.user_id = auth.uid()
    )
);
CREATE POLICY "Users can manage their own weekly plans" ON public.weekly_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own body photos" ON public.body_photos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own stamps" ON public.hanko_stamps FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own custom exercises" ON public.custom_exercises FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own custom muscle groups" ON public.custom_muscle_groups FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own favorite exercises" ON public.favorite_exercises FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own workout exercises" ON public.workout_exercises FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workout_sessions WHERE id = session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage their own template exercises" ON public.workout_template_exercises FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workout_templates WHERE id = workout_template_id AND user_id = auth.uid())
);

-- Public read access
CREATE POLICY "Public can view exercises" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Public can view muscle groups" ON public.muscle_groups FOR SELECT USING (true);
CREATE POLICY "Public can view equipment" ON public.equipment FOR SELECT USING (true);
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can view exercise_muscles" ON public.exercise_muscles FOR SELECT USING (true);
CREATE POLICY "Public can view exercise_equipment" ON public.exercise_equipment FOR SELECT USING (true);
CREATE POLICY "Public can view exercise_categories" ON public.exercise_categories FOR SELECT USING (true);
CREATE POLICY "Public can view dataset versions" ON public.exercise_dataset_versions FOR SELECT USING (true);
