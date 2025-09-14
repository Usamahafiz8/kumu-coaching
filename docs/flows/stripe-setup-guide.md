# Stripe Setup Guide

## Overview
This guide will help you set up Stripe payment processing for the Kumu Coaching platform.

## Quick Start

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Click "Start now" or "Sign up"
3. Fill in your business information
4. Verify your email address

### 2. Get Your API Keys

#### Test Keys (For Development)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure you're in **Test mode** (toggle in top-left)
3. Click **"Developers"** → **"API keys"**
4. Copy your keys:
   - **Publishable key**: `pk_test_...` (safe for frontend)
   - **Secret key**: `sk_test_...` (keep secret, backend only)

#### Live Keys (For Production)
1. Switch to **Live mode** in Stripe Dashboard
2. Complete account verification (required for live mode)
3. Go to **"Developers"** → **"API keys"**
4. Copy your keys:
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...`

### 3. Configure in Admin Panel
1. Login to admin panel: `http://localhost:3002/admin/login`
2. Go to **"Stripe Config"** tab
3. Enter your keys:
   - **Secret Key**: Your secret key (sk_test_ or sk_live_)
   - **Publishable Key**: Your publishable key (pk_test_ or pk_live_)
   - **Mode**: Select "Test" or "Live"
   - **Currency**: Select your currency (USD, EUR, etc.)
4. Click **"Test Connection"** to verify
5. Click **"Save Configuration"**

## Webhook Setup (Recommended)

### 1. Create Webhook Endpoint
1. In Stripe Dashboard, go to **"Developers"** → **"Webhooks"**
2. Click **"Add endpoint"**
3. Set endpoint URL: `https://yourdomain.com/stripe/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**

### 2. Get Webhook Secret
1. Click on your created webhook
2. Go to **"Signing secret"** section
3. Click **"Reveal"** to show the secret
4. Copy the secret (starts with `whsec_`)
5. Add it to your admin panel configuration

## Testing Payments

### Test Card Numbers
Use these test card numbers in Stripe test mode:

| Card Number | Description |
|-------------|-------------|
| `4242424242424242` | Visa - Success |
| `4000000000000002` | Visa - Declined |
| `4000000000009995` | Visa - Insufficient funds |
| `5555555555554444` | Mastercard - Success |
| `378282246310005` | American Express - Success |

### Test Details
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

## Common Issues

### 1. "Invalid API Key" Error
- **Cause**: Wrong API key or key from wrong mode
- **Solution**: 
  - Check if you're using test keys in test mode
  - Verify the key starts with correct prefix
  - Make sure there are no extra spaces

### 2. "Webhook Signature Verification Failed"
- **Cause**: Wrong webhook secret or endpoint URL
- **Solution**:
  - Verify webhook secret in admin panel
  - Check webhook endpoint URL is correct
  - Ensure webhook is receiving events

### 3. "Payment Method Not Supported"
- **Cause**: Currency or payment method not enabled
- **Solution**:
  - Check currency settings in admin panel
  - Verify payment methods in Stripe Dashboard
  - Enable required payment methods

## Security Best Practices

### 1. Key Management
- ✅ Store secret keys securely (encrypted in database)
- ✅ Never expose secret keys in frontend code
- ✅ Use test keys for development
- ✅ Rotate keys regularly in production

### 2. Webhook Security
- ✅ Always verify webhook signatures
- ✅ Use HTTPS for webhook endpoints
- ✅ Implement idempotency for webhook handlers
- ✅ Log all webhook events for debugging

### 3. PCI Compliance
- ✅ Never store card details directly
- ✅ Use Stripe Elements for card input
- ✅ Let Stripe handle PCI compliance
- ✅ Use secure connections (HTTPS)

## Production Checklist

Before going live:

- [ ] Complete Stripe account verification
- [ ] Switch to live mode and get live keys
- [ ] Update admin panel with live keys
- [ ] Set up production webhook endpoint
- [ ] Test with real payment methods
- [ ] Configure proper error handling
- [ ] Set up monitoring and alerts
- [ ] Review Stripe's terms of service
- [ ] Set up proper tax handling
- [ ] Configure refund policies

## Support Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Support](https://support.stripe.com)

## Integration Examples

### Frontend (React)
```javascript
// Initialize Stripe
const stripe = Stripe('pk_test_...');

// Create payment method
const {error, paymentMethod} = await stripe.createPaymentMethod({
  type: 'card',
  card: cardElement,
});
```

### Backend (NestJS)
```typescript
// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000, // $20.00
  currency: 'usd',
  customer: customerId,
});
```

### Webhook Handler
```typescript
// Verify webhook signature
const event = stripe.webhooks.constructEvent(
  payload,
  signature,
  webhookSecret
);

// Handle event
switch (event.type) {
  case 'payment_intent.succeeded':
    // Handle successful payment
    break;
  case 'customer.subscription.created':
    // Handle new subscription
    break;
}
```

---

**Need Help?** Check the admin panel help section or contact support.
