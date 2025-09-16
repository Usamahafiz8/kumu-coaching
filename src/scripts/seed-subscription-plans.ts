import { DataSource } from 'typeorm';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';

export async function seedSubscriptionPlans(dataSource: DataSource) {
  const subscriptionPlanRepository = dataSource.getRepository(SubscriptionPlan);

  // Check if plans already exist
  const existingPlans = await subscriptionPlanRepository.count();
  if (existingPlans > 0) {
    console.log('Subscription plans already exist, skipping seed...');
    return;
  }

  const plans = [
    {
      name: 'Basic Plan',
      description: 'Perfect for getting started with our platform',
      price: 9.99,
      currency: 'USD',
      interval: 'monthly',
      features: [
        'Access to basic features',
        'Email support',
        '5GB storage',
        'Basic analytics',
      ],
      isActive: true,
      stripePriceId: 'price_basic_monthly', // You'll need to replace with actual Stripe price IDs
      stripeProductId: 'prod_basic',
    },
    {
      name: 'Pro Plan',
      description: 'Advanced features for growing businesses',
      price: 29.99,
      currency: 'USD',
      interval: 'monthly',
      features: [
        'All basic features',
        'Priority support',
        '50GB storage',
        'Advanced analytics',
        'API access',
        'Custom integrations',
      ],
      isActive: true,
      stripePriceId: 'price_pro_monthly', // You'll need to replace with actual Stripe price IDs
      stripeProductId: 'prod_pro',
    },
    {
      name: 'Enterprise Plan',
      description: 'Full-featured solution for large organizations',
      price: 99.99,
      currency: 'USD',
      interval: 'monthly',
      features: [
        'All pro features',
        '24/7 phone support',
        'Unlimited storage',
        'Custom analytics',
        'Full API access',
        'White-label solution',
        'Dedicated account manager',
      ],
      isActive: true,
      stripePriceId: 'price_enterprise_monthly', // You'll need to replace with actual Stripe price IDs
      stripeProductId: 'prod_enterprise',
    },
  ];

  for (const planData of plans) {
    const plan = subscriptionPlanRepository.create(planData);
    await subscriptionPlanRepository.save(plan);
    console.log(`Created subscription plan: ${plan.name}`);
  }

  console.log('Subscription plans seeded successfully!');
}
