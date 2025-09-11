import { Subscription } from './subscription.entity';
export declare enum PlanType {
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    YEARLY = "yearly",
    LIFETIME = "lifetime"
}
export declare enum PlanStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    ARCHIVED = "archived"
}
export declare class SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    type: PlanType;
    durationInMonths: number;
    features: string[];
    status: PlanStatus;
    isActive: boolean;
    stripePriceId: string;
    stripeProductId: string;
    createdAt: Date;
    updatedAt: Date;
    subscriptions: Subscription[];
}
