import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Influencer, InfluencerStatus } from '../entities/influencer.entity';
import { PromoCode, PromoCodeStatus, PromoCodeType } from '../entities/promo-code.entity';
import { Commission, CommissionStatus } from '../entities/commission.entity';
import { User } from '../entities/user.entity';
import { Subscription } from '../entities/subscription.entity';
import { CreateInfluencerDto } from '../admin/dto/create-influencer.dto';
import { UpdateInfluencerDto } from '../admin/dto/update-influencer.dto';
import { CreatePromoCodeDto } from '../admin/dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from '../admin/dto/update-promo-code.dto';
import { ValidatePromoCodeDto, PromoCodeValidationResponseDto } from '../admin/dto/validate-promo-code.dto';
import { CreateWithdrawalRequestDto } from '../admin/dto/withdrawal-request.dto';
import { StripeService } from '../stripe/stripe.service';
import { Inject, forwardRef } from '@nestjs/common';

@Injectable()
export class InfluencerService {
  constructor(
    @InjectRepository(Influencer)
    private influencerRepository: Repository<Influencer>,
    @InjectRepository(PromoCode)
    private promoCodeRepository: Repository<PromoCode>,
    @InjectRepository(Commission)
    private commissionRepository: Repository<Commission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @Inject(forwardRef(() => StripeService))
    private stripeService: StripeService,
  ) {}

  async createInfluencer(createInfluencerDto: CreateInfluencerDto): Promise<Influencer> {
    const { userId, commissionRate = 10.0, status = InfluencerStatus.ACTIVE, notes } = createInfluencerDto;

    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already an influencer
    const existingInfluencer = await this.influencerRepository.findOne({ where: { userId } });
    if (existingInfluencer) {
      throw new ConflictException('User is already an influencer');
    }

    const influencer = this.influencerRepository.create({
      userId,
      commissionRate,
      status,
      notes,
    });

    return this.influencerRepository.save(influencer);
  }

  async getAllInfluencers(page: number = 1, limit: number = 10): Promise<{ influencers: Influencer[]; total: number }> {
    const [influencers, total] = await this.influencerRepository.findAndCount({
      relations: ['user', 'promoCodes'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { influencers, total };
  }

  async getInfluencerById(id: string): Promise<Influencer> {
    const influencer = await this.influencerRepository.findOne({
      where: { id },
      relations: ['user', 'promoCodes', 'commissions'],
    });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    return influencer;
  }

  async getInfluencerByUserId(userId: string): Promise<Influencer> {
    const influencer = await this.influencerRepository.findOne({
      where: { userId },
      relations: ['user', 'promoCodes', 'commissions'],
    });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    return influencer;
  }

  async updateInfluencer(id: string, updateInfluencerDto: UpdateInfluencerDto): Promise<Influencer> {
    const influencer = await this.getInfluencerById(id);

    Object.assign(influencer, updateInfluencerDto);
    return this.influencerRepository.save(influencer);
  }

  async deleteInfluencer(id: string): Promise<void> {
    const influencer = await this.getInfluencerById(id);

    // Check if influencer has any commissions
    const commissionCount = await this.commissionRepository.count({ where: { influencerId: id } });
    if (commissionCount > 0) {
      throw new BadRequestException('Cannot delete influencer with existing commissions');
    }

    await this.influencerRepository.remove(influencer);
  }

  async createPromoCode(createPromoCodeDto: CreatePromoCodeDto): Promise<PromoCode> {
    const { code, influencerId, type, value, maxDiscount, minOrderAmount, usageLimit, expiresAt, description } = createPromoCodeDto;

    // Check if influencer exists
    const influencer = await this.getInfluencerById(influencerId);
    if (influencer.status !== InfluencerStatus.ACTIVE) {
      throw new BadRequestException('Cannot create promo code for inactive influencer');
    }

    // Check if code already exists
    const existingCode = await this.promoCodeRepository.findOne({ where: { code } });
    if (existingCode) {
      throw new ConflictException('Promo code already exists');
    }

    const promoCode = this.promoCodeRepository.create({
      code,
      influencerId,
      type,
      value,
      maxDiscount,
      minOrderAmount,
      usageLimit,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      description,
    });

    return this.promoCodeRepository.save(promoCode);
  }

  async getPromoCodesByInfluencer(influencerId: string): Promise<PromoCode[]> {
    return this.promoCodeRepository.find({
      where: { influencerId },
      order: { createdAt: 'DESC' },
    });
  }

  async updatePromoCode(id: string, updatePromoCodeDto: UpdatePromoCodeDto): Promise<PromoCode> {
    const promoCode = await this.promoCodeRepository.findOne({ where: { id } });
    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    Object.assign(promoCode, updatePromoCodeDto);
    return this.promoCodeRepository.save(promoCode);
  }

  async deletePromoCode(id: string): Promise<void> {
    const promoCode = await this.promoCodeRepository.findOne({ where: { id } });
    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    if (promoCode.usedCount > 0) {
      throw new BadRequestException('Cannot delete promo code that has been used');
    }

    await this.promoCodeRepository.remove(promoCode);
  }

  async validatePromoCode(validatePromoCodeDto: ValidatePromoCodeDto): Promise<PromoCodeValidationResponseDto> {
    const { code, orderAmount } = validatePromoCodeDto;

    const promoCode = await this.promoCodeRepository.findOne({
      where: { code },
      relations: ['influencer'],
    });

    if (!promoCode) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: orderAmount,
        error: 'Promo code not found',
      };
    }

    if (!promoCode.isActive) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: orderAmount,
        error: 'Promo code is not active or has expired',
      };
    }

