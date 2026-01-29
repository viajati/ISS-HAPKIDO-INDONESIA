-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update their own draft reports" ON injury_reports;

-- Create new update policy that allows:
-- 1. Users to update their own draft reports
-- 2. Admin nasional to update any report (for verification)
CREATE POLICY "Users can update their own draft reports OR admin_nasional can verify"
ON injury_reports
FOR UPDATE
USING (
  -- User updating their own draft
  (auth.uid() = user_id AND status = 'draft')
  OR
  -- Admin nasional can update any report for verification
  (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin_nasional'
    )
  )
)
WITH CHECK (
  -- Same conditions for the new data
  (auth.uid() = user_id AND status = 'draft')
  OR
  (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin_nasional'
    )
  )
);

-- Make sure the function has proper permissions
GRANT EXECUTE ON FUNCTION admin_verify_report(bigint, text) TO authenticated;
