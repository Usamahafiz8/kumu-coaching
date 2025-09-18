#!/bin/bash

echo "🚀 Fixing Staging Server Issues..."

# 1. Install missing dependencies
echo "📦 Installing missing dependencies..."
npm install pg @types/pg

# 2. Fix database schema
echo "🗄️ Fixing database schema..."
psql -h database-3.chgki6kqcigb.eu-north-1.rds.amazonaws.com -U postgres -d postgres -c "
-- Drop the avatar column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS avatar;

-- Ensure all required columns exist with proper types
ALTER TABLE users 
  ALTER COLUMN email TYPE VARCHAR(255),
  ALTER COLUMN password TYPE VARCHAR(255),
  ALTER COLUMN \"firstName\" TYPE VARCHAR(255),
  ALTER COLUMN \"lastName\" TYPE VARCHAR(255),
  ALTER COLUMN phone TYPE VARCHAR(255),
  ALTER COLUMN \"emailVerificationToken\" TYPE VARCHAR(255),
  ALTER COLUMN \"passwordResetToken\" TYPE VARCHAR(255),
  ALTER COLUMN \"passwordResetExpires\" TYPE TIMESTAMP,
  ALTER COLUMN role TYPE VARCHAR(255);
"

# 3. Create products table if it doesn't exist
echo "🛍️ Creating products table..."
psql -h database-3.chgki6kqcigb.eu-north-1.rds.amazonaws.com -U postgres -d postgres -c "
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  \"stripePriceId\" VARCHAR(255),
  \"stripeProductId\" VARCHAR(255),
  \"isActive\" BOOLEAN DEFAULT true,
  \"isSubscription\" BOOLEAN DEFAULT false,
  \"billingInterval\" VARCHAR(50),
  \"trialPeriodDays\" INTEGER,
  \"createdAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \"updatedAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"

# 4. Create subscriptions table if it doesn't exist
echo "📋 Creating subscriptions table..."
psql -h database-3.chgki6kqcigb.eu-north-1.rds.amazonaws.com -U postgres -d postgres -c "
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  \"userId\" VARCHAR(255) NOT NULL,
  \"productId\" VARCHAR(255) NOT NULL,
  \"stripeSubscriptionId\" VARCHAR(255),
  \"stripeCustomerId\" VARCHAR(255),
  status VARCHAR(50) DEFAULT 'inactive',
  \"currentPeriodStart\" TIMESTAMP,
  \"currentPeriodEnd\" TIMESTAMP,
  \"cancelAtPeriodEnd\" BOOLEAN DEFAULT false,
  \"canceledAt\" TIMESTAMP,
  \"createdAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \"updatedAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"

# 5. Add foreign key constraints
echo "🔗 Adding foreign key constraints..."
psql -h database-3.chgki6kqcigb.eu-north-1.rds.amazonaws.com -U postgres -d postgres -c "
ALTER TABLE subscriptions 
  ADD CONSTRAINT fk_subscriptions_user 
  FOREIGN KEY (\"userId\") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE subscriptions 
  ADD CONSTRAINT fk_subscriptions_product 
  FOREIGN KEY (\"productId\") REFERENCES products(id) ON DELETE CASCADE;
"

# 6. Create indexes for better performance
echo "⚡ Creating performance indexes..."
psql -h database-3.chgki6kqcigb.eu-north-1.rds.amazonaws.com -U postgres -d postgres -c "
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(\"isActive\");
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(\"userId\");
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
"

# 7. Restart the application
echo "🔄 Restarting application..."
pm2 restart kumu-coaching || pm2 start npm --name "kumu-coaching" -- run start:dev

echo "✅ Staging server fixes completed!"
echo "🔗 Test your API at: http://13.60.24.208:3000/api/docs"
echo "🧪 Run the test script: node test-api.js"
