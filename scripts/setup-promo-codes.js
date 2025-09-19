const Stripe = require('stripe');

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

async function createPromoCodes() {
  try {
    console.log('Creating promotional codes...');

    // Create a 20% off coupon
    const coupon20 = await stripe.coupons.create({
      percent_off: 20,
      duration: 'once',
      name: '20% Off First Purchase',
    });

    // Create a $5 off coupon
    const coupon5 = await stripe.coupons.create({
      amount_off: 500, // $5.00 in cents
      currency: 'usd',
      duration: 'once',
      name: '$5 Off First Purchase',
    });

    // Create promotional codes
    const promoCode20 = await stripe.promotionCodes.create({
      coupon: coupon20.id,
      code: 'WELCOME20',
      active: true,
      max_redemptions: 100,
    });

    const promoCode5 = await stripe.promotionCodes.create({
      coupon: coupon5.id,
      code: 'SAVE5',
      active: true,
      max_redemptions: 50,
    });

    console.log('✅ Promotional codes created successfully!');
    console.log('🎟️  WELCOME20 - 20% off (max 100 uses)');
    console.log('🎟️  SAVE5 - $5 off (max 50 uses)');
    console.log('\nYou can now use these codes in the Stripe checkout!');

  } catch (error) {
    console.error('❌ Error creating promotional codes:', error.message);
  }
}

createPromoCodes();
