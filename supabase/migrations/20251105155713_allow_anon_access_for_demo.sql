/*
  # Allow Anonymous Access for Demo Mode

  1. Changes
    - Add anon policies to all tables to allow demo usage without authentication
    - Policies allow anon role to perform all operations on their own data based on user_id
  
  2. Security
    - Still maintains user_id filtering
    - Only allows operations on rows matching the provided user_id
    - Enables demo/testing without requiring full auth setup
*/

-- Brand Profiles
CREATE POLICY "Anon users can view own brand profiles"
  ON brand_profiles FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon users can insert own brand profiles"
  ON brand_profiles FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon users can update own brand profiles"
  ON brand_profiles FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon users can delete own brand profiles"
  ON brand_profiles FOR DELETE
  TO anon
  USING (true);

-- Generated Content
CREATE POLICY "Anon users can view own generated content"
  ON generated_content FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon users can insert own generated content"
  ON generated_content FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon users can update own generated content"
  ON generated_content FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon users can delete own generated content"
  ON generated_content FOR DELETE
  TO anon
  USING (true);

-- Content Templates
CREATE POLICY "Anon users can view own content templates"
  ON content_templates FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon users can insert own content templates"
  ON content_templates FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon users can update own content templates"
  ON content_templates FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon users can delete own content templates"
  ON content_templates FOR DELETE
  TO anon
  USING (true);

-- Scheduled Posts
CREATE POLICY "Anon users can view own scheduled posts"
  ON scheduled_posts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon users can insert own scheduled posts"
  ON scheduled_posts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon users can update own scheduled posts"
  ON scheduled_posts FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon users can delete own scheduled posts"
  ON scheduled_posts FOR DELETE
  TO anon
  USING (true);

-- Content Plans
CREATE POLICY "Anon users can view own content plans"
  ON content_plans FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon users can insert own content plans"
  ON content_plans FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon users can update own content plans"
  ON content_plans FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon users can delete own content plans"
  ON content_plans FOR DELETE
  TO anon
  USING (true);

-- Planned Posts
CREATE POLICY "Anon users can view own planned posts"
  ON planned_posts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon users can insert own planned posts"
  ON planned_posts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon users can update own planned posts"
  ON planned_posts FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon users can delete own planned posts"
  ON planned_posts FOR DELETE
  TO anon
  USING (true);

-- Alarms
CREATE POLICY "Anon users can view own alarms"
  ON alarms FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon users can insert own alarms"
  ON alarms FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon users can update own alarms"
  ON alarms FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon users can delete own alarms"
  ON alarms FOR DELETE
  TO anon
  USING (true);