const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'kumu_coaching.db');
const db = new sqlite3.Database(dbPath);

// Sample promo code
const promoCode = {
  id: 'promo-save20',
  code: 'SAVE20',
  influencerId: 'influencer-1', // You can use any UUID here
  type: 'percentage',
  value: 20, // 20% discount
  maxDiscount: 5, // Maximum £5 discount
  minOrderAmount: 10, // Minimum £10 order
  usageLimit: 100, // 100 uses
  usedCount: 0,
  status: 'active',
  expiresAt: null, // No expiration
  description: '20% off your first subscription',
  stripeCouponId: 'coupon_save20_placeholder'
};

// Insert promo code
const insertPromoCode = (promo) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO promo_codes (
        id, code, influencerId, type, value, maxDiscount, minOrderAmount,
        usageLimit, usedCount, status, expiresAt, description, stripeCouponId,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    
    db.run(sql, [
      promo.id,
      promo.code,
      promo.influencerId,
      promo.type,
      promo.value,
      promo.maxDiscount,
      promo.minOrderAmount,
      promo.usageLimit,
      promo.usedCount,
      promo.status,
      promo.expiresAt,
      promo.description,
      promo.stripeCouponId
    ], function(err) {
      if (err) {
        reject(err);
      } else {
        console.log(`✅ Added promo code: ${promo.code} (${promo.value}% discount)`);
        resolve();
      }
    });
  });
};

// Main function
async function addPromoCode() {
  try {
    console.log('🚀 Adding promo code to database...\n');
    
    await insertPromoCode(promoCode);
    
    console.log('\n🎉 Promo code added successfully!');
    console.log('\nYou can now test the checkout with promo code:');
    console.log('curl -X POST http://localhost:3000/subscriptions/checkout \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -H "Authorization: Bearer YOUR_TOKEN" \\');
    console.log('  -d \'{"planId": "plan-annual", "successUrl": "https://example.com/success", "cancelUrl": "https://example.com/cancel", "promoCode": "SAVE20"}\'');
    
  } catch (error) {
    console.error('❌ Error adding promo code:', error.message);
  } finally {
    db.close();
  }
}

// Run the script
addPromoCode();

