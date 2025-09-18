# 🚀 Staging Deployment Guide

## 🚨 **Current Issues on Staging Server**

### **1. Database Schema Mismatch**
- **Problem**: Database has old schema with `avatar` column
- **Solution**: Run the database migration script

### **2. Route Registration Issues**
- **Problem**: API routes not being registered
- **Solution**: Ensure all modules are properly imported

### **3. Missing Dependencies**
- **Problem**: Some TypeORM dependencies missing
- **Solution**: Install required packages

## 🔧 **Step-by-Step Fix**

### **Step 1: Fix Database Schema**
```bash
# Connect to your staging database and run:
psql -h database-3.chgki6kqcigb.eu-north-1.rds.amazonaws.com -U postgres -d postgres -f fix-database-schema.sql
```

### **Step 2: Install Missing Dependencies**
```bash
# On your staging server, run:
npm install pg @types/pg
```

### **Step 3: Restart the Application**
```bash
# Stop the current server
pm2 stop kumu-coaching

# Start the server again
pm2 start npm --name "kumu-coaching" -- run start:dev
```

### **Step 4: Verify Deployment**
```bash
# Test the API endpoints
curl http://13.60.24.208:3000/api/docs
curl http://13.60.24.208:3000/products
```

## 📊 **Expected Results After Fix**

### **✅ Working Endpoints:**
- `GET /api/docs` - Swagger documentation
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /products` - List products
- `POST /products` - Create product (authenticated)
- `POST /stripe/create-checkout-session` - Create checkout session
- `GET /subscriptions` - Get user subscriptions

### **✅ Database Tables:**
- `users` - User management
- `products` - Product catalog
- `subscriptions` - Subscription tracking

## 🧪 **Testing Commands**

### **Test Basic Health:**
```bash
curl http://13.60.24.208:3000
```

### **Test Swagger Documentation:**
```bash
curl http://13.60.24.208:3000/api/docs
```

### **Test Product API:**
```bash
curl http://13.60.24.208:3000/products
```

### **Test Authentication:**
```bash
# Register a user
curl -X POST http://13.60.24.208:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://13.60.24.208:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔍 **Troubleshooting**

### **If Routes Still Don't Work:**
1. Check if all modules are imported in `app.module.ts`
2. Verify TypeORM entities are properly configured
3. Check server logs for dependency injection errors

### **If Database Issues Persist:**
1. Verify database connection string
2. Check if tables exist: `\dt` in psql
3. Verify column types match entity definitions

### **If Authentication Fails:**
1. Check JWT secret configuration
2. Verify email service configuration
3. Check if user table has proper columns

## 📈 **Performance Optimization**

### **Database Indexes:**
- Email lookup: `CREATE INDEX idx_users_email ON users(email);`
- Active products: `CREATE INDEX idx_products_active ON products("isActive");`
- User subscriptions: `CREATE INDEX idx_subscriptions_user ON subscriptions("userId");`

### **Environment Variables:**
```env
# Ensure these are set on staging
DB_HOST=database-3.chgki6kqcigb.eu-north-1.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=90E9hC6LEWhVcivMerwh
DB_DATABASE=postgres
JWT_SECRET=kumu-coaching-super-secret-jwt-key-2024-production-ready
```

## 🎯 **Success Criteria**

After applying the fixes, you should see:
- ✅ Swagger documentation accessible at `http://13.60.24.208:3000/api/docs`
- ✅ All API endpoints responding correctly
- ✅ Database queries working without errors
- ✅ Authentication flow working
- ✅ Product management working
- ✅ Stripe integration ready

## 🚀 **Next Steps**

1. **Apply the database migration**
2. **Restart the application**
3. **Test all endpoints**
4. **Verify Swagger documentation**
5. **Test the complete user flow**

Your staging server should be fully functional after these fixes! 🎉
