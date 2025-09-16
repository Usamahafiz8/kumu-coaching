import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { runSeeds } from '../database/seeds';
import { User } from '../entities/user.entity';
import { PasswordReset } from '../entities/password-reset.entity';
import { PromoCode } from '../entities/promo-code.entity';
import { AppConfig } from '../entities/app-config.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import { Subscription } from '../entities/subscription.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { PurchaseRecord } from '../entities/purchase-record.entity';
import { VerificationCode } from '../entities/verification-code.entity';
import { Influencer } from '../entities/influencer.entity';
import { Commission } from '../entities/commission.entity';

// Load environment variables
config();

// Determine database configuration based on environment
const isProduction = process.env.NODE_ENV === 'production';
// For now, always use SQLite since the app is configured for SQLite
const usePostgreSQL = false;

const entities = [
  User, 
  PasswordReset, 
  PromoCode, 
  AppConfig, 
  EmailTemplate,
  Subscription,
  SubscriptionPlan,
  PurchaseRecord,
  VerificationCode,
  Influencer,
  Commission
];

const AppDataSource = new DataSource(
  usePostgreSQL 
    ? {
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities,
        synchronize: !isProduction,
        logging: !isProduction,
      } as DataSourceOptions
    : {
        type: 'sqlite',
        database: 'kumu_coaching.db',
        entities,
        synchronize: !isProduction,
        logging: !isProduction,
      } as DataSourceOptions
);



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
