-- 修复RLS策略 - 添加INSERT, UPDATE, DELETE权限

-- 删除现有的限制性策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;

-- 为users表创建完整的CRUD策略
CREATE POLICY "Users can manage own profile" ON public.users
    FOR ALL USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 为user_profiles表创建完整的CRUD策略
CREATE POLICY "Users can manage own user_profiles" ON public.user_profiles
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 为tasks表创建完整的CRUD策略
CREATE POLICY "Users can manage own tasks" ON public.tasks
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 确保RLS已启用
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;