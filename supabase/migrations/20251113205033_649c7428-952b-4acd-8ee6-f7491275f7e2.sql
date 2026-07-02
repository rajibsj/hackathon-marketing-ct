-- Create control_tower_api_keys table (idempotent — may already exist from 20251113000001)
CREATE TABLE IF NOT EXISTS control_tower_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text NOT NULL,
  api_key_encrypted text NOT NULL,
  scopes text[] NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  rate_limit_per_hour integer DEFAULT 1000,
  CONSTRAINT key_name_unique UNIQUE (key_name)
);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at ON control_tower_api_keys;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON control_tower_api_keys
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE control_tower_api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view API keys" ON control_tower_api_keys;
CREATE POLICY "Admins can view API keys"
ON control_tower_api_keys FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Super admins can insert API keys" ON control_tower_api_keys;
CREATE POLICY "Super admins can insert API keys"
ON control_tower_api_keys FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
);

DROP POLICY IF EXISTS "Super admins can update API keys" ON control_tower_api_keys;
CREATE POLICY "Super admins can update API keys"
ON control_tower_api_keys FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
);

DROP POLICY IF EXISTS "Super admins can delete API keys" ON control_tower_api_keys;
CREATE POLICY "Super admins can delete API keys"
ON control_tower_api_keys FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_control_tower_api_keys_is_active ON control_tower_api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_control_tower_api_keys_created_by ON control_tower_api_keys(created_by);
