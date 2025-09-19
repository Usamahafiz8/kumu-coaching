# 🎟️ How to Create Promo Codes - Complete Guide

## 🎯 **Methods to Create Promo Codes**

### **1. 🌐 Admin Dashboard (Recommended for Regular Use)**

#### **Access the Promo Code Management Page:**
1. Go to `http://localhost:3003/login`
2. Login with admin credentials
3. Click "Promo Codes" in the navigation
4. Click "Create New Code" button

#### **Fill Out the Form:**
```
Basic Information:
- Code: INFLUENCER20 (unique identifier)
- Name: Influencer 20% Off (display name)
- Description: Special discount for influencer partnerships

Discount Settings:
- Type: Percentage or Fixed Amount
- Value: 20 (for 20% off) or 10.00 (for $10 off)
- Minimum Amount: 0 (no minimum) or 50 (minimum $50 order)
- Max Uses: 100 (limit total uses)

Validity Period:
- Valid From: Start date (optional)
- Valid Until: End date (optional)

Influencer Information:
- Name: John Doe
- Email: john@influencer.com
- Social Handle: @johndoe
- Notes: Fitness influencer with 100k followers
```

#### **Benefits:**
- ✅ User-friendly interface
- ✅ Real-time validation
- ✅ Visual feedback
- ✅ Easy management

---

### **2. 🔧 API Endpoints (For Developers)**

#### **Create Promo Code via API:**
```bash
# Step 1: Login as admin
curl -X POST http://localhost:3005/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kumu.com",
    "password": "admin123"
  }'

# Step 2: Create promo code (use token from step 1)
curl -X POST http://localhost:3005/promo-codes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

#### **API Response:**
```json
{
  "id": "uuid-here",
  "code": "INFLUENCER20",
  "name": "Influencer 20% Off",
  "type": "percentage",
  "value": 20,
  "usedCount": 0,
  "status": "active",
  "influencerName": "John Doe",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

### **3. 🚀 Automated Script (For Bulk Creation)**

#### **Run the Script:**
```bash
cd /Users/cybillnerd/Desktop/kumu/kumu-coaching
node scripts/create-promo-code.js
```

#### **Script Features:**
- ✅ Automatic admin login
- ✅ Promo code creation
- ✅ Validation testing
- ✅ Statistics display
- ✅ Error handling

#### **Customize the Script:**
```javascript
// Edit scripts/create-promo-code.js
const promoCodeData = {
  code: 'YOUR_CODE',           // Change this
  name: 'Your Code Name',      // Change this
  type: 'percentage',          // or 'fixed_amount'
  value: 25,                   // 25% or $25
  influencerName: 'Your Name', // Change this
  // ... other fields
};
```

---

### **4. 📱 Frontend Integration (For Apps)**

#### **JavaScript Example:**
```javascript
async function createPromoCode(promoData) {
  try {
    // Get admin token (from login)
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch('http://localhost:3005/promo-codes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(promoData)
    });
    
    if (response.ok) {
      const newCode = await response.json();
      console.log('Promo code created:', newCode);
      return newCode;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error creating promo code:', error);
    throw error;
  }
}

// Usage
const promoData = {
  code: 'FITNESS25',
  name: 'Fitness 25% Off',
  type: 'percentage',
  value: 25,
  influencerName: 'Sarah Johnson'
};

createPromoCode(promoData);
```

---

## 🎯 **Promo Code Types & Examples**

### **Percentage Discount:**
```json
{
  "type": "percentage",
  "value": 20,
  "description": "20% off total order"
}
```

### **Fixed Amount Discount:**
```json
{
  "type": "fixed_amount",
  "value": 10.00,
  "description": "$10 off total order"
}
```

### **Influencer-Specific Codes:**
```json
{
  "code": "SARAH20",
  "name": "Sarah's 20% Off",
  "influencerName": "Sarah Johnson",
  "influencerEmail": "sarah@fitness.com",
  "influencerSocialHandle": "@sarahfitness",
  "influencerNotes": "Fitness influencer with 500k followers"
}
```

---

## 🔍 **Validation & Testing**

### **Test Promo Code Validation:**
```bash
# Test if code is valid for $100 order
curl "http://localhost:3005/promo-codes/validate/INFLUENCER20?amount=100"
```

### **Response:**
```json
{
  "valid": true,
  "discount": 20.00,
  "promoCode": {
    "code": "INFLUENCER20",
    "name": "Influencer 20% Off",
    "type": "percentage",
    "value": 20
  }
}
```

### **Use Promo Code:**
```bash
curl -X POST http://localhost:3005/promo-codes/use/INFLUENCER20
```

---

## 📊 **Management & Analytics**

### **View All Promo Codes:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3005/promo-codes
```

### **Get Statistics:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3005/admin/promo-codes/stats
```

### **Update Promo Code:**
```bash
curl -X PUT http://localhost:3005/promo-codes/CODE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name", "maxUses": 200}'
```

### **Delete Promo Code:**
```bash
curl -X DELETE http://localhost:3005/promo-codes/CODE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 **Best Practices**

### **Code Naming:**
- ✅ Use descriptive names: `INFLUENCER20`, `FITNESS25`
- ✅ Include influencer name: `SARAH20`, `JOHN15`
- ✅ Use uppercase letters and numbers
- ❌ Avoid special characters: `@`, `#`, `$`

### **Influencer Information:**
- ✅ Always include influencer name and contact
- ✅ Add social media handles for tracking
- ✅ Include follower count in notes
- ✅ Set appropriate usage limits

### **Validation Rules:**
- ✅ Set minimum order amounts
- ✅ Limit total uses to prevent abuse
- ✅ Set expiration dates
- ✅ Test codes before publishing

### **Security:**
- ✅ Use admin authentication for creation
- ✅ Validate all input data
- ✅ Log all promo code usage
- ✅ Monitor for suspicious activity

---

## 🚀 **Quick Start Guide**

### **For Immediate Use:**
1. **Start the backend**: `cd kumu-coaching && npm run start:dev`
2. **Start the frontend**: `cd kumu-admin && npm run dev`
3. **Login to admin**: Go to `http://localhost:3003/login`
4. **Create promo code**: Click "Promo Codes" → "Create New Code"
5. **Test the code**: Use the validation endpoint

### **For Developers:**
1. **Use the API**: Direct HTTP requests to `/promo-codes`
2. **Use the script**: Run `node scripts/create-promo-code.js`
3. **Integrate**: Use the JavaScript examples in your app

### **For Bulk Creation:**
1. **Modify the script**: Edit `scripts/create-promo-code.js`
2. **Run multiple times**: Create different codes
3. **Use API loops**: Automate creation with scripts

---

## 🎉 **Success!**

You now have multiple ways to create promo codes:
- 🌐 **Admin Dashboard** - Easy visual interface
- 🔧 **API Endpoints** - Programmatic control
- 🚀 **Automated Scripts** - Bulk operations
- 📱 **Frontend Integration** - App integration

Choose the method that works best for your needs! 🚀
