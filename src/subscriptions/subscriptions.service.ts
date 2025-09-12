import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { SubscriptionPlan, PlanStatus } from '../entities/subscription-plan.entity';
import { Subscription, SubscriptionStatus } from '../entities/subscription.entity';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { StripeService } from '../common/services/stripe.service';
import { EmailService } from '../common/services/email.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private stripeService: StripeService,
    private emailService: EmailService,
  ) {}

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return this.subscriptionPlanRepository.find({
      where: { status: PlanStatus.ACTIVE, isActive: true },
      order: { price: 'ASC' },
    });
  }

  async getSubscriptionPlanById(id: string): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id, status: PlanStatus.ACTIVE, isActive: true },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return plan;
  }

  async purchaseSubscription(
    userId: string,
    purchaseDto: PurchaseSubscriptionDto,
  ): Promise<Subscription> {
    const { planId, metadata } = purchaseDto;

    // Check if plan exists
    const plan = await this.getSubscriptionPlanById(planId);

    // Check if user has an active subscription
    const activeSubscription = await this.getActiveSubscription(userId);
    if (activeSubscription) {
      throw new ConflictException('User already has an active subscription');
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationInMonths);

    // Create subscription
    const subscription = this.subscriptionRepository.create({
      userId,
      planId,
      amount: plan.price,
      startDate,
      endDate,
      status: SubscriptionStatus.ACTIVE,
      metadata,
    });

    return this.subscriptionRepository.save(subscription);
  }

  async getSubscriptionStatus(userId: string): Promise<{
    hasActiveSubscription: boolean;
    currentSubscription?: Subscription;
    status: string;
  }> {
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

  async getSubscriptionHistory(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { userId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async cancelSubscription(
    userId: string,
    cancelDto: CancelSubscriptionDto,
  ): Promise<Subscription> {
    const activeSubscription = await this.getActiveSubscription(userId);

    if (!activeSubscription) {
      throw new NotFoundException('No active subscription found');
    }

    // Update subscription
    activeSubscription.status = SubscriptionStatus.CANCELLED;
    activeSubscription.cancelledAt = new Date();
    activeSubscription.cancellationReason = cancelDto.reason || null;

    return this.subscriptionRepository.save(activeSubscription);
  }

  async createPaymentIntent(
    userId: string,
    createPaymentIntentDto: CreatePaymentIntentDto,
  ): Promise<PaymentResponseDto> {
    const { planId, paymentMethodId, metadata } = createPaymentIntentDto;

    // Get user and plan
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plan = await this.getSubscriptionPlanById(planId);

    // Check if user has an active subscription
    const activeSubscription = await this.getActiveSubscription(userId);
    if (activeSubscription) {
      throw new ConflictException('User already has an active subscription');
    }

    // Create payment intent metadata
    const paymentMetadata = {
      userId,
      planId,
      planName: plan.name,
      ...metadata,
    };

    // Create payment intent
    const paymentIntent = await this.stripeService.createPaymentIntent(
      plan.price,
      'usd',
      paymentMetadata,
    );

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || '',
      publishableKey: this.stripeService.getPublishableKey(),
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    };
  }

  async confirmPayment(
    userId: string,
    confirmPaymentDto: ConfirmPaymentDto,
  ): Promise<Subscription> {
    const { paymentIntentId } = confirmPaymentDto;

    // Confirm payment with Stripe
    const paymentIntent = await this.stripeService.confirmPaymentIntent(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not completed');
    }

    // Get payment metadata
    const { userId: paymentUserId, planId, planName } = paymentIntent.metadata;

    // Verify user matches
    if (paymentUserId !== userId) {
      throw new BadRequestException('Payment user mismatch');
    }

    // Get plan and user
    const plan = await this.getSubscriptionPlanById(planId);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    // Check if subscription already exists for this payment
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (existingSubscription) {
      return existingSubscription;
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationInMonths);

    // Create subscription
    const subscription = this.subscriptionRepository.create({
      userId,
      planId,
      amount: plan.price,
      startDate,
      endDate,
      status: SubscriptionStatus.ACTIVE,
      stripePaymentIntentId: paymentIntentId,
      metadata: paymentIntent.metadata,
    });

    const savedSubscription = await this.subscriptionRepository.save(subscription);

    // Send confirmation email
    try {
      if (user) {
        await this.emailService.sendSubscriptionPurchaseEmail(
          user.email,
          user.firstName,
          planName,
          plan.price,
          'usd',
          startDate,
          endDate,
        );
      }
    } catch (error) {
      // Log error but don't fail the subscription creation
      console.error('Failed to send subscription email:', error);
    }

    return savedSubscription;
  }

  async handleStripeWebhook(event: any): Promise<void> {
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

  private async handlePaymentSucceeded(paymentIntent: any): Promise<void> {
    const { userId, planId } = paymentIntent.metadata;

    if (!userId || !planId) {
      console.error('Missing metadata in payment intent:', paymentIntent.id);
      return;
    }

    // Check if subscription already exists
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (existingSubscription) {
      return; // Already processed
    }

    // Get plan and user
    const plan = await this.getSubscriptionPlanById(planId);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      console.error('User not found for payment intent:', paymentIntent.id);
      return;
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationInMonths);

    // Create subscription
    const subscription = this.subscriptionRepository.create({
      userId,
      planId,
      amount: plan.price,
      startDate,
      endDate,
      status: SubscriptionStatus.ACTIVE,
      stripePaymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata,
    });

    await this.subscriptionRepository.save(subscription);

    // Send confirmation email
    try {
      await this.emailService.sendSubscriptionPurchaseEmail(
        user.email,
        user.firstName,
        plan.name,
        plan.price,
        'usd',
        startDate,
        endDate,
      );
    } catch (error) {
      console.error('Failed to send subscription email:', error);
    }
  }

  private async handlePaymentFailed(paymentIntent: any): Promise<void> {
    const { userId, planId } = paymentIntent.metadata;

    if (!userId || !planId) {
      console.error('Missing metadata in failed payment intent:', paymentIntent.id);
      return;
    }

    // Create failed subscription record
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
      status: SubscriptionStatus.FAILED,
      stripePaymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata,
    });

    await this.subscriptionRepository.save(subscription);
  }

  private async getActiveSubscription(userId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['plan'],
    });
  }
}
