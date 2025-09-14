# Influencer System Implementation Guide

## Overview

The influencer system allows administrators to promote users to influencers, who can then create promo codes to refer customers and earn commissions on successful referrals. The system includes:

- **Influencer Management**: Admin can create, update, and manage influencers
- **Promo Code System**: Influencers can create and manage promo codes
- **Commission Tracking**: Automatic commission calculation and tracking
- **Withdrawal System**: Influencers can request payouts via Stripe
- **Dashboard**: Separate dashboard for influencers to track their performance

## Database Schema

### New Entities

#### 1. Influencer Entity
```typescript
- id: string (UUID)
- userId: string (UUID, unique)
- commissionRate: number (percentage, default 10%)
- totalEarnings: number
- availableBalance: number
- totalWithdrawn: number
- status: 'active' | 'inactive' | 'suspended'
- stripeAccountId: string (for payouts)
- bankAccountId: string (for bank transfers)
- notes: string
- totalReferrals: number
- successfulReferrals: number
- createdAt: Date
- updatedAt: Date
```

#### 2. PromoCode Entity
```typescript
- id: string (UUID)
- code: string (unique)
- influencerId: string (UUID)
- type: 'percentage' | 'fixed_amount'
- value: number (discount value)
- maxDiscount: number (optional, for percentage codes)
- minOrderAmount: number (optional)
- usageLimit: number (0 = unlimited)
- usedCount: number
- status: 'active' | 'inactive' | 'expired'
- expiresAt: Date (optional)
- description: string
- createdAt: Date
- updatedAt: Date
```

#### 3. Commission Entity
```typescript
- id: string (UUID)
- influencerId: string (UUID)
- subscriptionId: string (UUID)
- subscriptionAmount: number
- commissionRate: number (at time of purchase)
- commissionAmount: number
- status: 'pending' | 'approved' | 'paid' | 'cancelled'
- paidAt: Date (optional)
- payoutId: string (Stripe payout ID)
- notes: string
- createdAt: Date
- updatedAt: Date
```

### Updated Entities

#### Subscription Entity
- Added `promoCodeId: string` field
- Added relationships to `PromoCode` and `Commission`

#### User Entity
- Added `OneToOne` relationship to `Influencer`

## API Endpoints

### Admin Endpoints

#### Influencer Management
- `POST /admin/influencers` - Create new influencer
- `GET /admin/influencers` - Get all influencers (paginated)
- `GET /admin/influencers/:id` - Get influencer by ID
- `PUT /admin/influencers/:id` - Update influencer
- `DELETE /admin/influencers/:id` - Delete influencer
- `GET /admin/influencers/:id/stats` - Get influencer statistics

#### Commission Management
- `GET /admin/commissions` - Get all commissions (paginated)
- `PUT /admin/commissions/:id/status` - Update commission status

### Influencer Endpoints

#### Profile & Dashboard
- `GET /influencer/my-profile` - Get own influencer profile
- `GET /influencer/my-dashboard` - Get dashboard statistics
- `GET /influencer/my/promo-codes` - Get own promo codes
- `GET /influencer/my/commissions` - Get own commissions

#### Promo Code Management
- `POST /influencer/promo-codes` - Create promo code
- `GET /influencer/promo-codes/:influencerId` - Get promo codes by influencer
- `PUT /influencer/promo-codes/:id` - Update promo code
- `DELETE /influencer/promo-codes/:id` - Delete promo code

#### Withdrawals
- `POST /influencer/my/withdrawal` - Request withdrawal

### Public Endpoints

#### Promo Code Validation
- `POST /influencer/validate-promo-code` - Validate promo code (no auth required)
- `POST /subscriptions/validate-promo-code` - Validate promo code for subscription

## Frontend Components

### Admin Panel

#### InfluencerManager Component
- **Location**: `kumu-admin/src/components/InfluencerManager.tsx`
- **Features**:
  - View all influencers with stats
  - Create/edit/delete influencers
  - Create promo codes for influencers
  - Manage commission statuses
  - View commission history

#### Integration
- Added to admin dashboard with new "Influencers" tab
- Includes tabs for influencers and commissions management

### Influencer Dashboard

