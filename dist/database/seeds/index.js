"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeeds = runSeeds;
const subscription_plans_seed_1 = require("./subscription-plans.seed");
async function runSeeds(dataSource) {
    console.log('🌱 Starting database seeding...');
    try {
        await (0, subscription_plans_seed_1.seedSubscriptionPlans)(dataSource);
        console.log('✅ Database seeding completed successfully!');
    }
    catch (error) {
        console.error('❌ Database seeding failed:', error);
        throw error;
    }
}
//# sourceMappingURL=index.js.map