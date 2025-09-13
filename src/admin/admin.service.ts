import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Subscription, SubscriptionStatus } from '../entities/subscription.entity';
import { SubscriptionPlan, PlanStatus } from '../entities/subscription-plan.entity';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
  ) {}

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [users, total] = await this.userRepository.findAndCount({
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'phone',
        'role',
        'status',
        'emailVerified',
        'createdAt',
        'updatedAt',
      ],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'phone',
        'role',
        'status',
        'emailVerified',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { userId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllSubscriptions(page: number = 1, limit: number = 10): Promise<{
    subscriptions: Subscription[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [subscriptions, total] = await this.subscriptionRepository.findAndCount({
      relations: ['user', 'plan'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      subscriptions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSubscriptionStats(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    cancelledSubscriptions: number;
    expiredSubscriptions: number;
    totalRevenue: number;
    monthlyRevenue: number;
    planStats: Array<{
      planName: string;
      count: number;
      revenue: number;
    }>;
  }> {
    const [
      totalSubscriptions,
      activeSubscriptions,
      cancelledSubscriptions,
      expiredSubscriptions,
    ] = await Promise.all([
      this.subscriptionRepository.count(),
      this.subscriptionRepository.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      this.subscriptionRepository.count({
        where: { status: SubscriptionStatus.CANCELLED },
      }),
      this.subscriptionRepository.count({
        where: { status: SubscriptionStatus.EXPIRED },
      }),
    ]);

    // Calculate total revenue
    const totalRevenueResult = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .select('SUM(subscription.amount)', 'total')
      .getRawOne();

    // Calculate monthly revenue (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyRevenueResult = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .select('SUM(subscription.amount)', 'total')
      .where('subscription.createdAt >= :currentMonth', { currentMonth })
      .getRawOne();

    // Get plan statistics
    const planStats = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .leftJoin('subscription.plan', 'plan')
      .select('plan.name', 'planName')
      .addSelect('COUNT(subscription.id)', 'count')
      .addSelect('SUM(subscription.amount)', 'revenue')
      .groupBy('plan.id, plan.name')
      .getRawMany();

    return {
      totalSubscriptions,
      activeSubscriptions,
      cancelledSubscriptions,
      expiredSubscriptions,
      totalRevenue: parseFloat(totalRevenueResult?.total || '0'),
      monthlyRevenue: parseFloat(monthlyRevenueResult?.total || '0'),
      planStats: planStats.map(stat => ({
        planName: stat.planName,
        count: parseInt(stat.count),
        revenue: parseFloat(stat.revenue || '0'),
      })),
    };
  }

  async updateUserStatus(userId: string, status: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = status as any;
    return this.userRepository.save(user);
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role as UserRole;
    return this.userRepository.save(user);
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);
  }

  // Subscription Plan Management Methods
  async getAllSubscriptionPlans(page: number = 1, limit: number = 10): Promise<{
    plans: SubscriptionPlan[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [plans, total] = await this.subscriptionPlanRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Add subscription count for each plan
    const plansWithCounts = await Promise.all(
      plans.map(async (plan) => {
        const subscriptionCount = await this.subscriptionRepository.count({
          where: { planId: plan.id, status: SubscriptionStatus.ACTIVE },
        });
        return { ...plan, subscriptionCount };
      })
    );

    return {
      plans: plansWithCounts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSubscriptionPlanById(id: string): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return plan;
  }

  async createSubscriptionPlan(createPlanDto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    // Check if a plan with the same name already exists
    const existingPlan = await this.subscriptionPlanRepository.findOne({
      where: { name: createPlanDto.name },
    });

    if (existingPlan) {
      throw new BadRequestException('A subscription plan with this name already exists');
    }

    const plan = this.subscriptionPlanRepository.create({
      ...createPlanDto,
      status: createPlanDto.status || PlanStatus.ACTIVE,
      isActive: createPlanDto.isActive !== undefined ? createPlanDto.isActive : true,
    });

    return this.subscriptionPlanRepository.save(plan);
  }

  async updateSubscriptionPlan(id: string, updatePlanDto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    // Check if updating name and if it conflicts with existing plan
    if (updatePlanDto.name && updatePlanDto.name !== plan.name) {
      const existingPlan = await this.subscriptionPlanRepository.findOne({
        where: { name: updatePlanDto.name },
      });

      if (existingPlan) {
        throw new BadRequestException('A subscription plan with this name already exists');
      }
    }

    // Don't allow deactivating a plan that has active subscriptions
    if (updatePlanDto.isActive === false || updatePlanDto.status === PlanStatus.INACTIVE) {
      const activeSubscriptions = await this.subscriptionRepository.count({
        where: { planId: id, status: SubscriptionStatus.ACTIVE },
      });

      if (activeSubscriptions > 0) {
        throw new BadRequestException('Cannot deactivate a plan that has active subscriptions');
      }
    }

    Object.assign(plan, updatePlanDto);
    return this.subscriptionPlanRepository.save(plan);
  }

  async deleteSubscriptionPlan(id: string): Promise<void> {
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    // Check if plan has any subscriptions
    const subscriptionCount = await this.subscriptionRepository.count({
      where: { planId: id },
    });

    if (subscriptionCount > 0) {
      throw new BadRequestException('Cannot delete a subscription plan that has associated subscriptions');
    }

    await this.subscriptionPlanRepository.remove(plan);
  }

  async getSubscriptionPlanStats(): Promise<{
    totalPlans: number;
    activePlans: number;
    inactivePlans: number;
    archivedPlans: number;
    plansWithSubscriptions: number;
    mostPopularPlan: {
      planName: string;
      subscriptionCount: number;
    } | null;
  }> {
    const [
      totalPlans,
      activePlans,
      inactivePlans,
      archivedPlans,
    ] = await Promise.all([
      this.subscriptionPlanRepository.count(),
      this.subscriptionPlanRepository.count({ where: { status: PlanStatus.ACTIVE } }),
      this.subscriptionPlanRepository.count({ where: { status: PlanStatus.INACTIVE } }),
      this.subscriptionPlanRepository.count({ where: { status: PlanStatus.ARCHIVED } }),
    ]);

    // Get plans with subscriptions
    const plansWithSubscriptions = await this.subscriptionPlanRepository
      .createQueryBuilder('plan')
      .leftJoin('plan.subscriptions', 'subscription')
      .where('subscription.id IS NOT NULL')
      .getCount();

    // Get most popular plan
    const mostPopularPlanResult = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .leftJoin('subscription.plan', 'plan')
      .select('plan.name', 'planName')
      .addSelect('COUNT(subscription.id)', 'subscriptionCount')
      .groupBy('plan.id, plan.name')
      .orderBy('COUNT(subscription.id)', 'DESC')
      .limit(1)
      .getRawOne();

    return {
      totalPlans,
      activePlans,
      inactivePlans,
      archivedPlans,
      plansWithSubscriptions,
      mostPopularPlan: mostPopularPlanResult ? {
        planName: mostPopularPlanResult.planName,
        subscriptionCount: parseInt(mostPopularPlanResult.subscriptionCount),
      } : null,
    };
  }

  private validateAdminAccess(user: User): void {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied. Admin role required.');
    }
  }
}
