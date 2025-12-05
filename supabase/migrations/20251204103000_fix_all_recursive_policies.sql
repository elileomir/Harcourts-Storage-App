-- 1. Fix the Recursion: Check JWT Metadata instead of Table Query
-- This stops the 500 Error immediately because it doesn't touch the database tables.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix the Stale Data: Sync Profile Role to User Metadata
-- This ensures that when you update a profile, the JWT metadata gets updated too.
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = 
    jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{role}',
      to_jsonb(NEW.role)
    )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_profile_role ON public.profiles;
CREATE TRIGGER sync_profile_role
  AFTER UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role();

-- 3. Force a Sync Now
-- This updates everyone's metadata to match their profile role immediately.
UPDATE public.profiles SET role = role;

-- 4. Re-apply Policies (Just to be safe and ensure they use the new is_admin)
-- Profiles: Admin Only
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE USING (public.is_admin());

-- Platform Settings: Admin Only
DROP POLICY IF EXISTS "Admins can update platform settings" ON public.platform_settings;
CREATE POLICY "Admins can update platform settings" ON public.platform_settings FOR UPDATE USING (public.is_admin());

-- Callback Requests: Open to All (As requested)
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.callback_requests;
CREATE POLICY "Allow all for authenticated users" ON public.callback_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
