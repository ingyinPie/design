/*
  # Fix Alarms Foreign Key Constraint

  1. Changes
    - Drop the foreign key constraint on user_id that references auth.users
    - Change user_id to allow any UUID value for demo mode
    - Keep the column as NOT NULL but remove the foreign key reference
  
  2. Security
    - Maintain RLS policies that were already added for anon users
    - This allows demo usage without requiring authentication
*/

-- Drop the foreign key constraint
ALTER TABLE alarms DROP CONSTRAINT IF EXISTS alarms_user_id_fkey;

-- The user_id column remains as uuid NOT NULL, just without the foreign key constraint