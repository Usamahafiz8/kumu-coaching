import { DataSource } from 'typeorm';
import { seedVerificationCodeTemplates } from '../database/seeds/verification-code-templates.seed';

async function runSeed() {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: 'kumu_coaching.db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: true,
  });
  
  try {
    await dataSource.initialize();
    console.log('Database connection established');
    
    await seedVerificationCodeTemplates(dataSource);
    console.log('Verification code templates seeded successfully');
    
  } catch (error) {
    console.error('Error seeding verification code templates:', error);
  } finally {
    await dataSource.destroy();
    console.log('Database connection closed');
  }
}

runSeed();
