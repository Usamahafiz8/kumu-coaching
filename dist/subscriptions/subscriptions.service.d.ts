import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { Subscription } from '../entities/subscription.entity';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
export declare class SubscriptionsService {
    private userRepository;
    private subscriptionPlanRepository;
    private subscriptionRepository;
    constructor(userRepository: Repository<User>, subscriptionPlanRepository: Repository<SubscriptionPlan>, subscriptionRepository: Repository<Subscription>);
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
    private getActiveSubscription;
}
