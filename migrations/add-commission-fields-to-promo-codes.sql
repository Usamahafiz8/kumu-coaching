-- Add commission tracking fields to promo_codes table
ALTER TABLE promo_codes 
ADD COLUMN influencer_id VARCHAR(255),
ADD COLUMN commission_percentage DECIMAL(5,2) DEFAULT 10.00,
ADD COLUMN total_commissions DECIMAL(10,2) DEFAULT 0.00;

-- Add index for influencer_id for better performance
CREATE INDEX idx_promo_codes_influencer_id ON promo_codes(influencer_id);

-- Update existing promo codes to have default commission percentage
UPDATE promo_codes 
SET commission_percentage = 10.00 
WHERE commission_percentage IS NULL;
