/*
  # Remove All Auth Foreign Keys for Demo Mode

  1. Changes
    - Drop all foreign key constraints that reference auth.users
    - This allows the app to work in demo mode without authentication
    - User IDs remain as UUIDs but without foreign key validation
  
  2. Tables Updated
    - brand_profiles
    - generated_content
    - content_templates
    - scheduled_posts
    - content_plans
    - planned_posts
  
  3. Security
    - RLS policies for anon users are already in place
    - Each table still maintains user_id filtering through policies
*/

-- Drop foreign key constraints from all tables
ALTER TABLE brand_profiles DROP CONSTRAINT IF EXISTS brand_profiles_user_id_fkey;
ALTER TABLE generated_content DROP CONSTRAINT IF EXISTS generated_content_user_id_fkey;
ALTER TABLE content_templates DROP CONSTRAINT IF EXISTS content_templates_user_id_fkey;
ALTER TABLE scheduled_posts DROP CONSTRAINT IF EXISTS scheduled_posts_user_id_fkey;
ALTER TABLE content_plans DROP CONSTRAINT IF EXISTS content_plans_user_id_fkey;
ALTER TABLE planned_posts DROP CONSTRAINT IF EXISTS planned_posts_user_id_fkey;