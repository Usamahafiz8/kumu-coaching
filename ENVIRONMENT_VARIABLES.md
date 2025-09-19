# Environment Variables Configuration

## Required Environment Variables

Create a `.env` file in the `kumu-coaching` directory with the following variables:

### Database Configuration
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=kumu_coaching
```

### JWT Configuration
```env
JWT_SECRET=your_jwt_secret_key_here
```

### Stripe Configuration
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### Application URLs (NEW - for redirect links)
```env
FRONTEND_URL=http://localhost:3003
BACKEND_URL=http://localhost:3005
```

### Server Configuration
```env
PORT=3005
NODE_ENV=development
```

## Benefits of Using Environment Variables for URLs

1. **Flexibility**: Easy to change URLs for different environments (dev, staging, production)
2. **Security**: No hardcoded URLs in the codebase
3. **Maintainability**: Single place to update URLs
4. **Deployment**: Different URLs for different deployments

## How It Works

- **Stripe Checkout**: Uses `BACKEND_URL` for success URL and `FRONTEND_URL` for cancel URL
- **Redirects**: Uses `FRONTEND_URL` for all frontend redirects
- **Fallbacks**: If environment variables are not set, defaults to localhost URLs

## Example Usage

```typescript
// In stripe.service.ts
success_url: `${this.configService.get<string>('BACKEND_URL') || 'http://localhost:3005'}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
cancel_url: `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3003'}/cancel`,

// In stripe.controller.ts
const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3003';
req.res.redirect(`${frontendUrl}/success?session_id=${sessionId}`);
```
