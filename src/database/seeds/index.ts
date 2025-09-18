import { DataSource } from 'typeorm';
import { seedAdminUser } from './admin-user.seed';
import { seedEmailTemplates } from './email-templates.seed';
import { seedSubscriptionPlans } from './subscription-plans.seed';

export async function runSeeds(dataSource: DataSource, force: boolean = false) {
  console.log('🌱 Starting database seeding...');
  
  try {
    await seedAdminUser(dataSource);
    await seedEmailTemplates(dataSource);
    await seedSubscriptionPlans(dataSource);
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}
