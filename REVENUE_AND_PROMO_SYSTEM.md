# Revenue Tracking & Promo Code System

## 🎯 Overview

This system provides comprehensive revenue tracking and influencer promo code management for the Kumu Coaching platform.

## 💰 Revenue Tracking Features

### Database Schema Updates
- **Subscription Entity**: Added `amount` and `currency` fields to track actual payment amounts
- **Real Revenue Calculation**: Automatically calculates total revenue from active subscriptions
- **Currency Support**: Tracks currency for each subscription

### Admin Dashboard Revenue Display
- **Total Revenue**: Sum of all active subscription amounts
- **Active Subscriptions**: Count of currently active subscriptions
- **Total Subscriptions**: All subscriptions ever created
- **Canceled Subscriptions**: Count of canceled subscriptions

## 🎟️ Promo Code System

### PromoCode Entity Features
```typescript
interface PromoCode {
  id: string;
  code: string;                    // Unique promo code (e.g., "INFLUENCER20")
  name: string;                    // Display name
  description?: string;             // Description
  type: 'percentage' | 'fixed_amount';
  value: number;                   // Discount value
  minimumAmount?: number;          // Minimum order amount
  maxUses?: number;               // Maximum uses allowed
  usedCount: number;              // Current usage count
  validFrom?: Date;               // Start date
  validUntil?: Date;              // End date
  status: 'active' | 'inactive' | 'expired';
  
  // Influencer Information
  influencerName?: string;         // Influencer's real name
  influencerEmail?: string;       // Contact email
  influencerSocialHandle?: string; // Social media handle
  influencerNotes?: string;       // Additional notes
}
```

### API Endpoints

#### Promo Code Management (Admin Only)
```bash
# Create new promo code
POST /promo-codes
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "code": "INFLUENCER20",
  "name": "Influencer 20% Off",
  "description": "Special discount for influencer partnerships",
  "type": "percentage",
  "value": 20,
  "minimumAmount": 0,
  "maxUses": 100,
  "validFrom": "2025-01-01T00:00:00Z",
  "validUntil": "2025-12-31T23:59:59Z",
  "influencerName": "John Doe",
  "influencerEmail": "john@influencer.com",
  "influencerSocialHandle": "@johndoe",
  "influencerNotes": "Fitness influencer with 100k followers"
}

# Get all promo codes
GET /promo-codes
Authorization: Bearer <admin_token>

# Get promo code by ID
GET /promo-codes/:id
Authorization: Bearer <admin_token>

# Update promo code
PUT /promo-codes/:id
Authorization: Bearer <admin_token>

# Delete promo code
DELETE /promo-codes/:id
Authorization: Bearer <admin_token>
```

#### Promo Code Usage (Public)
```bash
# Validate promo code
GET /promo-codes/validate/:code?amount=50.00

# Response
{
  "valid": true,
  "discount": 10.00,
  "promoCode": {
    "code": "INFLUENCER20",
    "name": "Influencer 20% Off",
    "type": "percentage",
    "value": 20
  }
}

# Use promo code
POST /promo-codes/use/:code
```

#### Admin Statistics
```bash
# Get promo code statistics
GET /admin/promo-codes/stats
Authorization: Bearer <admin_token>

# Response
{
  "totalPromoCodes": 15,
  "activePromoCodes": 12,
  "totalUses": 150,
  "topPromoCodes": [
    {
      "code": "INFLUENCER20",
      "name": "Influencer 20% Off",
      "usedCount": 45,
      "influencerName": "John Doe"
    }
  ]
}
```

## 📊 Admin Dashboard Features

### Revenue Statistics
- **Total Revenue**: Real-time calculation from subscription amounts
- **Active Subscriptions**: Currently active subscription count
- **Total Subscriptions**: All-time subscription count
- **Canceled Subscriptions**: Canceled subscription count

### Promo Code Statistics
- **Total Promo Codes**: All promo codes created
- **Active Promo Codes**: Currently active codes
- **Total Uses**: Total times codes have been used
- **Top Performers**: Most used promo codes with influencer info

## 🎯 Influencer Management

### Tracking Influencer Information
- **Name**: Real name of the influencer
- **Email**: Contact email for business inquiries
- **Social Handle**: Instagram/TikTok/YouTube handle
- **Notes**: Additional information about the influencer
- **Performance**: Track which influencer's codes are most used

### Promo Code Types
1. **Percentage Discount**: e.g., 20% off
2. **Fixed Amount**: e.g., $10 off

### Validation Rules
- **Date Range**: Codes can have start and end dates
- **Minimum Amount**: Require minimum order value
- **Max Uses**: Limit total number of uses
- **Status**: Active, inactive, or expired

## 🚀 Usage Examples

### Creating an Influencer Promo Code
```javascript
const promoCodeData = {
  code: 'FITNESS20',
  name: 'Fitness Influencer 20% Off',
  description: 'Special discount for fitness influencer partnerships',
  type: 'percentage',
  value: 20,
  minimumAmount: 50,
  maxUses: 50,
  validFrom: new Date(),
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  influencerName: 'Sarah Johnson',
  influencerEmail: 'sarah@fitness.com',
  influencerSocialHandle: '@sarahfitness',
  influencerNotes: 'Fitness influencer with 500k followers on Instagram'
};
```

### Validating a Promo Code
```javascript
// Check if code is valid for a $100 order
const response = await fetch('/promo-codes/validate/FITNESS20?amount=100');
const result = await response.json();

if (result.valid) {
  console.log(`Discount: $${result.discount}`);
  console.log(`Final amount: $${100 - result.discount}`);
}
```

## 🔧 Technical Implementation

### Database Schema
- **PromoCode Entity**: Complete influencer tracking
- **Subscription Entity**: Revenue tracking with amount/currency
- **TypeORM Integration**: Full CRUD operations
- **Enum Support**: Promo code types and statuses

### Security
- **Admin Authentication**: All management endpoints require admin tokens
- **Validation**: Comprehensive promo code validation
- **Rate Limiting**: Built-in protection against abuse

### Performance
- **Efficient Queries**: Optimized database queries for statistics
- **Caching**: Statistics can be cached for better performance
- **Indexing**: Database indexes on frequently queried fields

## 📈 Analytics & Reporting

### Revenue Analytics
- Track revenue growth over time
- Identify top-performing subscription periods
- Monitor subscription cancellation rates

### Influencer Analytics
- Track which influencers drive the most sales
- Monitor promo code usage patterns
- Identify top-performing influencer partnerships

### Promo Code Performance
- Most used promo codes
- Conversion rates by influencer
- Revenue impact of promo codes

## 🎉 Benefits

1. **Real Revenue Tracking**: Accurate financial reporting
2. **Influencer Management**: Complete influencer partnership tracking
3. **Promo Code Analytics**: Data-driven marketing decisions
4. **Admin Dashboard**: Beautiful, comprehensive management interface
5. **Scalable System**: Handles growth in users and influencers
6. **Security**: Protected admin-only management features

This system provides everything needed to manage influencer partnerships and track revenue effectively! 🚀
