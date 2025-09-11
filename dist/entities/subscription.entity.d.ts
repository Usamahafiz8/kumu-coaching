import { User } from './user.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
export declare enum SubscriptionStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    CANCELLED = "cancelled",
    PENDING = "pending",
    FAILED = "failed"
}
export declare class Subscription {
    id: string;
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    amount: number;
    startDate: Date;
    endDate: Date;
    cancelledAt: Date;
    cancellationReason: string | null;
    stripeSubscriptionId: string;
    stripePaymentIntentId: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    plan: SubscriptionPlan;
    get isActive(): boolean;
    get isExpired(): boolean;
}
