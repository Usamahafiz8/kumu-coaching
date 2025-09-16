# Stripe Setup Guide

To get real Stripe checkout URLs, you need to set up your Stripe account and configure the API keys.

## Step 1: Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete the account setup

## Step 2: Get Your API Keys

1. Go to your Stripe Dashboard
2. Click on "Developers" → "API keys"
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)

## Step 3: Update Your .env File

Replace the placeholder values in your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_CURRENCY=gbp
STRIPE_MODE=test
```

## Step 4: Test the Integration

Once you've updated your `.env` file with real Stripe keys:

1. Restart your server: `npm run start:dev`
2. Test the checkout endpoint
3. You'll get a real Stripe checkout URL like: `https://checkout.stripe.com/c/pay/cs_test_...`

## Step 5: Test Payments

Use Stripe's test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires 3D Secure**: `4000 0025 0000 3155`

## Step 6: Webhook Setup (Optional)

For production, set up webhooks to handle payment confirmations:

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `http://your-domain.com/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.created`
4. Copy the webhook secret to your `.env` file

## Current Status

✅ **Backend Integration**: Complete
✅ **Purchase Tracking**: Complete  
✅ **Promo Code Support**: Complete
✅ **User Information Recording**: Complete
⏳ **Stripe API Keys**: Needs configuration

Once you add your real Stripe API keys, the system will generate real Stripe checkout URLs that users can use to make actual payments.

