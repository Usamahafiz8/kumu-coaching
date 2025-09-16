import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2025-08-27.basil',
      });
      this.logger.log('Stripe initialized successfully');
    } else {
      this.logger.warn('Stripe secret key not found in environment variables');
    }
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    return this.stripe.customers.create({
      email,
      name,
    });
  }

  /**
   * Create a Stripe product
   */
  async createProduct(name: string, description?: string): Promise<Stripe.Product> {
    return this.stripe.products.create({
      name,
      description,
      type: 'service',
    });
  }

  /**
   * Create a Stripe price
   */
  async createPrice({
    productId,
    amount,
    currency,
    interval,
  }: {
    productId: string;
    amount: number;
    currency: string;
    interval: 'month' | 'year';
  }): Promise<Stripe.Price> {
    return this.stripe.prices.create({
      product: productId,
      unit_amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      recurring: {
        interval,
      },
    });
  }

  /**
   * Create a Stripe checkout session
   */
  async createCheckoutSession({
    customerId,
    priceId,
    successUrl,
    cancelUrl,
    discountCode,
  }: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    discountCode?: string;
  }): Promise<Stripe.Checkout.Session> {
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
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
      metadata: {
        type: 'subscription',
      },
    };

    // Add discount code if provided
    if (discountCode) {
      sessionConfig.discounts = [
        {
          coupon: discountCode,
        },
      ];
    }

    return this.stripe.checkout.sessions.create(sessionConfig);
  }

  /**
   * Retrieve a Stripe subscription
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  /**
   * Cancel a Stripe subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.cancel(subscriptionId);
  }

  /**
   * Construct webhook event from raw body and signature
   */
  constructWebhookEvent(body: string, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }
    return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
  }

  /**
   * Get Stripe configuration for frontend
   */
  getConfig() {
    return {
      publishableKey: this.configService.get<string>('STRIPE_PUBLISHABLE_KEY'),
      priceId: this.configService.get<string>('STRIPE_PRICE_ID'),
    };
  }

  /**
   * Retrieve a checkout session
   */
  async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      this.logger.error('Failed to retrieve checkout session:', error);
      return null;
    }
  }
}