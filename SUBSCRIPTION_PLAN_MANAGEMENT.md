# Subscription Plan Management System

## Overview

The subscription plan management system allows administrators to dynamically create, update, and manage subscription plans without hardcoding them in the backend. This replaces the previous hardcoded approach with a flexible, database-driven system.

## Features

### Admin Capabilities
- ✅ Create unlimited subscription plans
- ✅ Update existing subscription plans
- ✅ Delete subscription plans (with safety checks)
- ✅ View all subscription plans with pagination
- ✅ Get detailed statistics about subscription plans
- ✅ Manage plan status (active, inactive, archived)
- ✅ Set custom features, pricing, and duration

### Safety Features
- 🔒 Prevents deletion of plans with active subscriptions
- 🔒 Prevents deactivation of plans with active subscriptions
- 🔒 Validates unique plan names
- 🔒 Admin-only access with JWT authentication
- 🔒 Comprehensive error handling and validation

## API Endpoints

### Get All Subscription Plans
```
GET /admin/subscription-plans?page=1&limit=10
```
**Response:**
```json
{
  "plans": [
    {
      "id": "uuid",
      "name": "Premium Plan",
      "description": "Advanced coaching features",
      "price": 79.99,
      "type": "monthly",
      "durationInMonths": 1,
      "features": ["Feature 1", "Feature 2"],
      "status": "active",
      "isActive": true,
      "subscriptionCount": 15,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### Get Subscription Plan by ID
```
GET /admin/subscription-plans/:id
```

### Create New Subscription Plan
```
POST /admin/subscription-plans
```
**Request Body:**
```json
{
  "name": "Starter Plan",
  "description": "Perfect for beginners",
  "price": 29.99,
  "type": "monthly",
  "durationInMonths": 1,
  "features": [
    "Basic coaching materials",
    "Email support",
    "Progress tracking"
  ],
  "status": "active",
  "isActive": true
}
```

### Update Subscription Plan
```
PUT /admin/subscription-plans/:id
```
**Request Body:** (Partial update - only include fields to update)
```json
{
  "price": 39.99,
  "features": [
    "Basic coaching materials",
    "Email support",
    "Progress tracking",
    "Weekly check-ins"
  ]
}
```

### Delete Subscription Plan
```
DELETE /admin/subscription-plans/:id
```

### Get Subscription Plan Statistics
```
GET /admin/subscription-plans/stats
```
**Response:**
```json
{
  "totalPlans": 5,
  "activePlans": 4,
  "inactivePlans": 1,
  "archivedPlans": 0,
  "plansWithSubscriptions": 3,
  "mostPopularPlan": {
    "planName": "Premium Plan",
    "subscriptionCount": 25
  }
}
```

## Plan Types

The system supports the following plan types:
- `monthly` - Monthly recurring subscription
- `quarterly` - Quarterly subscription (3 months)
- `yearly` - Annual subscription (12 months)
- `lifetime` - One-time payment for lifetime access

## Plan Status

- `active` - Plan is available for new subscriptions
- `inactive` - Plan is not available for new subscriptions
- `archived` - Plan is archived and hidden from public view

## Database Seeding

### Default Behavior
The system now includes smart seeding that:
- Only creates default plans if none exist
- Skips seeding if plans already exist
- Allows force re-seeding with `--force` flag

### Running Seeds
```bash
# Normal seeding (skips if plans exist)
npm run seed

# Force re-seeding (clears existing plans)
npm run seed -- --force
```

### Default Plans Created
1. **Basic Plan** - $29.99/month
2. **Premium Plan** - $79.99/month
3. **Quarterly Premium** - $203.97/quarter (15% discount)
4. **Annual Elite** - $719.88/year (25% discount)

## Migration from Hardcoded Plans

The system is backward compatible. Existing subscriptions will continue to work with their original plans. New plans can be created through the admin interface without affecting existing data.

## Security

- All endpoints require admin authentication
- JWT token validation
- Role-based access control
- Input validation and sanitization
- SQL injection protection through TypeORM

## Error Handling

The system provides comprehensive error handling:
- `400 Bad Request` - Invalid data or business rule violations
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Plan not found
- `500 Internal Server Error` - Server-side errors

## Usage Examples

### Creating a New Plan
```bash
curl -X POST http://localhost:3000/admin/subscription-plans \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise Plan",
    "description": "For large organizations",
    "price": 199.99,
    "type": "monthly",
    "durationInMonths": 1,
    "features": [
      "Unlimited coaching sessions",
      "Priority support",
      "Custom integrations",
      "Analytics dashboard"
    ]
  }'
```

### Updating Plan Pricing
```bash
curl -X PUT http://localhost:3000/admin/subscription-plans/PLAN_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 89.99
  }'
```

## Future Enhancements

Potential future improvements:
- Plan versioning and history tracking
- A/B testing for different plan configurations
- Automated plan recommendations based on usage
- Integration with payment processors for dynamic pricing
- Plan templates for quick creation
- Bulk plan operations
- Plan analytics and insights

## Troubleshooting

### Common Issues

1. **Cannot delete plan with active subscriptions**
   - Solution: First cancel or migrate active subscriptions, then delete the plan

2. **Cannot deactivate plan with active subscriptions**
   - Solution: Set status to `inactive` instead of `isActive: false`

3. **Plan name already exists**
   - Solution: Choose a unique name for the plan

4. **Authentication errors**
   - Solution: Ensure you're logged in as an admin user with valid JWT token

### Support

For technical support or questions about the subscription plan management system, please refer to the API documentation or contact the development team.
