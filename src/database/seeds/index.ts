import { DataSource } from 'typeorm';
import { seedSubscriptionPlans } from './subscription-plans.seed';
import { seedAdminUser } from './admin-user.seed';

export async function runSeeds(dataSource: DataSource, force: boolean = false) {
  console.log('🌱 Starting database seeding...');
  
  try {
    await seedSubscriptionPlans(dataSource, force);
    await seedAdminUser(dataSource);
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}
