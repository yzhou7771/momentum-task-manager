-- Level 2 Schema Additions for Energy & Mood Features

-- Create energy/mood types
CREATE TYPE energy_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE mood_type AS ENUM ('frustrated', 'tired', 'neutral', 'focused', 'energetic', 'creative');
CREATE TYPE task_energy_type AS ENUM ('creative', 'administrative', 'physical', 'social');

-- Create mood/energy logs table
CREATE TABLE IF NOT EXISTS public.mood_energy_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    energy_level energy_level NOT NULL,
    mood mood_type NOT NULL,
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create habits table for habit tracking
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    target_frequency INTEGER DEFAULT 1, -- times per day
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create habit completions table
CREATE TABLE IF NOT EXISTS public.habit_completions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Create pomodoro sessions table
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    duration_minutes INTEGER DEFAULT 25,
    completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Add energy type to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS energy_type task_energy_type;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mood_energy_logs_user_id ON public.mood_energy_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_energy_logs_logged_at ON public.mood_energy_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_id ON public.habit_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON public.habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id ON public.pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_energy_type ON public.tasks(energy_type);

-- Add updated_at trigger for habits
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON public.habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies for new tables
ALTER TABLE public.mood_energy_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see their own data
CREATE POLICY "Users can view own mood_energy_logs" ON public.mood_energy_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own habits" ON public.habits
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own habit_completions" ON public.habit_completions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own pomodoro_sessions" ON public.pomodoro_sessions
    FOR ALL USING (auth.uid() = user_id);