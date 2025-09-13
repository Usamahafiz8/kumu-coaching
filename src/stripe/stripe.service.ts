import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SubscriptionPlan, PlanType } from '../entities/subscription-plan.entity';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    // Initialize Stripe only when needed
    this.initializeStripe();
  }

  private initializeStripe(): void {
    const secretKey = this.configService.get<string>('stripe.secretKey');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2025-08-27.basil',
      });
    }
  }

  private ensureStripeInitialized(): void {
    if (!this.stripe) {
      const secretKey = this.configService.get<string>('stripe.secretKey');
      if (!secretKey) {
        throw new Error('Stripe secret key is not configured');
      }
      this.initializeStripe();
    }
  }

  async createProduct(plan: SubscriptionPlan): Promise<{ productId: string; priceId: string }> {
    this.ensureStripeInitialized();
    try {
      // Create Stripe product
      const product = await this.stripe.products.create({
        name: plan.name,
        description: plan.description || undefined,
        metadata: {
          planId: plan.id,
          type: plan.type,
          durationInMonths: plan.durationInMonths.toString(),
        },
      });

      // Create Stripe price
      const price = await this.stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(plan.price * 100), // Convert to cents
        currency: this.configService.get<string>('stripe.currency') || 'usd',
        recurring: plan.type !== PlanType.LIFETIME ? {
          interval: this.getStripeInterval(plan.type),
          interval_count: this.getIntervalCount(plan.type),
        } : undefined,
        metadata: {
          planId: plan.id,
        },
      });

      this.logger.log(`Created Stripe product and price for plan: ${plan.name}`);
      return {
        productId: product.id,
        priceId: price.id,
      };
    } catch (error) {
      this.logger.error(`Failed to create Stripe product for plan ${plan.name}:`, error);
      throw error;
    }
  }

  async updateProduct(plan: SubscriptionPlan): Promise<{ productId: string; priceId: string }> {
    this.ensureStripeInitialized();
    try {
      if (!plan.stripeProductId) {
        return this.createProduct(plan);
      }

      // Update existing product
      await this.stripe.products.update(plan.stripeProductId, {
        name: plan.name,
        description: plan.description || undefined,
        metadata: {
          planId: plan.id,
          type: plan.type,
          durationInMonths: plan.durationInMonths.toString(),
        },
      });

      // Create new price if plan price changed
      const price = await this.stripe.prices.create({
        product: plan.stripeProductId,
        unit_amount: Math.round(plan.price * 100),
        currency: this.configService.get<string>('stripe.currency') || 'usd',
        recurring: plan.type !== PlanType.LIFETIME ? {
          interval: this.getStripeInterval(plan.type),
          interval_count: this.getIntervalCount(plan.type),
        } : undefined,
        metadata: {
          planId: plan.id,
        },
      });

      this.logger.log(`Updated Stripe product and created new price for plan: ${plan.name}`);
      return {
        productId: plan.stripeProductId,
        priceId: price.id,
      };
    } catch (error) {
      this.logger.error(`Failed to update Stripe product for plan ${plan.name}:`, error);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    this.ensureStripeInitialized();
    try {
      await this.stripe.products.del(productId);
      this.logger.log(`Deleted Stripe product: ${productId}`);
    } catch (error) {
      this.logger.error(`Failed to delete Stripe product ${productId}:`, error);
      throw error;
    }
  }

  async createCheckoutSession(
    priceId: string,
    userId: string,
    successUrl: string,
    cancelUrl: string,
    metadata?: Record<string, any>
  ): Promise<{ sessionId: string; url: string }> {
    this.ensureStripeInitialized();
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: metadata?.email,
        metadata: {
          userId,
          ...metadata,
        },
      });

      this.logger.log(`Created checkout session for user ${userId}`);
      return {
        sessionId: session.id,
        url: session.url || '',
      };
    } catch (error) {
      this.logger.error(`Failed to create checkout session for user ${userId}:`, error);
      throw error;
    }
  }

  async createCustomerPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<{ url: string }> {
    this.ensureStripeInitialized();
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      this.logger.log(`Created customer portal session for customer ${customerId}`);
      return {
        url: session.url,
      };
    } catch (error) {
      this.logger.error(`Failed to create customer portal session for customer ${customerId}:`, error);
      throw error;
    }
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    this.ensureStripeInitialized();
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      this.logger.error(`Failed to retrieve subscription ${subscriptionId}:`, error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    this.ensureStripeInitialized();
    try {
      return await this.stripe.subscriptions.cancel(subscriptionId);
    } catch (error) {
      this.logger.error(`Failed to cancel subscription ${subscriptionId}:`, error);
      throw error;
    }
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    this.ensureStripeInitialized();
    try {
      return await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
    } catch (error) {
      this.logger.error(`Failed to retrieve customer ${customerId}:`, error);
      throw error;
    }
  }

  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    this.ensureStripeInitialized();
    try {
      return await this.stripe.customers.create({
        email,
        name,
      });
    } catch (error) {
      this.logger.error(`Failed to create customer for email ${email}:`, error);
      throw error;
    }
  }

  async constructWebhookEvent(payload: string | Buffer, signature: string): Promise<Stripe.Event> {
    this.ensureStripeInitialized();
    const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret is not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error('Failed to construct webhook event:', error);
      throw error;
    }
  }

  async getPublishableKey(): Promise<string> {
    return this.configService.get<string>('stripe.publishableKey') || '';
  }

  async getMode(): Promise<string> {
    return this.configService.get<string>('stripe.mode') || 'test';
  }

  async getAccount(): Promise<Stripe.Account> {
    this.ensureStripeInitialized();
    try {
      return await this.stripe.accounts.retrieve();
    } catch (error) {
      this.logger.error('Failed to retrieve Stripe account:', error);
      throw error;
    }
  }

  private getStripeInterval(planType: PlanType): Stripe.Price.Recurring.Interval {
    switch (planType) {
      case PlanType.MONTHLY:
        return 'month';
      case PlanType.QUARTERLY:
        return 'month';
      case PlanType.YEARLY:
        return 'year';
      default:
        return 'month';
    }
  }

  private getIntervalCount(planType: PlanType): number {
    switch (planType) {
      case PlanType.MONTHLY:
        return 1;
      case PlanType.QUARTERLY:
        return 3;
      case PlanType.YEARLY:
        return 1;
      default:
        return 1;
    }
  }
}
