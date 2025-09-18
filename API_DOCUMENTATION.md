# Kumu Coaching Backend API Documentation

## Overview
This is a comprehensive NestJS backend API for Kumu Coaching with the following features:
- User authentication and management
- Product management
- Stripe payment integration
- Subscription management
- Email services for password reset

## Environment Variables
Make sure to set up your `.env` file with the following variables:

```env
# Database Configuration
DB_HOST=database-3.chgki6kqcigb.eu-north-1.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=90E9hC6LEWhVcivMerwh
DB_DATABASE=postgres

# JWT Configuration
JWT_SECRET=kumu-coaching-super-secret-jwt-key-2024-production-ready
JWT_EXPIRES_IN=24h

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@kumucoaching.com
EMAIL_FROM_NAME=Kumu Coaching
EMAIL_REPLY_TO=kumu@cybillnerd.com

# Application Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51S2C6wFooGVEYWinYUOS6mh3NAfpgND0UaQlCi2fYhI85WWcVqAAD3lbJO40HdCzYp14lVSM7G072lgIbaLAVGT300JlTb6K2O
STRIPE_PUBLISHABLE_KEY=pk_test_51S2C6wFooGVEYWinDCHVnBusHv0LCZ0a5ElhIT47WmDzR7Ax5T4yEC6VeYNnfFySpmsS4qPft3lcVETSOcxB5LTH00pC23Lir1
STRIPE_WEBHOOK_SECRET=we_1S7XPxFooGVEYWinZcGgsKC1
STRIPE_CURRENCY=usd
STRIPE_MODE=test

# Subscription URLs
SUBSCRIPTION_SUCCESS_URL=http://localhost:3001/subscription/success
SUBSCRIPTION_CANCEL_URL=http://localhost:3001/subscription/cancel
```

## API Endpoints

### Authentication (`/auth`)

#### POST `/auth/signup`
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST `/auth/login`
Login user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/auth/forgot-password`
Request password reset
```json
{
  "email": "user@example.com"
}
```

#### POST `/auth/reset-password`
Reset password with token
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

#### POST `/auth/change-password`
Change password (requires authentication)
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### GET `/auth/profile`
Get current user profile (requires authentication)

### Users (`/users`)

#### GET `/users/profile`
Get user profile (requires authentication)

#### PUT `/users/profile`
Update user profile (requires authentication)
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "newemail@example.com",
  "phone": "+1234567890"
}
```

### Products (`/products`)

#### GET `/products`
Get all active products

#### GET `/products/:id`
Get product by ID

#### POST `/products`
Create new product (requires authentication)
```json
{
  "name": "Premium Coaching",
  "description": "One-on-one coaching sessions",
  "price": 99.99,
  "currency": "USD",
  "isSubscription": true,
  "billingInterval": "month"
}
```

#### PUT `/products/:id`
Update product (requires authentication)

#### DELETE `/products/:id`
Deactivate product (requires authentication)

### Stripe Payments (`/stripe`)

#### POST `/stripe/create-checkout-session`
Create Stripe checkout session (requires authentication)
```json
{
  "productId": "product-uuid"
}
```

#### POST `/stripe/webhook`
Stripe webhook endpoint (no authentication required)

### Subscriptions (`/subscriptions`)

#### GET `/subscriptions`
Get user subscriptions (requires authentication)

#### GET `/subscriptions/status`
Get subscription status (requires authentication)

#### POST `/subscriptions/:id/cancel`
Cancel subscription (requires authentication)

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `firstName` (String, Optional)
- `lastName` (String, Optional)
- `phone` (String, Optional)
- `isEmailVerified` (Boolean, Default: false)
- `emailVerificationToken` (String, Optional)
- `passwordResetToken` (String, Optional)
- `passwordResetExpires` (Date, Optional)
- `role` (String, Default: 'user')
- `createdAt` (Date)
- `updatedAt` (Date)

### Products Table
- `id` (UUID, Primary Key)
- `name` (String)
- `description` (Text)
- `price` (Decimal)
- `currency` (String, Default: 'USD')
- `stripePriceId` (String, Optional)
- `stripeProductId` (String, Optional)
- `isActive` (Boolean, Default: true)
- `isSubscription` (Boolean, Default: false)
- `billingInterval` (String, Optional)
- `trialPeriodDays` (Number, Optional)
- `createdAt` (Date)
- `updatedAt` (Date)

### Subscriptions Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `productId` (UUID, Foreign Key)
- `stripeSubscriptionId` (String, Optional)
- `stripeCustomerId` (String, Optional)
- `status` (Enum: active, inactive, canceled, past_due, unpaid, trialing)
- `currentPeriodStart` (Date, Optional)
- `currentPeriodEnd` (Date, Optional)
- `cancelAtPeriodEnd` (Boolean, Optional)
- `canceledAt` (Date, Optional)
- `createdAt` (Date)
- `updatedAt` (Date)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables in `.env` file

3. Start the development server:
```bash
npm run start:dev
```

4. The API will be available at `http://localhost:3000`

## Features Implemented

✅ **User Authentication**
- User registration with email/password
- JWT-based authentication
- Password reset via email
- Profile management

✅ **Product Management**
- CRUD operations for products
- Support for one-time payments and subscriptions
- Stripe integration

✅ **Payment Processing**
- Stripe Checkout integration
- Webhook handling for payment events
- Support for both one-time and recurring payments

✅ **Subscription Management**
- Subscription creation and management
- Status tracking
- Cancellation handling

✅ **Email Services**
- Password reset emails
- Welcome emails
- Configurable SMTP settings

✅ **Security Features**
- Password hashing with bcrypt
- JWT token authentication
- Input validation
- Rate limiting
- CORS configuration

## Testing

Run the test suite:
```bash
npm run test
```

Run e2e tests:
```bash
npm run test:e2e
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Configure production database
3. Set up proper SSL certificates
4. Configure production email settings
5. Set up Stripe webhook endpoints
6. Deploy to your preferred hosting platform

## API Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```
