# Stripe Integration Guide for Kumu Coaching

## Overview

This guide covers the complete Stripe integration for the Kumu Coaching platform, enabling secure subscription payments through Stripe's payment infrastructure. The integration includes both backend API endpoints and frontend admin panel management.

## Features

### 🔐 Complete Stripe Integration
- **Automatic Product Creation**: Subscription plans automatically create Stripe products and prices
- **Secure Payment Processing**: All payments handled through Stripe's secure infrastructure
- **Webhook Support**: Real-time event handling for subscription changes
- **Admin Management**: Complete Stripe configuration management through admin panel
- **Test & Live Mode Support**: Seamless switching between test and live environments

### 🛡️ Security Features
- **Environment-based Configuration**: Separate test and live API keys
- **Webhook Signature Verification**: Secure webhook event processing
- **Admin-only Access**: Stripe configuration restricted to admin users
- **Secure Key Storage**: API keys stored securely in environment variables

## Backend Integration

### Stripe Service (`src/stripe/stripe.service.ts`)

The core Stripe service handles all interactions with the Stripe API:

#### Key Methods:
- `createProduct(plan)` - Creates Stripe product and price for subscription plans
- `updateProduct(plan)` - Updates existing Stripe products
- `deleteProduct(productId)` - Removes Stripe products
- `createCheckoutSession()` - Creates payment checkout sessions
- `createCustomerPortalSession()` - Creates customer portal sessions
- `constructWebhookEvent()` - Verifies and processes webhook events

#### Product Creation Flow:
```typescript
// When creating a subscription plan
const plan = await subscriptionPlanRepository.save(planData);
const stripeData = await stripeService.createProduct(plan);
plan.stripeProductId = stripeData.productId;
plan.stripePriceId = stripeData.priceId;
await subscriptionPlanRepository.save(plan);
```

### Stripe Configuration (`src/config/stripe.config.ts`)

Environment-based configuration for Stripe settings:

```typescript
export default registerAs('stripe', () => ({
  secretKey: process.env.STRIPE_SECRET_KEY,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  currency: process.env.STRIPE_CURRENCY || 'usd',
  mode: process.env.STRIPE_MODE || 'test',
}));
```

### Webhook Handling (`src/stripe/stripe.controller.ts`)

Real-time event processing for subscription changes:

```typescript
@Post('webhook')
async handleWebhook(@RawBody() payload: Buffer, @Headers('stripe-signature') signature: string) {
  const event = await this.stripeService.constructWebhookEvent(payload, signature);
  
  switch (event.type) {
    case 'checkout.session.completed':
      // Handle successful checkout
    case 'customer.subscription.created':
      // Handle new subscription
    case 'customer.subscription.updated':
      // Handle subscription update
    case 'customer.subscription.deleted':
      // Handle subscription cancellation
    case 'invoice.payment_succeeded':
      // Handle successful payment
    case 'invoice.payment_failed':
      // Handle failed payment
  }
}
```

## Admin Panel Integration

### Stripe Configuration Tab

The admin panel includes a dedicated "Stripe Config" tab with:

#### Configuration Management:
- **API Keys Management**: Secure interface for updating Stripe keys
- **Mode Switching**: Toggle between test and live modes
- **Connection Testing**: Verify Stripe API connectivity
- **Status Monitoring**: Real-time configuration status

#### Key Features:
- **Secure Key Input**: Password-masked input fields for sensitive data
- **Environment Validation**: Ensures proper key format and mode
- **Connection Testing**: Validates API keys before saving
- **Security Warnings**: Clear guidance on key security best practices

### Subscription Plan Integration

When creating or updating subscription plans:

1. **Automatic Stripe Product Creation**: Plans automatically create corresponding Stripe products
2. **Price Synchronization**: Plan prices sync with Stripe pricing
3. **Feature Mapping**: Plan features stored in Stripe product metadata
4. **Status Management**: Plan status changes reflect in Stripe

## Environment Configuration

