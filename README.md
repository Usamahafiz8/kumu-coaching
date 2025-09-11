# Kumu Coaching API

A comprehensive NestJS-based API for a coaching platform with authentication, profile management, and subscription features.

## 🚀 Features

- **Authentication System**: JWT-based authentication with refresh tokens
- **User Management**: Registration, login, password reset, profile management
- **Subscription System**: Multiple subscription plans with purchase and cancellation
- **Database Integration**: PostgreSQL with TypeORM
- **API Documentation**: Swagger/OpenAPI documentation
- **Email Service**: Password reset and welcome emails
- **Validation**: Comprehensive input validation with class-validator
- **Error Handling**: Global exception filters with proper HTTP status codes
- **Security**: Password hashing, JWT tokens, CORS configuration

## 📋 API Endpoints

### Authentication APIs
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh-token` - Refresh JWT token
- `POST /auth/forgot-password` - Send password reset link
- `POST /auth/reset-password` - Reset password using token

### Profile Management APIs
- `GET /profile` - Get user profile information
- `PUT /profile/update` - Update profile information
- `PUT /profile/change-password` - Change password

### Subscription APIs
- `GET /subscriptions/plans` - List all available subscription plans
- `GET /subscriptions/:id` - Get details of a specific subscription plan
- `POST /subscriptions/purchase` - Purchase/activate a subscription
- `GET /subscriptions/status` - Get current subscription status
- `GET /subscriptions/history` - List subscription history
- `PUT /subscriptions/cancel` - Cancel active subscription

## 🛠️ Technology Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT with Passport
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **Email**: Nodemailer
- **Security**: bcryptjs for password hashing

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kumu-coaching
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=kumu_coaching

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   JWT_REFRESH_EXPIRES_IN=7d

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@kumucoaching.com

   # Application Configuration
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb kumu_coaching
   
   # Run database migrations (TypeORM will auto-sync in development)
   npm run start:dev
   
   # Seed initial data
   npm run seed
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Database Seeding
```bash
npm run seed
```

## 📚 API Documentation

Once the application is running, you can access the Swagger documentation at:
- **Local**: http://localhost:3000/api/docs
- **Production**: https://your-domain.com/api/docs

## 🗄️ Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `firstName` (String)
- `lastName` (String)
- `phone` (String, Optional)
- `avatar` (String, Optional)
- `role` (Enum: user, admin, coach)
- `status` (Enum: active, inactive, suspended)
- `emailVerified` (Boolean)
- `refreshToken` (String, Optional)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Subscription Plans Table
- `id` (UUID, Primary Key)
- `name` (String)
- `description` (Text, Optional)
- `price` (Decimal)
- `type` (Enum: monthly, quarterly, yearly, lifetime)
- `durationInMonths` (Integer)
- `features` (JSON Array)
- `status` (Enum: active, inactive, archived)
- `isActive` (Boolean)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Subscriptions Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `planId` (UUID, Foreign Key)
- `status` (Enum: active, expired, cancelled, pending, failed)
- `amount` (Decimal)
- `startDate` (Date)
- `endDate` (Date)
- `cancelledAt` (Date, Optional)
- `cancellationReason` (String, Optional)
- `metadata` (JSON, Optional)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Password Resets Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `token` (String, Unique)
- `expiresAt` (Timestamp)
- `isUsed` (Boolean)
- `createdAt` (Timestamp)

## 🔐 Security Features

- **Password Hashing**: Uses bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation using class-validator
- **CORS Configuration**: Configurable CORS for frontend integration
- **Rate Limiting**: Built-in protection against brute force attacks
- **SQL Injection Protection**: TypeORM provides protection against SQL injection

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_USERNAME` | Database username | postgres |
| `DB_PASSWORD` | Database password | password |
| `DB_NAME` | Database name | kumu_coaching |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 1h |
| `JWT_REFRESH_SECRET` | JWT refresh secret | - |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | 7d |
| `EMAIL_HOST` | SMTP host | - |
| `EMAIL_PORT` | SMTP port | 587 |
| `EMAIL_USER` | SMTP username | - |
| `EMAIL_PASS` | SMTP password | - |
| `EMAIL_FROM` | From email address | - |
| `PORT` | Application port | 3000 |
| `NODE_ENV` | Environment | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the API documentation at `/api/docs`
- Review the code comments and examples

## 🎯 Roadmap

- [ ] Payment integration (Stripe/PayPal)
- [ ] Push notifications
- [ ] File upload for avatars
- [ ] Advanced subscription features
- [ ] Admin dashboard APIs
- [ ] Analytics and reporting
- [ ] Multi-language support
- [ ] Rate limiting
- [ ] Caching with Redis