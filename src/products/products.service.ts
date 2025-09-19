import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  // Hardcoded subscription product
  getSubscriptionProduct() {
    return {
      id: 'kumu-coaching-subscription',
      name: 'Kumu Coaching Premium',
      description: 'Premium coaching subscription with personalized sessions',
      price: 20.99,
      currency: 'USD',
      stripeProductId: 'prod_T4wyxMacGpdDKB',
      stripePriceId: 'price_1S8n4wFooGVEYWinxi5NxFSL',
      isActive: true,
      isSubscription: true,
      billingInterval: 'year',
      trialPeriodDays: 7,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
