/*
  # Fix Scheduled Posts Display Bug

  This migration fixes the get_scheduled_posts_sg function which has a type casting error
  in the timezone conversion that prevents scheduled posts from displaying on the calendar.

  ## Changes
  - Fix the sg_date and sg_time calculation to avoid timezone conversion errors
  - Return plain scheduled_date and scheduled_time as sg_date and sg_time
  - Add ORDER BY clause for consistent ordering
*/

DROP FUNCTION IF EXISTS public.get_scheduled_posts_sg(uuid);

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
    sp.scheduled_date as sg_date,
    sp.scheduled_time as sg_time
  FROM scheduled_posts sp
  WHERE sp.user_id = user_uuid
  ORDER BY sp.scheduled_date, sp.scheduled_time;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_scheduled_posts_sg(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_scheduled_posts_sg(uuid) TO anon;