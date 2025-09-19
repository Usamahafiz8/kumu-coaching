import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { ProductsService } from '../products/products.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { UsersService } from '../users/users.service';
import { PromoCodesService } from '../promo-codes/promo-codes.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private productsService: ProductsService,
    private subscriptionsService: SubscriptionsService,
    private usersService: UsersService,
    private promoCodesService: PromoCodesService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });
  }

  async createCheckoutSession(productId: string, userId: string): Promise<{ url: string }> {
    // Use hardcoded subscription product
    const product = this.productsService.getSubscriptionProduct();
    
    // Get user information to pre-fill email
    const user = await this.usersService.findById(userId);
    
    // Create a one-time price for the annual subscription
    const price = await this.stripe.prices.create({
      unit_amount: Math.round(product.price * 100), // Convert to cents
      currency: product.currency.toLowerCase(),
      product: product.stripeProductId,
    });
    
    // Create Stripe coupons for all active promo codes
    await this.syncPromoCodesToStripe();
    
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'payment', // Changed from 'subscription' to 'payment' for one-time payment
      success_url: `${this.configService.get<string>('BACKEND_URL') || 'http://localhost:3005'}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3003'}/cancel`,
      allow_promotion_codes: true, // Enable promo codes
      customer_email: user.email, // Pre-fill the user's email
      metadata: {
        userId,
        productId: product.id,
      },
    });

    return { url: session.url || '' };
  }

  async syncPromoCodesToStripe(): Promise<void> {
    try {
      // Get all active promo codes from our database
      const promoCodes = await this.promoCodesService.getAllPromoCodes();
      
      for (const promoCode of promoCodes) {
        if (promoCode.status === 'active') {
          try {
            // Check if coupon already exists in Stripe
            const existingCoupons = await this.stripe.coupons.list({
              limit: 100,
            });
            
            const existingCoupon = existingCoupons.data.find(coupon => 
              coupon.metadata && coupon.metadata.promo_code_id === promoCode.id
            );
            
            if (!existingCoupon) {
              // Create Stripe coupon
              const couponData: any = {
                duration: 'once',
                metadata: {
                  promo_code_id: promoCode.id,
                  promo_code: promoCode.code,
                },
              };
              
              if (promoCode.type === 'percentage') {
                couponData.percent_off = promoCode.value;
              } else {
                couponData.amount_off = Math.round(promoCode.value * 100); // Convert to cents
                couponData.currency = 'usd';
              }
              
              const coupon = await this.stripe.coupons.create(couponData);
              
              // Create promotion code
              await this.stripe.promotionCodes.create({
                coupon: coupon.id,
                code: promoCode.code,
                max_redemptions: promoCode.maxUses,
                metadata: {
                  promo_code_id: promoCode.id,
                  influencer_name: promoCode.influencerName || '',
                },
              });
              
              console.log(`✅ Created Stripe coupon for promo code: ${promoCode.code}`);
            }
          } catch (error) {
            console.error(`❌ Error creating Stripe coupon for ${promoCode.code}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error syncing promo codes to Stripe:', error);
    }
  }

  async handleCheckoutSuccess(sessionId: string): Promise<{ message: string; subscription?: any }> {
    try {
      // Retrieve the checkout session from Stripe
      const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['customer']
      });

      if (!session.metadata) {
        throw new Error('Invalid session metadata');
      }

      const { userId, productId } = session.metadata;

      if (session.payment_status === 'paid') {
        // Create a one-year subscription in our database
        const product = this.productsService.getSubscriptionProduct();
        const now = new Date();
        const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

        const subscription = await this.subscriptionsService.createOneTimeSubscription(
          userId, 
          productId, 
          session.payment_intent as string,
          now,
          oneYearFromNow
        );

        return {
          message: 'Annual subscription activated successfully! Welcome to Kumu Coaching Premium.',
          subscription: {
            id: subscription.id,
            status: subscription.status,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd
          }
        };
      } else {
        throw new Error('Payment not completed');
      }
    } catch (error) {
      throw new Error(`Failed to process subscription: ${error.message}`);
    }
  }

  async verifyPayment(sessionId: string): Promise<any> {
    try {
      // Retrieve the checkout session from Stripe
      const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'customer', 'line_items']
      });

      if (!session.metadata) {
        throw new Error('Invalid session metadata');
      }

      const { userId, productId } = session.metadata;

      // Get subscription details from our database
      const subscription = await this.subscriptionsService.findByUserId(userId);
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Get product details
      const product = this.productsService.getSubscriptionProduct();

      return {
        verified: true,
        sessionId: sessionId,
        paymentStatus: session.payment_status,
        planName: product.name,
        status: subscription.status,
        nextBillingDate: subscription.currentPeriodEnd,
        subscriptionId: subscription.id,
        customerEmail: session.customer_details?.email || 'N/A',
        amount: session.amount_total ? (session.amount_total / 100) : 0,
        currency: session.currency || 'usd'
      };
    } catch (error) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
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
