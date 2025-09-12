"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'cybillnerd',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'kumu_coaching',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectTimeoutMS: 30000,
    extra: {
        max: 20,
        min: 5,
        idle: 10000,
        acquire: 30000,
        evict: 1000,
        statement_timeout: 30000,
        query_timeout: 30000,
    },
}));
//# sourceMappingURL=database.config.js.map