### Required Environment Variables

Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_CURRENCY=usd
STRIPE_MODE=test
```

### Key Types:
- **Test Keys**: Start with `sk_test_` and `pk_test_`
- **Live Keys**: Start with `sk_live_` and `pk_live_`
- **Webhook Secret**: Starts with `whsec_`

## API Endpoints

### Admin Stripe Management

#### Get Stripe Configuration
```
GET /admin/stripe/config
```
**Response:**
```json
{
  "success": true,
  "message": "Stripe configuration retrieved",
  "data": {
    "publishableKey": "pk_test_...",
    "mode": "test",
    "currency": "usd"
  }
}
```

#### Test Stripe Connection
```
POST /admin/stripe/test-connection
```
**Response:**
```json
{
  "success": true,
  "message": "Stripe connection successful",
  "data": {
    "accountId": "acct_...",
    "country": "US",
    "currency": "usd"
  }
}
```

### Public Stripe Endpoints

#### Get Frontend Configuration
```
GET /stripe/config
```
**Response:**
```json
{
  "success": true,
  "message": "Stripe configuration retrieved",
  "data": {
    "publishableKey": "pk_test_...",
    "mode": "test"
  }
}
```

#### Webhook Endpoint
```
POST /stripe/webhook
```
**Headers:**
- `stripe-signature`: Webhook signature for verification

## Subscription Flow

### 1. Plan Creation (Admin)
1. Admin creates subscription plan through admin panel
2. System automatically creates Stripe product and price
3. Plan is ready for customer purchase

### 2. Customer Purchase
1. Customer selects subscription plan
2. System creates Stripe checkout session
3. Customer completes payment through Stripe
4. Webhook confirms successful payment
5. Subscription is activated in the system

### 3. Subscription Management
1. Customer can manage subscription through Stripe customer portal
2. Webhooks handle subscription changes (updates, cancellations)
3. System syncs subscription status in real-time

## Webhook Events

### Supported Events:
- `checkout.session.completed` - Successful payment
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changes
- `customer.subscription.deleted` - Subscription cancellation
- `invoice.payment_succeeded` - Successful recurring payment
- `invoice.payment_failed` - Failed payment

### Webhook Setup:
1. **Stripe Dashboard**: Configure webhook endpoint URL
2. **Endpoint URL**: `https://yourdomain.com/stripe/webhook`
3. **Events**: Select all subscription-related events
4. **Secret**: Copy webhook secret to environment variables

## Security Best Practices

### API Key Management:
- ✅ Store keys in environment variables
- ✅ Use different keys for test and live environments
- ✅ Never commit keys to version control
- ✅ Regularly rotate API keys
- ✅ Monitor key usage in Stripe dashboard

### Webhook Security:
- ✅ Always verify webhook signatures
- ✅ Use HTTPS for webhook endpoints
- ✅ Implement idempotency for webhook processing
- ✅ Log all webhook events for debugging

### Admin Panel Security:
- ✅ Restrict Stripe configuration to admin users only
- ✅ Mask sensitive data in the UI
- ✅ Implement connection testing before saving keys
- ✅ Provide clear security warnings

## Testing

### Test Mode Setup:
1. **Stripe Test Keys**: Use test API keys for development
2. **Test Cards**: Use Stripe's test card numbers
3. **Webhook Testing**: Use Stripe CLI for local webhook testing

### Test Card Numbers:
- **Successful Payment**: `4242424242424242`
- **Declined Payment**: `4000000000000002`
- **Requires Authentication**: `4000002500003155`

### Stripe CLI for Webhooks:
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/stripe/webhook

# Test webhook events
stripe trigger checkout.session.completed
```

## Production Deployment

### Pre-deployment Checklist:
- [ ] Switch to live Stripe API keys
- [ ] Update webhook endpoint URL
- [ ] Configure production webhook secret
- [ ] Test payment flow with real cards
- [ ] Verify webhook event processing
- [ ] Monitor Stripe dashboard for activity

### Environment Variables for Production:
```env
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
STRIPE_CURRENCY=usd
STRIPE_MODE=live
```

## Monitoring and Analytics

### Stripe Dashboard:
- Monitor payment success rates
- Track subscription metrics
- View customer data
- Analyze revenue trends

### Admin Panel Analytics:
- Subscription plan performance
- Payment success rates
- Customer subscription status
- Revenue tracking

## Troubleshooting

### Common Issues:

#### 1. Webhook Signature Verification Failed
**Solution**: Ensure webhook secret matches Stripe dashboard

#### 2. API Key Invalid
**Solution**: Verify key format and environment mode

#### 3. Product Creation Failed
**Solution**: Check Stripe account permissions and API limits

#### 4. Payment Processing Errors
**Solution**: Verify card details and Stripe account status

### Debug Mode:
Enable detailed logging by setting:
```env
NODE_ENV=development
```

## Support and Resources

### Stripe Documentation:
- [Stripe API Reference](https://stripe.com/docs/api)
- [Webhook Guide](https://stripe.com/docs/webhooks)
- [Testing Guide](https://stripe.com/docs/testing)

### Kumu Coaching Support:
- Check application logs for detailed error messages
- Verify environment configuration
- Test with Stripe's test mode first
- Contact development team for technical issues

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatible with**: Stripe API v2025-08-27.basil
