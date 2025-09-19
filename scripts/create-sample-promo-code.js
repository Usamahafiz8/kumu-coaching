require('dotenv').config({ path: '../.env' });

// Since we're using TypeORM, let's create a simple script to test the promo code creation
const axios = require('axios');

async function createSamplePromoCode() {
  try {
    console.log('Creating sample promo code...');

    const promoCodeData = {
      code: 'INFLUENCER20',
      name: 'Influencer 20% Off',
      description: 'Special discount for influencer partnerships',
      type: 'percentage',
      value: 20,
      minimumAmount: 0,
      maxUses: 100,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      influencerName: 'John Doe',
      influencerEmail: 'john@influencer.com',
      influencerSocialHandle: '@johndoe',
      influencerNotes: 'Fitness influencer with 100k followers'
    };

    // You would need to authenticate as admin first
    console.log('Sample promo code data:', promoCodeData);
    console.log('✅ Promo code data prepared for creation');
    console.log('📝 To create this promo code, use the admin API endpoint:');
    console.log('POST http://localhost:3005/promo-codes');
    console.log('With admin authentication token');

  } catch (error) {
    console.error('❌ Error creating sample promo code:', error);
  }
}

createSamplePromoCode();
