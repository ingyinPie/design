/*
  # Fix Planned Posts Function

  This migration fixes the get_planned_posts_sg function to include all required fields
  that the frontend expects, particularly content_generated, caption, hashtags, image_url, metadata, and updated_at.

  ## Changes
  - Drop and recreate get_planned_posts_sg function with complete field list
  - Ensures the function returns all fields from planned_posts table
  - Maintains Singapore timezone conversion for sg_date and sg_time
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_planned_posts_sg(uuid);

-- Recreate with all required fields
CREATE OR REPLACE FUNCTION public.get_planned_posts_sg(user_uuid uuid)
RETURNS TABLE (
  id uuid,
  content_plan_id uuid,
  user_id uuid,
  title text,
  suggested_date date,
  suggested_time time,
  rationale text,
  content_generated boolean,
  caption text,
  hashtags text[],
  platforms text[],
  image_url text,
  status text,
  order_in_plan integer,
  metadata jsonb,
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
    pp.id,
    pp.content_plan_id,
    pp.user_id,
    pp.title,
    pp.suggested_date,
    pp.suggested_time,
    pp.rationale,
    pp.content_generated,
    pp.caption,
    pp.hashtags,
    pp.platforms,
    pp.image_url,
    pp.status,
    pp.order_in_plan,
    pp.metadata,
    pp.created_at,
    pp.updated_at,
    (pp.suggested_date AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Singapore')::date as sg_date,
    (pp.suggested_date::timestamp + pp.suggested_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Singapore')::time as sg_time
  FROM planned_posts pp
  WHERE pp.user_id = user_uuid;
END;
$$;
