/*
  # Fix Scheduled Posts Function

  This migration fixes the get_scheduled_posts_sg function to include all required fields
  that the frontend expects, particularly the title, image_url, timezone, and metadata fields.

  ## Changes
  - Drop and recreate get_scheduled_posts_sg function with complete field list
  - Ensures the function returns all fields from scheduled_posts table
  - Maintains Singapore timezone conversion for sg_date and sg_time
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_scheduled_posts_sg(uuid);

-- Recreate with all required fields
CREATE OR REPLACE FUNCTION public.get_scheduled_posts_sg(user_uuid uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  brand_profile_id uuid,
  generated_content_id uuid,
  title text,
  caption text,
  hashtags text[],
  platforms text[],
  image_url text,
  scheduled_date date,
  scheduled_time time,
  timezone text,
  status text,
  notes text,
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
    sp.id,
    sp.user_id,
    sp.brand_profile_id,
    sp.generated_content_id,
    sp.title,
    sp.caption,
    sp.hashtags,
    sp.platforms,
    sp.image_url,
    sp.scheduled_date,
    sp.scheduled_time,
    sp.timezone,
    sp.status,
    sp.notes,
    sp.metadata,
    sp.created_at,
    sp.updated_at,
    (sp.scheduled_date AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Singapore')::date as sg_date,
    (sp.scheduled_date::timestamp + sp.scheduled_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Singapore')::time as sg_time
  FROM scheduled_posts sp
  WHERE sp.user_id = user_uuid;
END;
$$;
