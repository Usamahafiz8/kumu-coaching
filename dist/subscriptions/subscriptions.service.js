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
const stripe_service_1 = require("../common/services/stripe.service");
const email_service_1 = require("../common/services/email.service");
let SubscriptionsService = class SubscriptionsService {
    userRepository;
    subscriptionPlanRepository;
    subscriptionRepository;
    stripeService;
    emailService;
    constructor(userRepository, subscriptionPlanRepository, subscriptionRepository, stripeService, emailService) {
        this.userRepository = userRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.stripeService = stripeService;
        this.emailService = emailService;
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
    async createPaymentIntent(userId, createPaymentIntentDto) {
        const { planId, paymentMethodId, metadata } = createPaymentIntentDto;
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const plan = await this.getSubscriptionPlanById(planId);
        const activeSubscription = await this.getActiveSubscription(userId);
        if (activeSubscription) {
            throw new common_1.ConflictException('User already has an active subscription');
        }
        const paymentMetadata = {
            userId,
            planId,
            planName: plan.name,
            ...metadata,
        };
        const paymentIntent = await this.stripeService.createPaymentIntent(plan.price, 'usd', paymentMetadata);
        return {
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret || '',
            publishableKey: this.stripeService.getPublishableKey(),
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
        };
    }
    async confirmPayment(userId, confirmPaymentDto) {
        const { paymentIntentId } = confirmPaymentDto;
        const paymentIntent = await this.stripeService.confirmPaymentIntent(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            throw new common_1.BadRequestException('Payment not completed');
        }
        const { userId: paymentUserId, planId, planName } = paymentIntent.metadata;
        if (paymentUserId !== userId) {
            throw new common_1.BadRequestException('Payment user mismatch');
        }
        const plan = await this.getSubscriptionPlanById(planId);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const existingSubscription = await this.subscriptionRepository.findOne({
            where: { stripePaymentIntentId: paymentIntentId },
        });
        if (existingSubscription) {
            return existingSubscription;
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
            stripePaymentIntentId: paymentIntentId,
            metadata: paymentIntent.metadata,
        });
        const savedSubscription = await this.subscriptionRepository.save(subscription);
        try {
            if (user) {
                await this.emailService.sendSubscriptionPurchaseEmail(user.email, user.firstName, planName, plan.price, 'usd', startDate, endDate);
            }
        }
        catch (error) {
            console.error('Failed to send subscription email:', error);
        }
        return savedSubscription;
    }
    async handleStripeWebhook(event) {
        switch (event.type) {
            case 'payment_intent.succeeded':
                await this.handlePaymentSucceeded(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await this.handlePaymentFailed(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    }
    async handlePaymentSucceeded(paymentIntent) {
        const { userId, planId } = paymentIntent.metadata;
        if (!userId || !planId) {
            console.error('Missing metadata in payment intent:', paymentIntent.id);
            return;
        }
        const existingSubscription = await this.subscriptionRepository.findOne({
            where: { stripePaymentIntentId: paymentIntent.id },
        });
        if (existingSubscription) {
            return;
        }
        const plan = await this.getSubscriptionPlanById(planId);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            console.error('User not found for payment intent:', paymentIntent.id);
            return;
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
            stripePaymentIntentId: paymentIntent.id,
            metadata: paymentIntent.metadata,
        });
        await this.subscriptionRepository.save(subscription);
        try {
            await this.emailService.sendSubscriptionPurchaseEmail(user.email, user.firstName, plan.name, plan.price, 'usd', startDate, endDate);
        }
        catch (error) {
            console.error('Failed to send subscription email:', error);
        }
    }
    async handlePaymentFailed(paymentIntent) {
        const { userId, planId } = paymentIntent.metadata;
        if (!userId || !planId) {
            console.error('Missing metadata in failed payment intent:', paymentIntent.id);
            return;
        }
        const plan = await this.getSubscriptionPlanById(planId);
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + plan.durationInMonths);
        const subscription = this.subscriptionRepository.create({
            userId,
            planId,
            amount: plan.price,
            startDate,
            endDate,
            status: subscription_entity_1.SubscriptionStatus.FAILED,
            stripePaymentIntentId: paymentIntent.id,
            metadata: paymentIntent.metadata,
        });
        await this.subscriptionRepository.save(subscription);
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
        typeorm_2.Repository,
        stripe_service_1.StripeService,
        email_service_1.EmailService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map