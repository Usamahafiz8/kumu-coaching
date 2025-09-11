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

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
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
