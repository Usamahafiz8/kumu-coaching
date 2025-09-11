"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const subscription_plan_entity_1 = require("../entities/subscription-plan.entity");
const subscription_entity_1 = require("../entities/subscription.entity");
let SubscriptionsService = class SubscriptionsService {
    userRepository;
    subscriptionPlanRepository;
    subscriptionRepository;
    constructor(userRepository, subscriptionPlanRepository, subscriptionRepository) {
        this.userRepository = userRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.subscriptionRepository = subscriptionRepository;
    }
    async getSubscriptionPlans() {
        return this.subscriptionPlanRepository.find({
            where: { status: subscription_plan_entity_1.PlanStatus.ACTIVE, isActive: true },
            order: { price: 'ASC' },
        });
    }
    async getSubscriptionPlanById(id) {
        const plan = await this.subscriptionPlanRepository.findOne({
            where: { id, status: subscription_plan_entity_1.PlanStatus.ACTIVE, isActive: true },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Subscription plan not found');
        }
        return plan;
    }
    async purchaseSubscription(userId, purchaseDto) {
        const { planId, metadata } = purchaseDto;
        const plan = await this.getSubscriptionPlanById(planId);
        const activeSubscription = await this.getActiveSubscription(userId);
        if (activeSubscription) {
            throw new common_1.ConflictException('User already has an active subscription');
        }
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + plan.durationInMonths);
        const subscription = this.subscriptionRepository.create({
            userId,
            planId,
            amount: plan.price,
            startDate,
            endDate,
            status: subscription_entity_1.SubscriptionStatus.ACTIVE,
            metadata,
        });
        return this.subscriptionRepository.save(subscription);
    }
    async getSubscriptionStatus(userId) {
        const activeSubscription = await this.getActiveSubscription(userId);
        if (!activeSubscription) {
            return {
                hasActiveSubscription: false,
                status: 'none',
            };
        }
        return {
            hasActiveSubscription: true,
            currentSubscription: activeSubscription,
            status: activeSubscription.isExpired ? 'expired' : 'active',
        };
    }
    async getSubscriptionHistory(userId) {
        return this.subscriptionRepository.find({
            where: { userId },
            relations: ['plan'],
            order: { createdAt: 'DESC' },
        });
    }
    async cancelSubscription(userId, cancelDto) {
        const activeSubscription = await this.getActiveSubscription(userId);
        if (!activeSubscription) {
            throw new common_1.NotFoundException('No active subscription found');
        }
        activeSubscription.status = subscription_entity_1.SubscriptionStatus.CANCELLED;
        activeSubscription.cancelledAt = new Date();
        activeSubscription.cancellationReason = cancelDto.reason || null;
        return this.subscriptionRepository.save(activeSubscription);
    }
    async getActiveSubscription(userId) {
        return this.subscriptionRepository.findOne({
            where: {
                userId,
                status: subscription_entity_1.SubscriptionStatus.ACTIVE,
            },
            relations: ['plan'],
        });
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(subscription_plan_entity_1.SubscriptionPlan)),
    __param(2, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map