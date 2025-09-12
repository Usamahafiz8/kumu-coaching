# 🔐 Swagger Authorization Guide

## How to Use Authentication in Swagger UI

### Step 1: Get Your Token
1. Go to `POST /auth/login` in Swagger
2. Enter your credentials:
   ```json
   {
     "email": "john.doe@example.com",
     "password": "SecurePassword123!"
   }
   ```
3. Click "Execute"
4. Copy the `accessToken` from the response

### Step 2: Authorize in Swagger
1. Click the **🔒 "Authorize"** button at the top right of Swagger UI
2. In the popup, you'll see a field labeled **"JWT-auth"**
3. Enter **ONLY** your token (without "Bearer " prefix)
4. Click **"Authorize"**
5. Click **"Close"**

### Step 3: Test Protected Endpoints
Now you can test any protected endpoint:
- `GET /auth/verify-token` - Test if your token is working
- `GET /test-auth` - Simple authentication test
- `GET /profile` - Get user profile
- `GET /subscriptions/status` - Get subscription status
- And all other protected endpoints!

## 🎯 What's New in the Updated Swagger

### Enhanced Features:
- **Auto Bearer Prefix**: Swagger automatically adds "Bearer " to your token
- **Persistent Authorization**: Your token stays authorized across page refreshes
- **Better UI**: Cleaner interface with custom styling
- **Token Verification**: New endpoint to test if your token is valid
- **Request Duration**: Shows how long each request takes
- **Filtering**: Search through endpoints easily

### New Test Endpoints:
- `GET /auth/verify-token` - Verify your JWT token
- `GET /test-auth` - Simple authentication test

## 🚨 Troubleshooting

### If authorization still doesn't work:
1. **Make sure you're using a fresh token** - login again if needed
2. **Check the token format** - it should be a long string starting with "eyJ"
3. **Don't include "Bearer "** - Swagger adds this automatically
4. **Click "Authorize" after entering the token** - just entering it isn't enough

### Common Issues:
- **401 Unauthorized**: Token is missing, expired, or invalid
- **No authorization popup**: Try refreshing the Swagger page
- **Token not persisting**: Make sure you clicked "Authorize" and "Close"

## 🎉 Success!
Once authorized, you'll see a 🔒 icon next to protected endpoints, and all your API calls will include the proper authentication header automatically!
