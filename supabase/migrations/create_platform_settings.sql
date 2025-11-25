-- Create platform_settings table for configurable ROI calculations
CREATE TABLE IF NOT EXISTS platform_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by VARCHAR(255)
);

-- Insert default settings for ElevenLabs platform cost
INSERT INTO platform_settings (setting_key, setting_value, description) VALUES
('platform_monthly_cost', '20', 'Monthly cost in USD for ElevenLabs platform subscription'),
('platform_monthly_credits', '100000', 'Monthly credits included in the subscription'),
('platform_name', 'ElevenLabs', 'Name of the AI platform being used')
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to auto-update timestamp
CREATE OR REPLACE FUNCTION update_platform_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS platform_settings_updated_at ON platform_settings;
CREATE TRIGGER platform_settings_updated_at
    BEFORE UPDATE ON platform_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_platform_settings_timestamp();

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read settings
CREATE POLICY "Anyone can read platform settings"
    ON platform_settings FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Only authenticated users can update settings (you may want to restrict this to admins)
CREATE POLICY "Authenticated users can update platform settings"
    ON platform_settings FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