#### InfluencerDashboard Component
- **Location**: `kumu-admin/src/components/InfluencerDashboard.tsx`
- **Features**:
  - Overview with key metrics
  - Promo code management
  - Commission history
  - Withdrawal requests
  - Performance statistics

#### Access
- **URL**: `/influencer/dashboard`
- **Authentication**: Requires valid JWT token
- **Access Control**: Only accessible to users who are influencers

## Business Logic

### Commission Calculation
1. When a customer uses a promo code during subscription purchase:
   - Promo code is validated
   - Discount is applied to subscription amount
   - Commission is calculated based on influencer's commission rate
   - Commission record is created with "pending" status

2. Commission amount = (Original subscription amount × Commission rate) / 100

### Promo Code Validation
1. Check if code exists and is active
2. Verify expiration date
3. Check usage limits
4. Validate minimum order amount
5. Calculate discount amount
6. Apply maximum discount limit (for percentage codes)

### Withdrawal Process
1. Influencer requests withdrawal
2. System validates available balance (minimum $10)
3. Creates Stripe payout to influencer's account
4. Updates influencer's balance
5. Records withdrawal transaction

## Configuration

### Environment Variables
```env
# Stripe Configuration (already existing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=usd
STRIPE_MODE=test
```

### Database Migration
The new entities will be automatically created when the application starts with TypeORM synchronization enabled.

## Usage Examples

### Creating an Influencer (Admin)
```typescript
POST /admin/influencers
{
  "userId": "user-uuid",
  "commissionRate": 15.0,
  "status": "active",
  "notes": "Top performer"
}
```

### Creating a Promo Code (Admin)
```typescript
POST /influencer/promo-codes
{
  "code": "SAVE20",
  "influencerId": "influencer-uuid",
  "type": "percentage",
  "value": 20,
  "maxDiscount": 50,
  "usageLimit": 100,
  "description": "20% off for new customers"
}
```

### Validating a Promo Code
```typescript
POST /subscriptions/validate-promo-code
{
  "code": "SAVE20",
  "orderAmount": 100
}

// Response
{
  "isValid": true,
  "discountAmount": 20,
  "finalAmount": 80,
  "promoCode": {
    "id": "promo-uuid",
    "code": "SAVE20",
    "type": "percentage",
    "value": 20,
    "maxDiscount": 50
  }
}
```

### Purchasing with Promo Code
```typescript
POST /subscriptions/purchase
{
  "planId": "plan-uuid",
  "promoCode": "SAVE20"
}
```

## Security Considerations

1. **Authentication**: All admin and influencer endpoints require JWT authentication
2. **Authorization**: Admin endpoints check for admin role
3. **Promo Code Validation**: Public endpoint but rate-limited
4. **Commission Security**: Only admins can approve/deny commissions
5. **Withdrawal Limits**: Minimum withdrawal amount and balance validation

## Monitoring & Analytics

### Key Metrics Tracked
- Total referrals per influencer
- Conversion rates
- Commission amounts
- Withdrawal history
- Promo code usage statistics

### Admin Dashboard Features
- Influencer performance overview
- Commission approval workflow
- Promo code usage analytics
- Revenue impact tracking

## Future Enhancements

1. **Automated Commission Approval**: Auto-approve commissions after certain conditions
2. **Tiered Commission Rates**: Different rates based on performance
3. **Referral Tracking**: Track referral sources and attribution
4. **Advanced Analytics**: Detailed reporting and insights
5. **Multi-currency Support**: Support for different currencies
6. **Bulk Operations**: Bulk commission approvals and payouts

## Troubleshooting

### Common Issues

1. **Promo Code Not Working**
   - Check if code is active and not expired
   - Verify usage limits
   - Ensure minimum order amount is met

2. **Commission Not Created**
   - Verify influencer is active
   - Check commission rate is set
   - Ensure promo code was applied correctly

3. **Withdrawal Failed**
   - Check Stripe account configuration
   - Verify minimum withdrawal amount
   - Ensure sufficient balance

### Error Handling
- All endpoints include proper error handling
- Validation errors are returned with descriptive messages
- Database constraints prevent invalid data
- Stripe errors are caught and handled gracefully
