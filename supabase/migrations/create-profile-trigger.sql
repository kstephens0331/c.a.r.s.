-- =====================================================
-- CREATE PROFILE TRIGGER - Auto-create profiles on signup
-- =====================================================
-- This migration creates a trigger that automatically creates
-- a profile record whenever a new user signs up via auth.users
-- =====================================================

-- Step 1: Create your admin profile NOW (if you're logged in)
INSERT INTO profiles (id, is_admin, created_at, updated_at)
VALUES (
  auth.uid(),
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET is_admin = true, updated_at = NOW();

-- Step 2: Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, is_admin, created_at, updated_at)
  VALUES (
    NEW.id,
    false,  -- New users are NOT admin by default
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Backfill any existing users without profiles
INSERT INTO public.profiles (id, is_admin, created_at, updated_at)
SELECT
  u.id,
  false,  -- Existing users default to non-admin
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 5: Verify the trigger was created
SELECT
  tgname as trigger_name,
  tgtype as trigger_type
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Step 6: Verify your admin profile exists
SELECT id, is_admin, created_at
FROM profiles
WHERE id = auth.uid();
