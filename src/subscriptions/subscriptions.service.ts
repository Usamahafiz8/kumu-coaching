import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../entities/subscription.entity';
import { User } from '../entities/user.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { PromoCode, PromoCodeStatus } from '../entities/promo-code.entity';
import { PromoCodesService } from '../promo-codes/promo-codes.service';
import { PurchaseRecord, PurchaseStatus } from '../entities/purchase-record.entity';
import { StripeService } from '../stripe/stripe.service';
import { EmailService } from '../email/email.service';
import { Influencer } from '../entities/influencer.entity';
import { Commission, CommissionStatus } from '../entities/commission.entity';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(PromoCode)
    private promoCodeRepository: Repository<PromoCode>,
    @InjectRepository(PurchaseRecord)
    private purchaseRecordRepository: Repository<PurchaseRecord>,
    @InjectRepository(Influencer)
    private influencerRepository: Repository<Influencer>,
    @InjectRepository(Commission)
    private commissionRepository: Repository<Commission>,
    private stripeService: StripeService,
    private emailService: EmailService,
    private promoCodesService: PromoCodesService,
  ) {}

  /**
   * Create a Stripe checkout session for subscription
   */
  async createCheckoutSession(
    userId: string, 
    planId: string, 
    promoCode?: string
  ) {
    // Check if user already has an active subscription
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (existingSubscription) {
      throw new ConflictException('User already has an active subscription');
    }

    // Get user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get subscription plan
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id: planId, isActive: true },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found or inactive');
    }

    // Validate promo code if provided
    let validatedPromoCode: PromoCode | null = null;
    if (promoCode) {
      const validationResult = await this.promoCodesService.validatePromoCode(promoCode, plan.price);
      if (!validationResult.valid) {
        throw new NotFoundException(validationResult.message || 'Invalid or expired promo code');
      }
      validatedPromoCode = validationResult.promoCode || null;
    }

    try {
      // Get success and cancel URLs from environment variables
      const successUrl = process.env.SUBSCRIPTION_SUCCESS_URL || 'http://localhost:3001/subscription/success';
      const cancelUrl = process.env.SUBSCRIPTION_CANCEL_URL || 'http://localhost:3001/subscription/cancel';

      // Check if Stripe is properly configured
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey || stripeSecretKey.includes('your_stripe_secret_key_here')) {
        throw new Error('Stripe is not properly configured. Please set up your Stripe API keys in the .env file.');
      }

      // Create or get Stripe customer
      let customerId: string;
      try {
        const customer = await this.stripeService.createCustomer(
          user.email, 
          `${user.firstName} ${user.lastName}`
        );
        customerId = customer.id;
      } catch (error) {
        this.logger.error('Failed to create Stripe customer:', error);
        throw new Error('Failed to create customer');
      }

      // Create Stripe product if not exists
      let productId = plan.stripeProductId;
      if (!productId) {
        const product = await this.stripeService.createProduct(
          plan.name, 
          plan.description
        );
        productId = product.id;
        
        // Update plan with product ID
        plan.stripeProductId = productId;
        await this.subscriptionPlanRepository.save(plan);
      }

      // Calculate final price (apply promo code discount if applicable)
      let finalPrice = plan.price;
      if (validatedPromoCode && validatedPromoCode.discountType === 'percentage') {
        finalPrice = plan.price * (1 - validatedPromoCode.discountValue / 100);
      } else if (validatedPromoCode && validatedPromoCode.discountType === 'fixed') {
        finalPrice = Math.max(0, plan.price - validatedPromoCode.discountValue);
      }

      // Create Stripe price
      const price = await this.stripeService.createPrice({
        productId,
        amount: finalPrice,
        currency: plan.currency,
        interval: plan.interval === 'annually' ? 'year' : 'month',
      });

      // Create checkout session
      const session = await this.stripeService.createCheckoutSession({
        customerId,
        priceId: price.id,
        successUrl,
        cancelUrl,
        discountCode: validatedPromoCode?.stripeCouponId, // Use Stripe coupon ID if available
      });

      // Create purchase record to track this transaction
      const purchaseRecord = this.purchaseRecordRepository.create({
        userId: user.id,
        planId: plan.id,
        promoCodeId: validatedPromoCode?.id,
        stripeSessionId: session.id,
        stripeCustomerId: customerId,
        stripePriceId: price.id,
        stripeProductId: productId,
        originalPrice: plan.price,
        finalPrice: finalPrice,
        discountAmount: plan.price - finalPrice,
        currency: plan.currency,
        status: PurchaseStatus.PENDING,
        notes: `Stripe checkout session created for ${plan.name}${validatedPromoCode ? ` with promo code ${validatedPromoCode.code}` : ''}`,
      });

      await this.purchaseRecordRepository.save(purchaseRecord);

      this.logger.log(`Stripe checkout session created for user ${user.email} with plan ${plan.name}. Purchase record ID: ${purchaseRecord.id}`);

      return {
        sessionId: session.id,
        url: session.url,
        purchaseRecordId: purchaseRecord.id,
        plan: {
          id: plan.id,
          name: plan.name,
          originalPrice: plan.price,
          finalPrice: finalPrice,
          currency: plan.currency,
          interval: plan.interval,
          discount: validatedPromoCode ? {
            code: validatedPromoCode.code,
            type: validatedPromoCode.discountType,
            value: validatedPromoCode.discountValue,
          } : null,
        },
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };

    } catch (error) {
      this.logger.error('Failed to create checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Handle successful subscription creation from Stripe webhook
   */
  async handleSubscriptionCreated(subscriptionData: any) {
    const { id: stripeSubscriptionId, customer: stripeCustomerId, items, status, current_period_start, current_period_end } = subscriptionData;

    // Find user by Stripe customer ID
    const user = await this.userRepository.findOne({
      where: { email: subscriptionData.customer_email },
    });

    if (!user) {
      this.logger.error(`User not found for customer ${stripeCustomerId}`);
      return;
    }

    // Check if subscription already exists
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId },
    });

    if (existingSubscription) {
      this.logger.log(`Subscription ${stripeSubscriptionId} already exists`);
      return;
    }

    // Create subscription record
    const subscription = this.subscriptionRepository.create({
      userId: user.id,
      stripeSubscriptionId,
      stripeCustomerId,
      stripePriceId: items.data[0].price.id,
      stripeProductId: items.data[0].price.product,
      amount: items.data[0].price.unit_amount / 100, // Convert from cents
      currency: items.data[0].price.currency,
      status: status === 'active' ? SubscriptionStatus.ACTIVE : SubscriptionStatus.PENDING,
      currentPeriodStart: new Date(current_period_start * 1000),
      currentPeriodEnd: new Date(current_period_end * 1000),
    });

    await this.subscriptionRepository.save(subscription);
    this.logger.log(`Subscription created for user ${user.email}`);
  }

  /**
   * Handle subscription updates from Stripe webhook
   */
  async handleSubscriptionUpdated(subscriptionData: any) {
    const { id: stripeSubscriptionId, status, current_period_start, current_period_end, ended_at, canceled_at } = subscriptionData;

    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId },
    });

    if (!subscription) {
      this.logger.error(`Subscription ${stripeSubscriptionId} not found`);
      return;
    }

    // Update subscription status
    let newStatus: SubscriptionStatus;
    switch (status) {
      case 'active':
        newStatus = SubscriptionStatus.ACTIVE;
        break;
      case 'canceled':
        newStatus = SubscriptionStatus.CANCELLED;
        break;
      case 'incomplete_expired':
      case 'unpaid':
        newStatus = SubscriptionStatus.EXPIRED;
        break;
      default:
        newStatus = SubscriptionStatus.PENDING;
    }

    subscription.status = newStatus;
    subscription.currentPeriodStart = new Date(current_period_start * 1000);
    subscription.currentPeriodEnd = new Date(current_period_end * 1000);

    if (ended_at) {
      subscription.endedAt = new Date(ended_at * 1000);
    }

    if (canceled_at) {
      subscription.cancelledAt = new Date(canceled_at * 1000);
    }

    await this.subscriptionRepository.save(subscription);
    this.logger.log(`Subscription ${stripeSubscriptionId} updated to status ${newStatus}`);
  }

  /**
   * Get user's subscription
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });
  }

  /**
   * Cancel user's subscription
   */
  async cancelSubscription(userId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    // Cancel in Stripe
    await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId);

    // Update local record
    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    await this.subscriptionRepository.save(subscription);

    this.logger.log(`Subscription cancelled for user ${userId}`);
  }

  /**
   * Get subscription by Stripe ID
   */
  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId },
    });
  }

  /**
   * Handle successful payment completion
   */
  async handlePaymentSuccess(stripeSessionId: string, stripeSubscriptionId?: string, stripePaymentIntentId?: string) {
    // Find the purchase record
    const purchaseRecord = await this.purchaseRecordRepository.findOne({
      where: { stripeSessionId },
      relations: ['user', 'plan', 'promoCode'],
    });

    if (!purchaseRecord) {
      this.logger.error(`Purchase record not found for session ${stripeSessionId}`);
      return;
    }

    // Update purchase record status
    purchaseRecord.status = PurchaseStatus.COMPLETED;
    if (stripeSubscriptionId) {
      purchaseRecord.stripeSubscriptionId = stripeSubscriptionId;
    }
    if (stripePaymentIntentId) {
      purchaseRecord.stripePaymentIntentId = stripePaymentIntentId;
    }
    purchaseRecord.notes = `Payment completed successfully. Subscription ID: ${stripeSubscriptionId || 'N/A'}`;

    await this.purchaseRecordRepository.save(purchaseRecord);

    this.logger.log(`Payment completed for user ${purchaseRecord.user.email}. Purchase record ID: ${purchaseRecord.id}`);

    return purchaseRecord;
  }

  /**
   * Handle payment failure
   */
  async handlePaymentFailure(stripeSessionId: string, reason: string) {
    const purchaseRecord = await this.purchaseRecordRepository.findOne({
      where: { stripeSessionId },
      relations: ['user'],
    });

    if (!purchaseRecord) {
      this.logger.error(`Purchase record not found for session ${stripeSessionId}`);
      return;
    }

    purchaseRecord.status = PurchaseStatus.FAILED;
    purchaseRecord.notes = `Payment failed: ${reason}`;

    await this.purchaseRecordRepository.save(purchaseRecord);

    this.logger.log(`Payment failed for user ${purchaseRecord.user.email}. Reason: ${reason}`);
  }

  /**
   * Get user's purchase history
   */
  async getUserPurchaseHistory(userId: string): Promise<PurchaseRecord[]> {
    return this.purchaseRecordRepository.find({
      where: { userId },
      relations: ['plan', 'promoCode'],
      order: { createdAt: 'DESC' },
    });
  }


  /**
   * Verify payment with Stripe and complete the subscription
   */
  async verifyAndCompletePayment(sessionId: string) {
    try {
      // Retrieve the checkout session from Stripe
      const session = await this.stripeService.getCheckoutSession(sessionId);
      
      if (!session) {
        return { success: false, message: 'Invalid session ID' };
      }

      if (session.payment_status !== 'paid') {
        return { success: false, message: 'Payment not completed' };
      }

      // Find the purchase record
      const purchaseRecord = await this.purchaseRecordRepository.findOne({
        where: { stripeSessionId: sessionId },
        relations: ['user', 'plan', 'promoCode'],
      });

      if (!purchaseRecord) {
        return { success: false, message: 'Purchase record not found' };
      }

      if (purchaseRecord.status === PurchaseStatus.COMPLETED) {
        return { success: true, message: 'Payment already verified', subscriptionId: purchaseRecord.stripeSubscriptionId, purchaseRecordId: purchaseRecord.id };
      }

      // Get subscription details from Stripe
      const subscriptionId = session.subscription as string;
      const subscription = await this.stripeService.getSubscription(subscriptionId);

      // Update purchase record
      purchaseRecord.status = PurchaseStatus.COMPLETED;
      purchaseRecord.stripeSubscriptionId = subscriptionId;
      purchaseRecord.stripePaymentIntentId = session.payment_intent as string;
      purchaseRecord.notes = `Payment verified and subscription activated. Stripe subscription: ${subscriptionId}`;

      await this.purchaseRecordRepository.save(purchaseRecord);

      // Create or update subscription record
      let subscriptionRecord = await this.subscriptionRepository.findOne({
        where: { stripeSubscriptionId: subscriptionId },
      });

      if (!subscriptionRecord) {
        subscriptionRecord = this.subscriptionRepository.create({
          userId: purchaseRecord.userId,
          planId: purchaseRecord.planId,
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: purchaseRecord.stripeCustomerId,
          stripePriceId: purchaseRecord.stripePriceId,
          stripeProductId: purchaseRecord.stripeProductId,
          amount: purchaseRecord.finalPrice,
          currency: purchaseRecord.currency,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        });

        await this.subscriptionRepository.save(subscriptionRecord);
      }

      // Increment promo code usage if applicable
      if (purchaseRecord.promoCodeId) {
        await this.promoCodesService.incrementUsage(purchaseRecord.promoCodeId);
        this.logger.log(`Incremented usage for promo code: ${purchaseRecord.promoCodeId}`);
      }

      // Send confirmation email
      try {
        await this.emailService.sendSubscriptionConfirmation({
          to: purchaseRecord.user.email,
          firstName: purchaseRecord.user.firstName,
          lastName: purchaseRecord.user.lastName,
          planName: purchaseRecord.plan.name,
          amount: purchaseRecord.finalPrice,
          currency: purchaseRecord.currency,
          subscriptionId: subscriptionId,
          currentPeriodEnd: subscriptionRecord.currentPeriodEnd,
        });

        this.logger.log(`Confirmation email sent to ${purchaseRecord.user.email}`);
      } catch (emailError) {
        this.logger.error('Failed to send confirmation email:', emailError);
        // Don't fail the whole process if email fails
      }

      this.logger.log(`Payment verified and subscription activated for user ${purchaseRecord.user.email}`);

      return {
        success: true,
        message: 'Payment verified and subscription activated',
        subscriptionId: subscriptionId,
        purchaseRecordId: purchaseRecord.id,
      };

    } catch (error) {
      this.logger.error('Error verifying payment:', error);
      return { success: false, message: 'Failed to verify payment' };
    }
  }

  /**
   * Handle checkout session completed webhook
   */
  async handleCheckoutSessionCompleted(session: any) {
    try {
      this.logger.log(`Processing checkout session completed: ${session.id}`);

      // Find the purchase record by session ID
      const purchaseRecord = await this.purchaseRecordRepository.findOne({
        where: { stripeSessionId: session.id },
        relations: ['user', 'plan', 'promoCode'],
      });

      if (!purchaseRecord) {
        this.logger.error(`Purchase record not found for session: ${session.id}`);
        return;
      }

      // Update purchase record status to completed
      purchaseRecord.status = PurchaseStatus.COMPLETED;
      purchaseRecord.stripePaymentIntentId = session.payment_intent;
      purchaseRecord.updatedAt = new Date();
      
      await this.purchaseRecordRepository.save(purchaseRecord);

      // Increment promo code usage if applicable
      if (purchaseRecord.promoCodeId) {
        await this.promoCodesService.incrementUsage(purchaseRecord.promoCodeId);
        this.logger.log(`Incremented usage for promo code: ${purchaseRecord.promoCodeId}`);
      }

      // Create commission for influencer if promo code is associated with one
      if (purchaseRecord.promoCode?.influencer) {
        await this.createCommissionForInfluencer(purchaseRecord);
        this.logger.log(`Created commission for influencer: ${purchaseRecord.promoCode.influencer.id}`);
      }

      this.logger.log(`Successfully processed checkout session completion for user ${purchaseRecord.user.email}`);
    } catch (error) {
      this.logger.error('Error handling checkout session completed:', error);
      throw error;
    }
  }

  /**
   * Create commission for influencer when purchase is completed
   */
  private async createCommissionForInfluencer(purchaseRecord: PurchaseRecord): Promise<void> {
    try {
      const influencer = purchaseRecord.promoCode.influencer;
      const commissionAmount = (purchaseRecord.finalPrice * influencer.commissionRate) / 100;

      // Create commission record
      const commission = this.commissionRepository.create({
        influencerId: influencer.id,
        purchaseRecordId: purchaseRecord.id,
        amount: commissionAmount,
        rate: influencer.commissionRate,
        originalAmount: purchaseRecord.finalPrice,
        currency: purchaseRecord.currency,
        status: CommissionStatus.PENDING,
      });

      await this.commissionRepository.save(commission);

      // Update influencer earnings
      influencer.totalEarnings += commissionAmount;
      influencer.pendingEarnings += commissionAmount;
      await this.influencerRepository.save(influencer);

      // Update purchase record with commission info
      purchaseRecord.commissionAmount = commissionAmount;
      purchaseRecord.commissionRate = influencer.commissionRate;
      purchaseRecord.influencerId = influencer.id;
      await this.purchaseRecordRepository.save(purchaseRecord);

      this.logger.log(`Created commission of ${commissionAmount} ${purchaseRecord.currency} for influencer ${influencer.id}`);
    } catch (error) {
      this.logger.error('Error creating commission for influencer:', error);
      // Don't throw error to avoid breaking the purchase flow
    }
  }
}