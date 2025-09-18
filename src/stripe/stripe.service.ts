import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { ProductsService } from '../products/products.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private productsService: ProductsService,
    private subscriptionsService: SubscriptionsService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });
  }

  async createCheckoutSession(productId: string, userId: string): Promise<{ url: string }> {
    const product = await this.productsService.findOne(productId);
    
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: product.currency.toLowerCase(),
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: Math.round(product.price * 100), // Convert to cents
            recurring: product.isSubscription ? {
              interval: product.billingInterval as any,
            } : undefined,
          },
          quantity: 1,
        },
      ],
      mode: product.isSubscription ? 'subscription' : 'payment',
      success_url: `${this.configService.get<string>('SUBSCRIPTION_SUCCESS_URL')}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: this.configService.get<string>('SUBSCRIPTION_CANCEL_URL'),
      metadata: {
        userId,
        productId,
      },
    });

    return { url: session.url || '' };
  }

  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    return this.stripe.customers.create({
      email,
      name,
    });
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    const customer = await this.stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      throw new Error('Customer has been deleted');
    }
    return customer as Stripe.Customer;
  }

  async createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async constructWebhookEvent(body: any, signature: string): Promise<Stripe.Event> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    if (!session.metadata) return;
    const { userId, productId } = session.metadata;
    
    if (session.mode === 'subscription') {
      // Handle subscription creation
      const subscription = await this.getSubscription(session.subscription as string);
      await this.subscriptionsService.createFromStripe(userId, productId, subscription);
    } else {
      // Handle one-time payment
      // You can implement one-time payment logic here
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    // Handle subscription created event
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    await this.subscriptionsService.updateFromStripe(subscription);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    await this.subscriptionsService.cancelFromStripe(subscription.id);
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    // Handle successful payment
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    // Handle failed payment
  }
}
