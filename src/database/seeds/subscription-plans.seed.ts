import { DataSource } from 'typeorm';
import { SubscriptionPlan, PlanType } from '../../entities/subscription-plan.entity';

export async function seedSubscriptionPlans(dataSource: DataSource) {
  const subscriptionPlanRepository = dataSource.getRepository(SubscriptionPlan);

  const plans = [
    {
      name: 'Basic Plan',
      description: 'Perfect for beginners who want to start their coaching journey',
      price: 29.99,
      type: PlanType.MONTHLY,
      durationInMonths: 1,
      features: [
        'Access to basic coaching materials',
        'Monthly group sessions',
        'Email support',
        'Progress tracking',
      ],
    },
    {
      name: 'Premium Plan',
      description: 'For serious learners who want comprehensive coaching',
      price: 79.99,
      type: PlanType.MONTHLY,
      durationInMonths: 1,
      features: [
        'Everything in Basic Plan',
        'Weekly 1-on-1 sessions',
        'Priority support',
        'Advanced coaching materials',
        'Custom workout plans',
        'Nutrition guidance',
      ],
    },
    {
      name: 'Quarterly Premium',
      description: 'Save 15% with our quarterly premium plan',
      price: 203.97, // 15% discount on 3 months
      type: PlanType.QUARTERLY,
      durationInMonths: 3,
      features: [
        'Everything in Premium Plan',
        '15% savings',
        'Quarterly progress review',
        'Exclusive quarterly content',
      ],
    },
    {
      name: 'Annual Elite',
      description: 'Best value for committed individuals - save 25%',
      price: 719.88, // 25% discount on 12 months
      type: PlanType.YEARLY,
      durationInMonths: 12,
      features: [
        'Everything in Premium Plan',
        '25% savings',
        'Annual comprehensive assessment',
        'Exclusive annual content',
        'Priority booking for sessions',
        'Lifetime access to materials',
      ],
    },
  ];

  for (const planData of plans) {
    const existingPlan = await subscriptionPlanRepository.findOne({
      where: { name: planData.name },
    });

    if (!existingPlan) {
      const plan = subscriptionPlanRepository.create(planData);
      await subscriptionPlanRepository.save(plan);
      console.log(`✅ Created subscription plan: ${planData.name}`);
    } else {
      console.log(`⏭️  Subscription plan already exists: ${planData.name}`);
    }
  }
}
