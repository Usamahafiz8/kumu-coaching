import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'database-3.chgki6kqcigb.eu-north-1.rds.amazonaws.com',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '90E9hC6LEWhVcivMerwh',
    database: process.env.DB_DATABASE || process.env.DB_NAME || 'postgres',
    entities: [__dirname + '/../*/.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    ssl: { rejectUnauthorized: false },
    // Connection timeout and pool configuration
    connectTimeoutMS: 30000, // 30 seconds connection timeout
    extra: {
      // Connection pool settings
      max: 20, // Maximum number of connections in the pool
      min: 5,  // Minimum number of connections in the pool
      idle: 10000, // Close connections after 10 seconds of inactivity
      acquire: 30000, // Maximum time to wait for a connection
      evict: 1000, // Check for idle connections every 1 second
      // PostgreSQL specific settings
      statement_timeout: 30000, // 30 seconds statement timeout
      query_timeout: 30000, // 30 seconds query timeout
    },
  }),
);