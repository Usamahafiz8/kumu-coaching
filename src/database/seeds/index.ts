import { DataSource } from 'typeorm';
import { seedSubscriptionPlans } from './subscription-plans.seed';
import { seedAdminUser } from './admin-user.seed';

export async function runSeeds(dataSource: DataSource) {
  console.log('🌱 Starting database seeding...');
  
  try {
    await seedSubscriptionPlans(dataSource);
    await seedAdminUser(dataSource);
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}
