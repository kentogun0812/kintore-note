-- Allow anonymous/public read access to common data tables
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muscle_groups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view exercises" ON public.exercises;
DROP POLICY IF EXISTS "Public can view muscle groups" ON public.muscle_groups;

-- Create policies that allow anyone (authenticated or anonymous) to SELECT
CREATE POLICY "Public can view exercises" 
ON public.exercises FOR SELECT 
USING (true);

CREATE POLICY "Public can view muscle groups" 
ON public.muscle_groups FOR SELECT 
USING (true);
