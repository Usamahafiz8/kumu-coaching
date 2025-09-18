-- Database Schema Fix for Kumu Coaching
-- Run this on your staging database to fix schema issues

-- Drop the avatar column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS avatar;

-- Ensure all required columns exist with proper types
ALTER TABLE users 
  ALTER COLUMN email TYPE VARCHAR(255),
  ALTER COLUMN password TYPE VARCHAR(255),
  ALTER COLUMN "firstName" TYPE VARCHAR(255),
  ALTER COLUMN "lastName" TYPE VARCHAR(255),
  ALTER COLUMN phone TYPE VARCHAR(255),
  ALTER COLUMN "emailVerificationToken" TYPE VARCHAR(255),
  ALTER COLUMN "passwordResetToken" TYPE VARCHAR(255),
  ALTER COLUMN "passwordResetExpires" TYPE TIMESTAMP,
  ALTER COLUMN role TYPE VARCHAR(255);

-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  "stripePriceId" VARCHAR(255),
  "stripeProductId" VARCHAR(255),
  "isActive" BOOLEAN DEFAULT true,
  "isSubscription" BOOLEAN DEFAULT false,
  "billingInterval" VARCHAR(50),
  "trialPeriodDays" INTEGER,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" VARCHAR(255) NOT NULL,
  "productId" VARCHAR(255) NOT NULL,
  "stripeSubscriptionId" VARCHAR(255),
  "stripeCustomerId" VARCHAR(255),
  status VARCHAR(50) DEFAULT 'inactive',
  "currentPeriodStart" TIMESTAMP,
  "currentPeriodEnd" TIMESTAMP,
  "cancelAtPeriodEnd" BOOLEAN DEFAULT false,
  "canceledAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
ALTER TABLE subscriptions 
  ADD CONSTRAINT fk_subscriptions_user 
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE subscriptions 
  ADD CONSTRAINT fk_subscriptions_product 
  FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_active ON products("isActive");
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions("userId");
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
