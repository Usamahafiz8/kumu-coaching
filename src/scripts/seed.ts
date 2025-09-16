import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { runSeeds } from '../database/seeds';
import { User } from '../entities/user.entity';
import { PasswordReset } from '../entities/password-reset.entity';
import { PromoCode } from '../entities/promo-code.entity';
import { AppConfig } from '../entities/app-config.entity';
import { EmailTemplate } from '../entities/email-template.entity';

// Load environment variables
config();

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'kumu_coaching.db',
  entities: [User, PasswordReset, PromoCode, AppConfig, EmailTemplate],
  synchronize: true,
  logging: false,
});



async function main() {
  try {
    console.log('🔌 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    // Check for force flag in command line arguments
    const force = process.argv.includes('--force');
    if (force) {
      console.log('⚠️  Force flag detected. Existing subscription plans will be cleared.');
    }

    await runSeeds(AppDataSource, force);
  } catch (error) {
    console.log(process.env.DB_USERNAME, process.env.DB_PASSWORD, process.env.DB_NAME, process.env.DB_HOST, process.env.DB_PORT);
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

main();
