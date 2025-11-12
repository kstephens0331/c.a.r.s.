-- FIX: Infinite Recursion in Profiles RLS Policy
-- Problem: The profiles RLS policy is causing infinite recursion
-- Solution: Simplify policies to prevent circular references

-- Step 1: Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Step 2: Create simple, non-recursive policies

-- Policy 1: Users can view their own profile
-- CRITICAL: Do NOT reference profiles table in the USING clause
CREATE POLICY "users_select_own_profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
-- CRITICAL: Do NOT reference profiles table in the USING clause
CREATE POLICY "users_update_own_profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Users can insert their own profile
-- CRITICAL: Do NOT reference profiles table in the WITH CHECK clause
CREATE POLICY "users_insert_own_profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Step 3: Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verification query - Run this to test
-- SELECT id, is_admin FROM profiles WHERE id = auth.uid();
