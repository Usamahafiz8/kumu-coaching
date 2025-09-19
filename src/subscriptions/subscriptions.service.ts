import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Subscription, SubscriptionStatus } from '../entities/subscription.entity';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}

  async createFromStripe(userId: string, productId: string, stripeSubscription: Stripe.Subscription): Promise<Subscription> {
    const user = await this.usersService.findById(userId);
    // Use hardcoded product instead of database lookup
    const product = this.productsService.getSubscriptionProduct();

    const subscription = this.subscriptionRepository.create({
      userId,
      productId: product.id, // Use hardcoded product ID
      stripeSubscriptionId: stripeSubscription.id,
      stripeCustomerId: stripeSubscription.customer as string,
      status: this.mapStripeStatus(stripeSubscription.status),
      currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    });

    return this.subscriptionRepository.save(subscription);
  }

  async updateFromStripe(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (subscription) {
      subscription.status = this.mapStripeStatus(stripeSubscription.status);
      subscription.currentPeriodStart = new Date((stripeSubscription as any).current_period_start * 1000);
      subscription.currentPeriodEnd = new Date((stripeSubscription as any).current_period_end * 1000);
      subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
      
      if (stripeSubscription.canceled_at) {
        subscription.canceledAt = new Date(stripeSubscription.canceled_at * 1000);
      }

      await this.subscriptionRepository.save(subscription);
    }
  }

  async cancelFromStripe(stripeSubscriptionId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId },
    });

    if (subscription) {
      subscription.status = SubscriptionStatus.CANCELED;
      subscription.canceledAt = new Date();
      await this.subscriptionRepository.save(subscription);
    }
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async getActiveSubscriptions(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { 
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['product'],
    });
  }

  async getSubscriptionStatus(userId: string): Promise<{ hasActiveSubscription: boolean; subscriptions: Subscription[] }> {
    const activeSubscriptions = await this.getActiveSubscriptions(userId);
    return {
      hasActiveSubscription: activeSubscriptions.length > 0,
      subscriptions: activeSubscriptions,
    };
  }

  async cancelSubscription(userId: string, subscriptionId: string): Promise<{ message: string }> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.cancelAtPeriodEnd = true;
    await this.subscriptionRepository.save(subscription);

    return { message: 'Subscription will be canceled at the end of the current period' };
  }

  private mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    switch (stripeStatus) {
      case 'active':
        return SubscriptionStatus.ACTIVE;
      case 'trialing':
        return SubscriptionStatus.TRIALING;
      case 'past_due':
        return SubscriptionStatus.PAST_DUE;
      case 'unpaid':
        return SubscriptionStatus.UNPAID;
      case 'canceled':
        return SubscriptionStatus.CANCELED;
      default:
        return SubscriptionStatus.INACTIVE;
    }
  }
}
