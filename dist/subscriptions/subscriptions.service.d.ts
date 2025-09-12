import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { Subscription } from '../entities/subscription.entity';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { StripeService } from '../common/services/stripe.service';
import { EmailService } from '../common/services/email.service';
export declare class SubscriptionsService {
    private userRepository;
    private subscriptionPlanRepository;
    private subscriptionRepository;
    private stripeService;
    private emailService;
    constructor(userRepository: Repository<User>, subscriptionPlanRepository: Repository<SubscriptionPlan>, subscriptionRepository: Repository<Subscription>, stripeService: StripeService, emailService: EmailService);
    getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
    getSubscriptionPlanById(id: string): Promise<SubscriptionPlan>;
    purchaseSubscription(userId: string, purchaseDto: PurchaseSubscriptionDto): Promise<Subscription>;
    getSubscriptionStatus(userId: string): Promise<{
        hasActiveSubscription: boolean;
        currentSubscription?: Subscription;
        status: string;
    }>;
    getSubscriptionHistory(userId: string): Promise<Subscription[]>;
    cancelSubscription(userId: string, cancelDto: CancelSubscriptionDto): Promise<Subscription>;
    createPaymentIntent(userId: string, createPaymentIntentDto: CreatePaymentIntentDto): Promise<PaymentResponseDto>;
    confirmPayment(userId: string, confirmPaymentDto: ConfirmPaymentDto): Promise<Subscription>;
    handleStripeWebhook(event: any): Promise<void>;
    private handlePaymentSucceeded;
    private handlePaymentFailed;
    private getActiveSubscription;
}
