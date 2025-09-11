import { DataSource } from 'typeorm';
import { seedSubscriptionPlans } from './subscription-plans.seed';

export async function runSeeds(dataSource: DataSource) {
  console.log('🌱 Starting database seeding...');
  
  try {
    await seedSubscriptionPlans(dataSource);
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}
