# Stripe Payment Integration for Kumu Coaching

This document explains how to use the newly implemented Stripe payment integration for subscription purchases.

## 🚀 Features

- **Stripe Payment Processing**: Secure payment processing using Stripe Payment Intents
- **Email Notifications**: Automatic email confirmation after successful subscription purchase
- **Webhook Support**: Real-time payment status updates via Stripe webhooks
- **Subscription Management**: Complete subscription lifecycle management
- **Error Handling**: Comprehensive error handling and logging

## 📋 Setup Instructions

### 1. Environment Variables

Add the following Stripe configuration to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_CURRENCY=usd
```

### 2. Stripe Dashboard Setup

1. **Create a Stripe Account**: Sign up at [stripe.com](https://stripe.com)
2. **Get API Keys**: 
   - Go to Developers > API Keys
   - Copy your Publishable key and Secret key
   - Use test keys for development
3. **Set up Webhooks**:
   - Go to Developers > Webhooks
   - Add endpoint: `https://your-domain.com/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the webhook signing secret

## 🔧 API Endpoints

### Create Payment Intent

**POST** `/subscriptions/create-payment-intent`

Creates a Stripe payment intent for subscription purchase.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "planId": "123e4567-e89b-12d3-a456-426614174000",
  "paymentMethodId": "pm_1234567890", // Optional
  "metadata": {
    "coupon": "WELCOME10",
    "source": "web"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment intent created successfully",
  "data": {
    "paymentIntentId": "pi_1234567890",
    "clientSecret": "pi_1234567890_secret_abc123",
    "publishableKey": "pk_test_1234567890",
    "amount": 2999,
    "currency": "usd",
    "status": "requires_payment_method"
  }
}
```

### Confirm Payment

**POST** `/subscriptions/confirm-payment`

Confirms payment and activates subscription.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "paymentIntentId": "pi_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed and subscription activated successfully",
  "data": {
    "id": "sub_1234567890",
    "userId": "user_1234567890",
    "planId": "plan_1234567890",
    "status": "active",
    "amount": 29.99,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-02-01T00:00:00.000Z",
    "stripePaymentIntentId": "pi_1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Webhook Endpoint

**POST** `/webhooks/stripe`

Handles Stripe webhook events (automatically called by Stripe).

## 💳 Frontend Integration

### 1. Install Stripe.js

```bash
npm install @stripe/stripe-js
```

### 2. Basic Implementation

```javascript
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripe = await loadStripe('pk_test_your_publishable_key');

// Create payment intent
const response = await fetch('/api/subscriptions/create-payment-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    planId: 'your-plan-id',
    metadata: { source: 'web' }
  })
});

const { data } = await response.json();

// Confirm payment
const { error } = await stripe.confirmCardPayment(data.clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'Customer Name',
    },
  }
});

if (error) {
  console.error('Payment failed:', error);
} else {
  // Payment succeeded
  console.log('Payment succeeded!');
  
  // Confirm payment on backend
  await fetch('/api/subscriptions/confirm-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      paymentIntentId: data.paymentIntentId
    })
  });
}
```

### 3. React Component Example

```jsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_your_publishable_key');

const SubscriptionForm = ({ planId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Create payment intent
      const response = await fetch('/api/subscriptions/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ planId })
      });

      const { data } = await response.json();

      // Confirm payment
      const { error } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (error) {
        console.error('Payment failed:', error);
      } else {
        // Confirm on backend
        await fetch('/api/subscriptions/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            paymentIntentId: data.paymentIntentId
          })
        });

        onSuccess();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Subscribe'}
      </button>
    </form>
  );
};
```

## 📧 Email Notifications

After a successful subscription purchase, users automatically receive a confirmation email containing:

- Subscription details (plan name, amount, duration)
- Start and end dates
- Next steps and dashboard access
- Professional styling with Kumu Coaching branding

## 🔄 Webhook Processing

The system automatically handles Stripe webhooks for:

- `payment_intent.succeeded`: Creates active subscription and sends email
- `payment_intent.payment_failed`: Creates failed subscription record

## 🛡️ Security Features

- **Webhook Signature Verification**: All webhooks are verified using Stripe signatures
- **User Authentication**: All payment endpoints require JWT authentication
- **Payment Validation**: Payment intents are validated before subscription creation
- **Duplicate Prevention**: Prevents duplicate subscriptions for the same payment

## 🐛 Error Handling

The system includes comprehensive error handling for:

- Invalid payment intents
- Failed payments
- Webhook signature verification failures
- Email sending failures
- Database errors

## 📊 Monitoring

Monitor your integration using:

- Stripe Dashboard for payment analytics
- Application logs for webhook processing
- Email delivery status
- Database subscription records

## 🚀 Testing

### Test Cards

Use these test card numbers in development:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### Test Webhooks

Use Stripe CLI to test webhooks locally:

```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```

## 📝 Notes

- All amounts are stored in cents in the database
- Email sending failures don't prevent subscription creation
- Webhooks are processed asynchronously
- The system supports both one-time and recurring payments
- All API responses follow the standard Kumu Coaching response format

## 🔗 Related Documentation

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe.js Documentation](https://stripe.com/docs/js)
- [Kumu Coaching API Documentation](http://localhost:3000/api/docs)
