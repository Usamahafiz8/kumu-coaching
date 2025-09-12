import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('stripe.secretKey');
    if (!secretKey) {
      throw new Error('Stripe secret key is not configured');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-08-27.basil',
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, any> = {},
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      this.logger.log(`Payment intent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error('Failed to create payment intent:', error);
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return paymentIntent;
      }

      throw new BadRequestException('Payment not completed');
    } catch (error) {
      this.logger.error('Failed to confirm payment intent:', error);
      throw new BadRequestException('Failed to confirm payment');
    }
  }

  async createCustomer(user: User): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: {
          userId: user.id,
        },
      });

      this.logger.log(`Customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      this.logger.error('Failed to create customer:', error);
      throw new BadRequestException('Failed to create customer');
    }
  }

  async createProduct(plan: SubscriptionPlan): Promise<Stripe.Product> {
    try {
      const product = await this.stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          planId: plan.id,
        },
      });

      this.logger.log(`Product created: ${product.id}`);
      return product;
    } catch (error) {
      this.logger.error('Failed to create product:', error);
      throw new BadRequestException('Failed to create product');
    }
  }

  async createPrice(
    productId: string,
    amount: number,
    currency: string,
    interval: 'month' | 'year' = 'month',
  ): Promise<Stripe.Price> {
    try {
      const price = await this.stripe.prices.create({
        product: productId,
        unit_amount: Math.round(amount * 100), // Convert to cents
        currency,
        recurring: {
          interval,
        },
      });

      this.logger.log(`Price created: ${price.id}`);
      return price;
    } catch (error) {
      this.logger.error('Failed to create price:', error);
      throw new BadRequestException('Failed to create price');
    }
  }

  async createSubscription(
    customerId: string,
    priceId: string,
    metadata: Record<string, any> = {},
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      this.logger.log(`Subscription created: ${subscription.id}`);
      return subscription;
    } catch (error) {
      this.logger.error('Failed to create subscription:', error);
      throw new BadRequestException('Failed to create subscription');
    }
  }

  async retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      this.logger.error('Failed to retrieve subscription:', error);
      throw new BadRequestException('Failed to retrieve subscription');
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.cancel(subscriptionId);
      this.logger.log(`Subscription cancelled: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      this.logger.error('Failed to cancel subscription:', error);
      throw new BadRequestException('Failed to cancel subscription');
    }
  }

  async constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
  ): Promise<Stripe.Event> {
    try {
      const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
      if (!webhookSecret) {
        throw new Error('Stripe webhook secret is not configured');
      }
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return event;
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  getPublishableKey(): string {
    const publishableKey = this.configService.get<string>('stripe.publishableKey');
    if (!publishableKey) {
      throw new Error('Stripe publishable key is not configured');
    }
    return publishableKey;
  }
}
