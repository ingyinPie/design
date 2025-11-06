/*
  # Fix Security and Performance Issues

  This migration addresses critical security and performance issues identified in the database audit:

  ## 1. Add Missing Foreign Key Indexes
  - Add indexes for all foreign keys to improve query performance
  - Tables affected: alarms, content_plans, scheduled_posts

  ## 2. Optimize RLS Policies
  - Replace `auth.uid()` with `(select auth.uid())` in all policies
  - This prevents re-evaluation of auth functions for each row
  - Significantly improves query performance at scale
  - Tables affected: brand_profiles, generated_content, content_templates, scheduled_posts, content_plans, planned_posts, alarms

  ## 3. Fix Function Search Paths
  - Add explicit search_path settings to all functions
  - Prevents potential security vulnerabilities
  - Functions affected: update triggers and timezone helper functions

  ## Notes
  - Unused indexes are kept as they will be beneficial as the database scales
  - All changes are backward compatible
*/

-- =====================================================
-- PART 1: Add Missing Foreign Key Indexes
-- =====================================================

-- Indexes for alarms table foreign keys
CREATE INDEX IF NOT EXISTS idx_alarms_planned_post_id 
  ON public.alarms(planned_post_id) 
  WHERE planned_post_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_alarms_scheduled_post_id 
  ON public.alarms(scheduled_post_id) 
  WHERE scheduled_post_id IS NOT NULL;

-- Index for content_plans table foreign key
CREATE INDEX IF NOT EXISTS idx_content_plans_brand_profile_id 
  ON public.content_plans(brand_profile_id) 
  WHERE brand_profile_id IS NOT NULL;

-- Indexes for scheduled_posts table foreign keys
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_brand_profile_id 
  ON public.scheduled_posts(brand_profile_id) 
  WHERE brand_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_scheduled_posts_generated_content_id 
  ON public.scheduled_posts(generated_content_id) 
  WHERE generated_content_id IS NOT NULL;

-- =====================================================
-- PART 2: Optimize RLS Policies - Brand Profiles
-- =====================================================

DROP POLICY IF EXISTS "Users can view own brand profiles" ON public.brand_profiles;
DROP POLICY IF EXISTS "Users can insert own brand profiles" ON public.brand_profiles;
DROP POLICY IF EXISTS "Users can update own brand profiles" ON public.brand_profiles;
DROP POLICY IF EXISTS "Users can delete own brand profiles" ON public.brand_profiles;

CREATE POLICY "Users can view own brand profiles"
  ON public.brand_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own brand profiles"
  ON public.brand_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own brand profiles"
  ON public.brand_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own brand profiles"
  ON public.brand_profiles
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- PART 3: Optimize RLS Policies - Generated Content
-- =====================================================

DROP POLICY IF EXISTS "Users can view own generated content" ON public.generated_content;
DROP POLICY IF EXISTS "Users can insert own generated content" ON public.generated_content;
DROP POLICY IF EXISTS "Users can update own generated content" ON public.generated_content;
DROP POLICY IF EXISTS "Users can delete own generated content" ON public.generated_content;

CREATE POLICY "Users can view own generated content"
  ON public.generated_content
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own generated content"
  ON public.generated_content
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own generated content"
  ON public.generated_content
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own generated content"
  ON public.generated_content
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- PART 4: Optimize RLS Policies - Content Templates
-- =====================================================

DROP POLICY IF EXISTS "Users can view own content templates" ON public.content_templates;
DROP POLICY IF EXISTS "Users can insert own content templates" ON public.content_templates;
DROP POLICY IF EXISTS "Users can update own content templates" ON public.content_templates;
DROP POLICY IF EXISTS "Users can delete own content templates" ON public.content_templates;

CREATE POLICY "Users can view own content templates"
  ON public.content_templates
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own content templates"
  ON public.content_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own content templates"
  ON public.content_templates
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own content templates"
  ON public.content_templates
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- PART 5: Optimize RLS Policies - Scheduled Posts
-- =====================================================

DROP POLICY IF EXISTS "Users can view own scheduled posts" ON public.scheduled_posts;
DROP POLICY IF EXISTS "Users can insert own scheduled posts" ON public.scheduled_posts;
DROP POLICY IF EXISTS "Users can update own scheduled posts" ON public.scheduled_posts;
DROP POLICY IF EXISTS "Users can delete own scheduled posts" ON public.scheduled_posts;

CREATE POLICY "Users can view own scheduled posts"
  ON public.scheduled_posts
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own scheduled posts"
  ON public.scheduled_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own scheduled posts"
  ON public.scheduled_posts
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own scheduled posts"
  ON public.scheduled_posts
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- PART 6: Optimize RLS Policies - Content Plans
-- =====================================================

