const { PrismaClient } = require('@prisma/client');

// This script helps you set up your Stripe product in the database
// Run with: node scripts/setup-stripe-product.js

const productData = {
  name: "Kumu Coaching Premium", // Update this
  description: "Premium coaching subscription", // Update this
  price: 20.99, // Update with your actual price
  currency: "USD",
  stripeProductId: "prod_T4wyxMacGpdDKB", // Your product ID
  stripePriceId: "price_1S8n4wFooGVEYWinxi5NxFSL", // You need to get this from Stripe Dashboard
  isActive: true,
  isSubscription: true, // Set to false for one-time payments
  billingInterval: "year", // or "year" for annual subscriptions
  trialPeriodDays: 7 // Optional trial period
};

console.log("Product Configuration:");
console.log(JSON.stringify(productData, null, 2));
console.log("\nTo complete setup:");
console.log("1. Get your Price ID from Stripe Dashboard");
console.log("2. Update the stripePriceId in this script");
console.log("3. Update the product details (name, description, price)");
console.log("4. Run: npm run start:dev");
console.log("5. Use the /products POST endpoint to create the product");
