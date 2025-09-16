import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Influencer, InfluencerStatus } from '../entities/influencer.entity';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Commission, CommissionStatus } from '../entities/commission.entity';
import { PurchaseRecord } from '../entities/purchase-record.entity';
import { CreateInfluencerDto } from './dto/create-influencer.dto';
import { UpdateInfluencerDto } from './dto/update-influencer.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class InfluencersService {
  constructor(
    @InjectRepository(Influencer)
    private influencerRepository: Repository<Influencer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Commission)
    private commissionRepository: Repository<Commission>,
    @InjectRepository(PurchaseRecord)
    private purchaseRecordRepository: Repository<PurchaseRecord>,
  ) {}

  async create(createInfluencerDto: CreateInfluencerDto): Promise<Influencer> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createInfluencerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create user first
    const hashedPassword = await bcrypt.hash(createInfluencerDto.password, 12);
    const user = this.userRepository.create({
      email: createInfluencerDto.email,
      password: hashedPassword,
      firstName: createInfluencerDto.firstName,
      lastName: createInfluencerDto.lastName,
      phone: createInfluencerDto.phone,
      role: UserRole.INFLUENCER,
      status: UserStatus.ACTIVE,
    });

    const savedUser = await this.userRepository.save(user);

    // Create influencer profile
    const influencer = this.influencerRepository.create({
      userId: savedUser.id,
      socialMediaHandle: createInfluencerDto.socialMediaHandle,
      platform: createInfluencerDto.platform,
      followerCount: createInfluencerDto.followerCount,
      commissionRate: createInfluencerDto.commissionRate || 10.0,
      bio: createInfluencerDto.bio,
      website: createInfluencerDto.website,
      profileImageUrl: createInfluencerDto.profileImageUrl,
      notes: createInfluencerDto.notes,
      status: InfluencerStatus.PENDING,
    });

    return this.influencerRepository.save(influencer);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ influencers: Influencer[]; total: number; page: number; limit: number; totalPages: number }> {
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

  async findOne(id: string): Promise<Influencer> {
    const influencer = await this.influencerRepository.findOne({
      where: { id },
      relations: ['user', 'promoCodes', 'commissions', 'commissions.purchaseRecord'],
    });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    return influencer;
  }

  async update(id: string, updateInfluencerDto: UpdateInfluencerDto): Promise<Influencer> {
    const influencer = await this.findOne(id);

    // If status is being changed to active, set approvedAt
    if (updateInfluencerDto.status === InfluencerStatus.ACTIVE && influencer.status !== InfluencerStatus.ACTIVE) {
      updateInfluencerDto['approvedAt'] = new Date();
    }

    Object.assign(influencer, updateInfluencerDto);
    return this.influencerRepository.save(influencer);
  }

  async remove(id: string): Promise<void> {
    const influencer = await this.findOne(id);
    await this.influencerRepository.remove(influencer);
  }

  async approveInfluencer(id: string, adminUserId: string): Promise<Influencer> {
    const influencer = await this.findOne(id);
    
    influencer.status = InfluencerStatus.ACTIVE;
    influencer.approvedAt = new Date();
    influencer.approvedBy = adminUserId;

    return this.influencerRepository.save(influencer);
  }

  async getInfluencerStats(id: string): Promise<any> {
    const influencer = await this.findOne(id);
    
    const totalCommissions = await this.commissionRepository.count({
      where: { influencerId: id },
    });

    const approvedCommissions = await this.commissionRepository.count({
      where: { influencerId: id, status: CommissionStatus.APPROVED },
    });

    const paidCommissions = await this.commissionRepository.count({
      where: { influencerId: id, status: CommissionStatus.PAID },
    });

    const totalEarnings = await this.commissionRepository
      .createQueryBuilder('commission')
      .select('SUM(commission.amount)', 'total')
      .where('commission.influencerId = :id', { id })
      .andWhere('commission.status IN (:...statuses)', { statuses: [CommissionStatus.APPROVED, CommissionStatus.PAID] })
      .getRawOne();

    const pendingEarnings = await this.commissionRepository
      .createQueryBuilder('commission')
      .select('SUM(commission.amount)', 'total')
      .where('commission.influencerId = :id', { id })
      .andWhere('commission.status = :status', { status: CommissionStatus.PENDING })
      .getRawOne();

    return {
      influencer,
      stats: {
        totalCommissions,
        approvedCommissions,
        paidCommissions,
        totalEarnings: parseFloat(totalEarnings?.total || '0'),
        pendingEarnings: parseFloat(pendingEarnings?.total || '0'),
        conversionRate: influencer.conversionRate,
      },
    };
  }

  async createCommissionForPurchase(purchaseRecordId: string): Promise<Commission | null> {
    const purchaseRecord = await this.purchaseRecordRepository.findOne({
      where: { id: purchaseRecordId },
      relations: ['promoCode', 'promoCode.influencer'],
    });

    if (!purchaseRecord || !purchaseRecord.promoCode?.influencer) {
      return null; // No influencer associated with this purchase
    }

    const influencer = purchaseRecord.promoCode.influencer;
    const commissionAmount = (purchaseRecord.finalPrice * influencer.commissionRate) / 100;

    const commission = this.commissionRepository.create({
      influencerId: influencer.id,
      purchaseRecordId: purchaseRecord.id,
      amount: commissionAmount,
      rate: influencer.commissionRate,
      originalAmount: purchaseRecord.finalPrice,
      currency: purchaseRecord.currency,
      status: CommissionStatus.PENDING,
    });

    const savedCommission = await this.commissionRepository.save(commission);

    // Update influencer earnings
    influencer.totalEarnings += commissionAmount;
    influencer.pendingEarnings += commissionAmount;
    await this.influencerRepository.save(influencer);

    // Update purchase record with commission info
    purchaseRecord.commissionAmount = commissionAmount;
    purchaseRecord.commissionRate = influencer.commissionRate;
    purchaseRecord.influencerId = influencer.id;
    await this.purchaseRecordRepository.save(purchaseRecord);

    return savedCommission;
  }

  async getCommissions(influencerId: string, page: number = 1, limit: number = 10): Promise<{ commissions: Commission[]; total: number; page: number; limit: number; totalPages: number }> {
    const [commissions, total] = await this.commissionRepository.findAndCount({
      where: { influencerId },
      relations: ['purchaseRecord', 'purchaseRecord.user', 'purchaseRecord.plan'],
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
}
