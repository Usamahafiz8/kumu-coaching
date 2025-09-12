import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { runSeeds } from '../database/seeds';
import { User } from '../entities/user.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { Subscription } from '../entities/subscription.entity';
import { PasswordReset } from '../entities/password-reset.entity';

// Load environment variables
config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'kumu_coaching',
  entities: [User, SubscriptionPlan, Subscription, PasswordReset],
  synchronize: true,
  logging: false,
  // Connection timeout and pool configuration
  connectTimeoutMS: 30000, // 30 seconds connection timeout
  extra: {
    // Connection pool settings
    max: 10, // Maximum number of connections in the pool
    min: 2,  // Minimum number of connections in the pool
    idle: 10000, // Close connections after 10 seconds of inactivity
    acquire: 30000, // Maximum time to wait for a connection
    evict: 1000, // Check for idle connections every 1 second
    // PostgreSQL specific settings
    statement_timeout: 30000, // 30 seconds statement timeout
    query_timeout: 30000, // 30 seconds query timeout
  },
});



async function main() {
  try {
    console.log('🔌 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    await runSeeds(AppDataSource);
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
