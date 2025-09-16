import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { CreateEmailTemplateDto } from './dto/email-template.dto';
import { UpdateEmailTemplateDto } from './dto/email-template.dto';
import { EmailTemplate } from '../entities/email-template.entity';
import { EmailService } from '../email/email.service';
import { AppConfig } from '../entities/app-config.entity';
import { PurchaseRecord } from '../entities/purchase-record.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { Influencer, InfluencerStatus } from '../entities/influencer.entity';
import { Commission, CommissionStatus } from '../entities/commission.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
    @InjectRepository(AppConfig)
    private appConfigRepository: Repository<AppConfig>,
    @InjectRepository(PurchaseRecord)
    private purchaseRecordRepository: Repository<PurchaseRecord>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(Influencer)
    private influencerRepository: Repository<Influencer>,
    @InjectRepository(Commission)
    private commissionRepository: Repository<Commission>,
    private emailService: EmailService,
  ) {}

  async getUsers(page: number = 1, limit: number = 10): Promise<{
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

  async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
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

  async updateUserStatus(id: string, status: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = status as any;
    return this.userRepository.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);
  }

  async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    adminUsers: number;
  }> {
    const [totalUsers, activeUsers, verifiedUsers, adminUsers] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { status: UserStatus.ACTIVE } }),
      this.userRepository.count({ where: { emailVerified: true } }),
      this.userRepository.count({ where: { role: UserRole.ADMIN } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      adminUsers,
    };
  }


  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return this.emailTemplateRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getEmailTemplate(id: string): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    return template;
  }

  async createEmailTemplate(createTemplateDto: CreateEmailTemplateDto): Promise<EmailTemplate> {
    const template = this.emailTemplateRepository.create(createTemplateDto);
    return this.emailTemplateRepository.save(template);
  }

  async updateEmailTemplate(id: string, updateTemplateDto: UpdateEmailTemplateDto): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    Object.assign(template, updateTemplateDto);
    return this.emailTemplateRepository.save(template);
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    const template = await this.emailTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    await this.emailTemplateRepository.remove(template);
  }

  // App Configuration Management
  async getAppConfigs(): Promise<AppConfig[]> {
    return this.appConfigRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async createAppConfig(configData: Partial<AppConfig>): Promise<AppConfig> {
    const config = this.appConfigRepository.create(configData);
    return this.appConfigRepository.save(config);
  }

  async updateAppConfig(id: string, configData: Partial<AppConfig>): Promise<AppConfig> {
    const config = await this.appConfigRepository.findOne({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('App configuration not found');
    }

    Object.assign(config, configData);
    return this.appConfigRepository.save(config);
  }

  async deleteAppConfig(id: string): Promise<void> {
    const config = await this.appConfigRepository.findOne({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('App configuration not found');
    }

    await this.appConfigRepository.remove(config);
  }

  // Purchase Records Management
  async getPurchaseRecords(page: number = 1, limit: number = 50): Promise<{
    records: PurchaseRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [records, total] = await this.purchaseRecordRepository.findAndCount({
      relations: ['user', 'plan', 'promoCode'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPurchaseRecord(id: string): Promise<PurchaseRecord> {
    const record = await this.purchaseRecordRepository.findOne({
      where: { id },
      relations: ['user', 'plan', 'promoCode'],
    });

    if (!record) {
      throw new NotFoundException('Purchase record not found');
    }

    return record;
  }

  // Subscription Plans Management (Admin)
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return this.subscriptionPlanRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async createSubscriptionPlan(planData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const plan = this.subscriptionPlanRepository.create(planData);
    return this.subscriptionPlanRepository.save(plan);
  }

  async updateSubscriptionPlan(id: string, planData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    Object.assign(plan, planData);
    return this.subscriptionPlanRepository.save(plan);
  }

  async deleteSubscriptionPlan(id: string): Promise<void> {
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    await this.subscriptionPlanRepository.remove(plan);
  }

  // Influencer Management
  async getInfluencers(page: number = 1, limit: number = 10): Promise<{
    influencers: Influencer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [influencers, total] = await this.influencerRepository.findAndCount({
      relations: ['user', 'promoCodes', 'commissions'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      influencers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getInfluencerById(id: string): Promise<Influencer> {
    const influencer = await this.influencerRepository.findOne({
      where: { id },
      relations: ['user', 'promoCodes', 'commissions', 'commissions.purchaseRecord'],
    });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    return influencer;
  }

  async getInfluencerStats(): Promise<any> {
    const totalInfluencers = await this.influencerRepository.count();
    const activeInfluencers = await this.influencerRepository.count({
      where: { status: InfluencerStatus.ACTIVE },
    });
    const pendingInfluencers = await this.influencerRepository.count({
      where: { status: InfluencerStatus.PENDING },
    });

    const totalCommissions = await this.commissionRepository
      .createQueryBuilder('commission')
      .select('SUM(commission.amount)', 'total')
      .where('commission.status IN (:...statuses)', { statuses: [CommissionStatus.APPROVED, CommissionStatus.PAID] })
      .getRawOne();

    const pendingCommissions = await this.commissionRepository
      .createQueryBuilder('commission')
      .select('SUM(commission.amount)', 'total')
      .where('commission.status = :status', { status: CommissionStatus.PENDING })
      .getRawOne();

    return {
      totalInfluencers,
      activeInfluencers,
      pendingInfluencers,
      totalCommissions: parseFloat(totalCommissions?.total || '0'),
      pendingCommissions: parseFloat(pendingCommissions?.total || '0'),
    };
  }

  async getCommissions(page: number = 1, limit: number = 10): Promise<{
    commissions: Commission[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [commissions, total] = await this.commissionRepository.findAndCount({
      relations: ['influencer', 'influencer.user', 'purchaseRecord', 'purchaseRecord.user', 'purchaseRecord.plan'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      commissions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateCommissionStatus(id: string, status: string): Promise<Commission> {
    const commission = await this.commissionRepository.findOne({
      where: { id },
      relations: ['influencer'],
    });

    if (!commission) {
      throw new NotFoundException('Commission not found');
    }

    commission.status = status as any;
    
    if (status === 'paid') {
      commission.paidAt = new Date();
    }

    return this.commissionRepository.save(commission);
  }
}