import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';

@Injectable()
export class SubscriptionPlansService {
  private readonly logger = new Logger(SubscriptionPlansService.name);

  constructor(
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
  ) {}

  /**
   * Get all active subscription plans
   */
  async getActivePlans(): Promise<SubscriptionPlan[]> {
    try {
      this.logger.log('Fetching active subscription plans');
      const plans = await this.subscriptionPlanRepository.find({
        where: { isActive: true },
        order: { price: 'ASC' },
      });
      
      this.logger.log(`Found ${plans.length} active subscription plans`);
      return plans;
    } catch (error) {
      this.logger.error('Failed to fetch active subscription plans', error.stack);
      throw new BadRequestException('Failed to fetch subscription plans');
    }
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
  async getPlanById(id: string): Promise<SubscriptionPlan> {
    try {
      if (!id) {
        throw new BadRequestException('Plan ID is required');
      }

      this.logger.log(`Fetching subscription plan with ID: ${id}`);
      const plan = await this.subscriptionPlanRepository.findOne({
        where: { id },
      });

      if (!plan) {
        throw new NotFoundException(`Subscription plan with ID ${id} not found`);
      }

      return plan;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to fetch subscription plan with ID: ${id}`, error.stack);
      throw new BadRequestException('Failed to fetch subscription plan');
    }
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
