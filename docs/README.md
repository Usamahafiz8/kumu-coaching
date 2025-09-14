# 📚 Kumu Coaching Platform Documentation

Welcome to the comprehensive documentation for the Kumu Coaching platform. This documentation provides everything you need to understand, configure, and maintain the system.

## 📋 Documentation Structure

### 🏗️ Architecture & Flows
- **[Main README](../README.md)** - Complete system overview with architecture diagrams
- **[Authentication Flow](flows/authentication-flow.md)** - User registration, login, and role management
- **[Stripe Setup Guide](flows/stripe-setup-guide.md)** - Complete Stripe payment integration guide
- **[Email Setup Guide](flows/email-setup-guide.md)** - Email service configuration guide

### 🔌 API Documentation
- **[API Endpoints](../README.md#-api-documentation)** - Complete API reference with examples
- **[Authentication Endpoints](../README.md#authentication-endpoints)** - Login, registration, and token management
- **[Admin Endpoints](../README.md#admin-endpoints)** - Admin-only API endpoints
- **[Public Endpoints](../README.md#public-endpoints)** - Public API endpoints

### 🗄️ Database Documentation
- **[Database Schema](../README.md#️-database-schema)** - Complete database structure
- **[Entity Relationships](../README.md#core-entities)** - How entities relate to each other
- **[Migration Guide](../README.md#-getting-started)** - Database setup and seeding

## 🚀 Quick Start Guide

### 1. Backend Setup
```bash
cd kumu-coaching
npm install
npm run start:dev
```

### 2. Database Seeding
```bash
npm run seed
```

### 3. Admin Panel Access
- URL: `http://localhost:3002/admin/login`
- Email: `admin@kumucoaching.com`
- Password: `Admin123!@#`

### 4. API Documentation
- Swagger UI: `http://localhost:3000/api/docs`
- Health Check: `http://localhost:3000/health`

## 🔧 Configuration Guides

### Stripe Payment Setup
1. **Get Stripe Keys**: Follow the [Stripe Setup Guide](flows/stripe-setup-guide.md)
2. **Configure in Admin Panel**: Go to "Stripe Config" tab
3. **Test Connection**: Use test card numbers provided in the guide

### Email Service Setup
1. **Choose Provider**: Gmail, Outlook, Yahoo, or Custom SMTP
2. **Get Credentials**: Follow the [Email Setup Guide](flows/email-setup-guide.md)
3. **Configure in Admin Panel**: Go to "Email Config" tab
4. **Test Email**: Send test email to verify configuration

## 📊 System Features

### Core Modules
- **Authentication System** - JWT-based with role management
- **User Management** - Complete user CRUD operations
- **Subscription System** - Dynamic plans with Stripe integration
- **Influencer System** - Promo codes, commissions, and payouts
- **Email System** - Dynamic templates and SMTP configuration
- **Configuration System** - Dynamic app settings management

### Admin Features
- **User Management** - View, edit, and manage users
- **Subscription Plans** - Create and manage subscription plans
- **Influencer Management** - Manage influencers and commissions
- **Stripe Configuration** - Configure payment settings
- **Email Configuration** - Set up email services and templates
- **System Monitoring** - View stats and system health

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Admin, User, and Influencer roles
- **Data Encryption** - Sensitive configuration data encrypted
- **Input Validation** - Comprehensive DTO validation
- **CORS Protection** - Configurable CORS settings
- **Rate Limiting** - Built-in API rate limiting

## 🛠️ Development

### Project Structure
```
kumu-coaching/
├── src/
│   ├── admin/          # Admin module
│   ├── auth/           # Authentication module
│   ├── config/         # Configuration module
│   ├── email/          # Email module
│   ├── entities/       # Database entities
│   ├── influencer/     # Influencer module
│   ├── subscriptions/  # Subscription module
│   ├── stripe/         # Stripe integration
│   └── common/         # Shared utilities
├── docs/               # Documentation
├── test/               # Test files
└── README.md           # Main documentation
```

### Available Commands
```bash
npm run start:dev      # Start development server
npm run build          # Build for production
npm run start:prod     # Start production server
npm run test           # Run tests
npm run seed           # Seed database
npm run lint           # Lint code
```

## 📞 Support & Resources

### Documentation Links
- [Main README](../README.md) - Complete system documentation
- [Authentication Flow](flows/authentication-flow.md) - Auth system details
- [Stripe Setup Guide](flows/stripe-setup-guide.md) - Payment setup
- [Email Setup Guide](flows/email-setup-guide.md) - Email configuration

### External Resources
- [NestJS Documentation](https://docs.nestjs.com/)
- [Stripe Documentation](https://stripe.com/docs)
- [TypeORM Documentation](https://typeorm.io/)
- [Next.js Documentation](https://nextjs.org/docs)

### Getting Help
1. Check the relevant documentation section
2. Review the API documentation at `/api/docs`
3. Check the system flows in the `docs/flows/` directory
4. Review the database schema in the main README

---

**Happy Coding! 🚀**

*This documentation is maintained and updated regularly. For the latest version, always refer to the main README.md file.*
