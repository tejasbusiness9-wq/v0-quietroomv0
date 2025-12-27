-- Add custom_reward_text field to inventory for wildcard permissions
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS custom_reward_text TEXT;