DROP POLICY IF EXISTS "Users can view own content plans" ON public.content_plans;
DROP POLICY IF EXISTS "Users can insert own content plans" ON public.content_plans;
DROP POLICY IF EXISTS "Users can update own content plans" ON public.content_plans;
DROP POLICY IF EXISTS "Users can delete own content plans" ON public.content_plans;

CREATE POLICY "Users can view own content plans"
  ON public.content_plans
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own content plans"
  ON public.content_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own content plans"
  ON public.content_plans
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own content plans"
  ON public.content_plans
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- PART 7: Optimize RLS Policies - Planned Posts
-- =====================================================

DROP POLICY IF EXISTS "Users can view own planned posts" ON public.planned_posts;
DROP POLICY IF EXISTS "Users can insert own planned posts" ON public.planned_posts;
DROP POLICY IF EXISTS "Users can update own planned posts" ON public.planned_posts;
DROP POLICY IF EXISTS "Users can delete own planned posts" ON public.planned_posts;

CREATE POLICY "Users can view own planned posts"
  ON public.planned_posts
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own planned posts"
  ON public.planned_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own planned posts"
  ON public.planned_posts
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own planned posts"
  ON public.planned_posts
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- PART 8: Optimize RLS Policies - Alarms
-- =====================================================

DROP POLICY IF EXISTS "Users can view own alarms" ON public.alarms;
DROP POLICY IF EXISTS "Users can insert own alarms" ON public.alarms;
DROP POLICY IF EXISTS "Users can update own alarms" ON public.alarms;
DROP POLICY IF EXISTS "Users can delete own alarms" ON public.alarms;

CREATE POLICY "Users can view own alarms"
  ON public.alarms
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own alarms"
  ON public.alarms
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own alarms"
  ON public.alarms
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own alarms"
  ON public.alarms
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- PART 9: Fix Function Search Paths
-- =====================================================

-- Drop existing functions first
DROP FUNCTION IF EXISTS public.get_planned_posts_sg(uuid);
DROP FUNCTION IF EXISTS public.get_scheduled_posts_sg(uuid);

-- Recreate update_brand_profiles_updated_at with explicit search_path
CREATE OR REPLACE FUNCTION public.update_brand_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate update_content_templates_updated_at with explicit search_path
CREATE OR REPLACE FUNCTION public.update_content_templates_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate update_scheduled_posts_updated_at with explicit search_path
CREATE OR REPLACE FUNCTION public.update_scheduled_posts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate update_content_plans_updated_at with explicit search_path
CREATE OR REPLACE FUNCTION public.update_content_plans_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate update_planned_posts_updated_at with explicit search_path
CREATE OR REPLACE FUNCTION public.update_planned_posts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate get_planned_posts_sg with explicit search_path
CREATE OR REPLACE FUNCTION public.get_planned_posts_sg(user_uuid uuid)
RETURNS TABLE (
  id uuid,
  content_plan_id uuid,
  user_id uuid,
  title text,
  suggested_date date,
  suggested_time time,
  rationale text,
  platforms text[],
  status text,
  order_in_plan integer,
  created_at timestamptz,
  sg_date date,
  sg_time time
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.id,
    pp.content_plan_id,
    pp.user_id,
    pp.title,
    pp.suggested_date,
    pp.suggested_time,
    pp.rationale,
    pp.platforms,
    pp.status,
    pp.order_in_plan,
    pp.created_at,
    (pp.suggested_date AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Singapore')::date as sg_date,
    (pp.suggested_date::timestamp + pp.suggested_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Singapore')::time as sg_time
  FROM planned_posts pp
  WHERE pp.user_id = user_uuid;
END;
$$;

-- Recreate get_scheduled_posts_sg with explicit search_path
CREATE OR REPLACE FUNCTION public.get_scheduled_posts_sg(user_uuid uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  brand_profile_id uuid,
  generated_content_id uuid,
  caption text,
  platforms text[],
  scheduled_date date,
  scheduled_time time,
  status text,
  notes text,
  hashtags text[],
  image_suggestions text[],
  created_at timestamptz,
  updated_at timestamptz,
  sg_date date,
  sg_time time
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.user_id,
    sp.brand_profile_id,
    sp.generated_content_id,
    sp.caption,
    sp.platforms,
    sp.scheduled_date,
    sp.scheduled_time,
    sp.status,
    sp.notes,
    sp.hashtags,
    sp.image_suggestions,
    sp.created_at,
    sp.updated_at,
    (sp.scheduled_date AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Singapore')::date as sg_date,
    (sp.scheduled_date::timestamp + sp.scheduled_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Singapore')::time as sg_time
  FROM scheduled_posts sp
  WHERE sp.user_id = user_uuid;
END;
$$;
