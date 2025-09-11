"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const seeds_1 = require("../database/seeds");
const user_entity_1 = require("../entities/user.entity");
const subscription_plan_entity_1 = require("../entities/subscription-plan.entity");
const subscription_entity_1 = require("../entities/subscription.entity");
const password_reset_entity_1 = require("../entities/password-reset.entity");
(0, dotenv_1.config)();
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'kumu_coaching',
    entities: [user_entity_1.User, subscription_plan_entity_1.SubscriptionPlan, subscription_entity_1.Subscription, password_reset_entity_1.PasswordReset],
    synchronize: true,
    logging: false,
});
async function main() {
    try {
        console.log('🔌 Connecting to database...');
        await AppDataSource.initialize();
        console.log('✅ Database connection established');
        await (0, seeds_1.runSeeds)(AppDataSource);
    }
    catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
    finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('🔌 Database connection closed');
        }
    }
}
main();
//# sourceMappingURL=seed.js.map