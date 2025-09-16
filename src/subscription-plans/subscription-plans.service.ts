import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';

@Injectable()
export class SubscriptionPlansService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
  ) {}

  /**
   * Get all active subscription plans
   */
  async getActivePlans(): Promise<SubscriptionPlan[]> {
    return this.subscriptionPlanRepository.find({
      where: { isActive: true },
      order: { price: 'ASC' },
    });
  }

  /**
   * Get all subscription plans (for admin)
   */
  async getAllPlans(): Promise<SubscriptionPlan[]> {
    return this.subscriptionPlanRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get plan by ID
   */
  async getPlanById(id: string): Promise<SubscriptionPlan | null> {
    return this.subscriptionPlanRepository.findOne({
      where: { id },
    });
  }

  /**
   * Create a new subscription plan
   */
  async createPlan(planData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const plan = this.subscriptionPlanRepository.create(planData);
    return this.subscriptionPlanRepository.save(plan);
  }

  /**
   * Update a subscription plan
   */
  async updatePlan(id: string, planData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null> {
    await this.subscriptionPlanRepository.update(id, planData);
    return this.getPlanById(id);
  }

  /**
   * Delete a subscription plan
   */
  async deletePlan(id: string): Promise<void> {
    await this.subscriptionPlanRepository.delete(id);
  }
}
