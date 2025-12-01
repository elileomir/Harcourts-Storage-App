-- Secure platform_settings table
-- Drop existing insecure policy
DROP POLICY IF EXISTS "Authenticated users can update platform settings" ON platform_settings;

-- Create new secure policy for updates (Admins only)
CREATE POLICY "Admins can update platform settings"
ON platform_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
