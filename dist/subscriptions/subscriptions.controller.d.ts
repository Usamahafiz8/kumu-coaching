import { SubscriptionsService } from './subscriptions.service';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { User } from '../entities/user.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { Subscription } from '../entities/subscription.entity';
import { ApiResponseDto } from '../common/dto/api-response.dto';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    getSubscriptionPlans(): Promise<ApiResponseDto<SubscriptionPlan[]>>;
    getSubscriptionPlanById(id: string): Promise<ApiResponseDto<SubscriptionPlan>>;
    purchaseSubscription(user: User, purchaseDto: PurchaseSubscriptionDto): Promise<ApiResponseDto<Subscription>>;
    getSubscriptionStatus(user: User): Promise<ApiResponseDto>;
    getSubscriptionHistory(user: User): Promise<ApiResponseDto<Subscription[]>>;
    cancelSubscription(user: User, cancelDto: CancelSubscriptionDto): Promise<ApiResponseDto<Subscription>>;
}
