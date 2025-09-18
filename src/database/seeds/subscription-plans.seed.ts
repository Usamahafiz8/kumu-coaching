import { DataSource } from 'typeorm';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';

export async function seedSubscriptionPlans(dataSource: DataSource) {
  const subscriptionPlanRepository = dataSource.getRepository(SubscriptionPlan);

  const plans = [
    {
      name: 'Annual Coaching Plan',
      description: 'Complete coaching program with full access to all features',
      price: 20.00,
      currency: 'GBP',
      interval: 'yearly',
      features: [
        'Full access to coaching content',
        'Community forum access',
        'Email support',
        'Monthly group sessions',
        'Progress tracking',
        'Annual subscription'
      ],
      stripePriceId: 'price_annual_coaching',
      stripeProductId: 'prod_coaching',
      isActive: true,
      sortOrder: 1
    }
  ];

  for (const planData of plans) {
    const existingPlan = await subscriptionPlanRepository.findOne({
      where: { name: planData.name },
    });

    if (!existingPlan) {
      const newPlan = subscriptionPlanRepository.create(planData);
      await subscriptionPlanRepository.save(newPlan);
      console.log(`✅ Created subscription plan: ${planData.name} - $${planData.price}/${planData.interval}`);
    } else {
      console.log(`⏭️  Subscription plan already exists: ${planData.name}`);
    }
  }
}
