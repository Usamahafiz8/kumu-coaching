const Stripe = require('stripe');
require('dotenv').config({ path: '.env' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

async function syncPromoToStripe() {
  try {
    console.log('🚀 Syncing promo code TEST1 to Stripe...\n');

    // Check if coupon already exists
    console.log('📝 Step 1: Checking existing coupons...');
    const coupons = await stripe.coupons.list({ limit: 100 });
    
    const existingCoupon = coupons.data.find(coupon => 
      coupon.metadata && coupon.metadata.promo_code === 'TEST1'
    );

    if (existingCoupon) {
      console.log('✅ Coupon already exists in Stripe:', existingCoupon.id);
      console.log('   Metadata:', existingCoupon.metadata);
    } else {
      console.log('📝 Step 2: Creating new coupon in Stripe...');
      
      // Create the coupon
      const coupon = await stripe.coupons.create({
        percent_off: 10,
        duration: 'once',
        metadata: {
          promo_code: 'TEST1',
          promo_code_id: 'test-id',
        },
      });

      console.log('✅ Coupon created:', coupon.id);
      console.log('   Percent off:', coupon.percent_off);
      console.log('   Duration:', coupon.duration);
    }

    // Check if promotion code exists
    console.log('\n📝 Step 3: Checking promotion codes...');
    const promotionCodes = await stripe.promotionCodes.list({ limit: 100 });
    
    const existingPromoCode = promotionCodes.data.find(promo => 
      promo.code === 'TEST1'
    );

    if (existingPromoCode) {
      console.log('✅ Promotion code already exists:', existingPromoCode.id);
      console.log('   Code:', existingPromoCode.code);
      console.log('   Active:', existingPromoCode.active);
    } else {
      console.log('📝 Step 4: Creating promotion code...');
      
      // Get the coupon ID (create if needed)
      let couponId;
      if (existingCoupon) {
        couponId = existingCoupon.id;
      } else {
        const coupon = await stripe.coupons.create({
          percent_off: 10,
          duration: 'once',
          metadata: {
            promo_code: 'TEST1',
            promo_code_id: 'test-id',
          },
        });
        couponId = coupon.id;
      }

      // Create the promotion code
      const promotionCode = await stripe.promotionCodes.create({
        coupon: couponId,
        code: 'TEST1',
        max_redemptions: 100,
        metadata: {
          promo_code_id: 'test-id',
          influencer_name: 'Test Influencer',
        },
      });

      console.log('✅ Promotion code created:', promotionCode.id);
      console.log('   Code:', promotionCode.code);
      console.log('   Active:', promotionCode.active);
    }

    console.log('\n🎉 Promo code TEST1 is now available in Stripe!');
    console.log('📝 You can now test it in the checkout page.');

  } catch (error) {
    console.error('❌ Error syncing to Stripe:', error.message);
    if (error.type) {
      console.error('   Type:', error.type);
    }
    if (error.code) {
      console.error('   Code:', error.code);
    }
  }
}

// Run the sync
syncPromoToStripe();