    if (promoCode.minOrderAmount && orderAmount < promoCode.minOrderAmount) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: orderAmount,
        error: `Minimum order amount of $${promoCode.minOrderAmount} required`,
      };
    }

    let discountAmount = 0;

    if (promoCode.type === PromoCodeType.PERCENTAGE) {
      discountAmount = (orderAmount * promoCode.value) / 100;
      if (promoCode.maxDiscount && discountAmount > promoCode.maxDiscount) {
        discountAmount = promoCode.maxDiscount;
      }
    } else {
      discountAmount = promoCode.value;
    }

    const finalAmount = Math.max(0, orderAmount - discountAmount);

    return {
      isValid: true,
      discountAmount,
      finalAmount,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        type: promoCode.type,
        value: promoCode.value,
        maxDiscount: promoCode.maxDiscount,
        description: promoCode.description,
      },
    };
  }

  async applyPromoCode(code: string, subscriptionId: string): Promise<void> {
    const promoCode = await this.promoCodeRepository.findOne({ where: { code } });
    if (!promoCode || !promoCode.isActive) {
      throw new BadRequestException('Invalid or inactive promo code');
    }

    const subscription = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Update subscription with promo code
    subscription.promoCodeId = promoCode.id;
    await this.subscriptionRepository.save(subscription);

    // Increment usage count
    promoCode.usedCount += 1;
    await this.promoCodeRepository.save(promoCode);

    // Update influencer stats
    const influencer = await this.getInfluencerById(promoCode.influencerId);
    influencer.totalReferrals += 1;
    influencer.successfulReferrals += 1;
    await this.influencerRepository.save(influencer);

    // Create commission record
    await this.createCommission(promoCode.influencerId, subscriptionId, subscription.amount, influencer.commissionRate);
  }

  private async createCommission(influencerId: string, subscriptionId: string, subscriptionAmount: number, commissionRate: number): Promise<Commission> {
    const commissionAmount = (subscriptionAmount * commissionRate) / 100;

    const commission = this.commissionRepository.create({
      influencerId,
      subscriptionId,
      subscriptionAmount,
      commissionRate,
      commissionAmount,
      status: CommissionStatus.PENDING,
    });

    const savedCommission = await this.commissionRepository.save(commission);

    // Update influencer earnings
    const influencer = await this.getInfluencerById(influencerId);
    influencer.totalEarnings += commissionAmount;
    influencer.availableBalance += commissionAmount;
    await this.influencerRepository.save(influencer);

    return savedCommission;
  }

  async getCommissionsByInfluencer(influencerId: string, page: number = 1, limit: number = 10): Promise<{ commissions: Commission[]; total: number }> {
    const [commissions, total] = await this.commissionRepository.findAndCount({
      where: { influencerId },
      relations: ['subscription', 'subscription.plan', 'subscription.user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { commissions, total };
  }

  async getAllCommissions(page: number = 1, limit: number = 10): Promise<{ commissions: Commission[]; total: number }> {
    const [commissions, total] = await this.commissionRepository.findAndCount({
      relations: ['influencer', 'influencer.user', 'subscription', 'subscription.plan', 'subscription.user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { commissions, total };
  }

  async updateCommissionStatus(id: string, status: CommissionStatus, notes?: string): Promise<Commission> {
    const commission = await this.commissionRepository.findOne({ where: { id } });
    if (!commission) {
      throw new NotFoundException('Commission not found');
    }

    commission.status = status;
    if (notes) {
      commission.notes = notes;
    }

    if (status === CommissionStatus.PAID) {
      commission.paidAt = new Date();
    }

    return this.commissionRepository.save(commission);
  }

  async createWithdrawalRequest(influencerId: string, createWithdrawalRequestDto: CreateWithdrawalRequestDto): Promise<any> {
    const { amount, notes } = createWithdrawalRequestDto;

    const influencer = await this.getInfluencerById(influencerId);

    if (influencer.availableBalance < amount) {
      throw new BadRequestException('Insufficient balance for withdrawal');
    }

    if (amount < 10) {
      throw new BadRequestException('Minimum withdrawal amount is $10');
    }

    // Create withdrawal request (you might want to create a separate entity for this)
    // For now, we'll use Stripe to create a payout directly
    try {
      const payout = await this.stripeService.createPayout(influencer.stripeAccountId, amount, notes);
      
      // Update influencer balance
      influencer.availableBalance -= amount;
      influencer.totalWithdrawn += amount;
      await this.influencerRepository.save(influencer);

      return {
        id: payout.id,
        amount,
        status: payout.status,
        createdAt: new Date(),
        payoutId: payout.id,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to process withdrawal: ${error.message}`);
    }
  }

  async getInfluencerStats(influencerId: string): Promise<any> {
    const influencer = await this.getInfluencerById(influencerId);
    
    const [commissions, total] = await this.commissionRepository.findAndCount({
      where: { influencerId },
    });

    const pendingCommissions = await this.commissionRepository.count({
      where: { influencerId, status: CommissionStatus.PENDING },
    });

    const paidCommissions = await this.commissionRepository.count({
      where: { influencerId, status: CommissionStatus.PAID },
    });

    const totalCommissionAmount = await this.commissionRepository
      .createQueryBuilder('commission')
      .select('SUM(commission.commissionAmount)', 'total')
      .where('commission.influencerId = :influencerId', { influencerId })
      .getRawOne();

    return {
      influencer,
      totalCommissions: total,
      pendingCommissions,
      paidCommissions,
      totalCommissionAmount: parseFloat(totalCommissionAmount.total) || 0,
      availableBalance: influencer.availableBalance,
      totalWithdrawn: influencer.totalWithdrawn,
    };
  }
}
