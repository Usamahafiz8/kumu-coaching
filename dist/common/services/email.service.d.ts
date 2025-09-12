import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;
    sendWelcomeEmail(email: string, firstName: string): Promise<void>;
    sendSubscriptionPurchaseEmail(email: string, firstName: string, planName: string, amount: number, currency: string, startDate: Date, endDate: Date): Promise<void>;
}
