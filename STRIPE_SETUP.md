# Stripe Integration Setup Guide

## 🎯 What You Need from Stripe Dashboard

### 1. **Product Information** ✅
- **Product ID**: `prod_T4wyxMacGpdDKB` (You have this!)

### 2. **Price ID** (Required - Get from Stripe Dashboard)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Products
2. Find your product `prod_T4wyxMacGpdDKB`
3. Copy the **Price ID** (starts with `price_`)

### 3. **Webhook Configuration** (Required)
1. Go to Stripe Dashboard → Webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://yourdomain.com/stripe/webhook`
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Webhook Secret** (starts with `whsec_`)

## 🔧 Environment Variables to Update

Update your `.env` file with:

```env
# Your existing Stripe keys
STRIPE_SECRET_KEY=sk_test_51S2C6wFooGVEYWinYUOS6mh3NAfpgND0UaQlCi2fYhI85WWcVqAAD3lbJO40HdCzYp14lVSM7G072lgIbaLAVGT300JlTb6K2O
STRIPE_PUBLISHABLE_KEY=pk_test_51S2C6wFooGVEYWinDCHVnBusHv0LCZ0a5ElhIT47WmDzR7Ax5T4yEC6VeYNnfFySpmsS4qPft3lcVETSOcxB5LTH00pC23Lir1

# Add your webhook secret (get from Stripe Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Update these URLs for your frontend
SUBSCRIPTION_SUCCESS_URL=http://localhost:3000/subscription/success
SUBSCRIPTION_CANCEL_URL=http://localhost:3000/subscription/cancel
```

## 📝 Create Your Product in Database

### Option 1: Using API (Recommended)
```bash
# Start your server
npm run start:dev

# Create product via API
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Kumu Coaching Premium",
    "description": "Premium coaching subscription",
    "price": 99.99,
    "currency": "USD",
    "stripeProductId": "prod_T4wyxMacGpdDKB",
    "stripePriceId": "price_YOUR_PRICE_ID_HERE",
    "isSubscription": true,
    "billingInterval": "month"
  }'
```

### Option 2: Direct Database Insert
```sql
INSERT INTO products (
  id, name, description, price, currency, 
  stripe_product_id, stripe_price_id, 
  is_active, is_subscription, billing_interval, 
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Kumu Coaching Premium',
  'Premium coaching subscription',
  99.99,
  'USD',
  'prod_T4wyxMacGpdDKB',
  'price_YOUR_PRICE_ID_HERE',
  true,
  true,
  'month',
  NOW(),
  NOW()
);
```

## 🧪 Testing the Integration

### 1. **Test Product Creation**
```bash
# Get all products
curl http://localhost:3000/products
```

### 2. **Test Checkout Session**
```bash
# Create checkout session (requires authentication)
curl -X POST http://localhost:3000/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"productId": "YOUR_PRODUCT_ID"}'
```

### 3. **Test Webhook** (Use Stripe CLI)
```bash
# Install Stripe CLI
npm install -g stripe

# Login to Stripe
stripe login

# Forward events to local server
stripe listen --forward-to localhost:3000/stripe/webhook
```

## 🚀 Production Deployment

1. **Update webhook URL** to your production domain
2. **Use live Stripe keys** (not test keys)
3. **Update success/cancel URLs** to production frontend
4. **Test with real payments** (use small amounts)

## 📋 Checklist

- [ ] Get Price ID from Stripe Dashboard
- [ ] Set up webhook endpoint
- [ ] Update environment variables
- [ ] Create product in database
- [ ] Test checkout session creation
- [ ] Test webhook handling
- [ ] Test subscription management

## 🔍 Troubleshooting

### Common Issues:
1. **"Price not found"** → Check Price ID is correct
2. **"Webhook signature invalid"** → Check webhook secret
3. **"Product not found"** → Ensure product exists in database
4. **"Session URL is null"** → Check Stripe configuration

### Debug Commands:
```bash
# Check Stripe connection
curl -H "Authorization: Bearer YOUR_STRIPE_SECRET_KEY" \
  https://api.stripe.com/v1/products/prod_T4wyxMacGpdDKB

# Test webhook locally
stripe trigger checkout.session.completed
```
