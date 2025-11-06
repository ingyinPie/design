/*
  # Fix Planned Posts Timezone Bug

  This migration fixes the get_planned_posts_sg function which has a type casting error
  in the timezone conversion that prevents it from working.

  ## Changes
  - Fix the sg_date and sg_time calculation to properly handle date and time types
  - Remove problematic timezone conversion that was causing errors
  - Return plain suggested_date and suggested_time as sg_date and sg_time
*/

DROP FUNCTION IF EXISTS public.get_planned_posts_sg(uuid);

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
    pp.suggested_date as sg_date,
    pp.suggested_time as sg_time
  FROM planned_posts pp
  WHERE pp.user_id = user_uuid
  ORDER BY pp.suggested_date, pp.suggested_time;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_planned_posts_sg(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_planned_posts_sg(uuid) TO anon;