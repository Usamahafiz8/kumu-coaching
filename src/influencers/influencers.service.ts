import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Influencer } from '../entities/influencer.entity';
import { Commission } from '../entities/commission.entity';
import { WithdrawalRequest } from '../entities/withdrawal-request.entity';
import { PromoCode } from '../entities/promo-code.entity';
import { InfluencerRegisterDto, InfluencerUpdateDto, WithdrawalRequestDto } from '../dto/influencer.dto';
import { BankValidationService } from '../bank-validation/bank-validation.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class InfluencersService {
  constructor(
    @InjectRepository(Influencer)
    private influencerRepository: Repository<Influencer>,
    @InjectRepository(Commission)
    private commissionRepository: Repository<Commission>,
    @InjectRepository(WithdrawalRequest)
    private withdrawalRepository: Repository<WithdrawalRequest>,
    @InjectRepository(PromoCode)
    private promoCodeRepository: Repository<PromoCode>,
    private bankValidationService: BankValidationService,
  ) {}

  async register(registerDto: InfluencerRegisterDto) {
    // Check if influencer already exists
    const existingInfluencer = await this.influencerRepository.findOne({
      where: { email: registerDto.email }
    });

    if (existingInfluencer) {
      throw new ConflictException('Influencer with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create influencer
    const influencer = this.influencerRepository.create({
      ...registerDto,
      password: hashedPassword,
      status: 'pending' // Require admin approval
    });

    return await this.influencerRepository.save(influencer);
  }

  async login(email: string, password: string) {
    const influencer = await this.influencerRepository.findOne({
      where: { email }
    });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    if (influencer.status !== 'approved') {
      throw new BadRequestException('Account not approved yet');
    }

    const isPasswordValid = await bcrypt.compare(password, influencer.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: influencer.id, 
        email: influencer.email, 
        type: 'influencer' 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return {
      token,
      influencer: {
        id: influencer.id,
        name: influencer.name,
        email: influencer.email,
        socialHandle: influencer.socialHandle,
        totalEarnings: influencer.totalEarnings,
        pendingEarnings: influencer.pendingEarnings,
        paidEarnings: influencer.paidEarnings,
        totalCommissions: influencer.totalCommissions,
        activeCommissions: influencer.activeCommissions
      }
    };
  }

  async getProfile(influencerId: string) {
    const influencer = await this.influencerRepository.findOne({
      where: { id: influencerId }
    });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    return {
      id: influencer.id,
      name: influencer.name,
      email: influencer.email,
      socialHandle: influencer.socialHandle,
      bankAccount: influencer.bankAccount,
      bankName: influencer.bankName,
      accountHolderName: influencer.accountHolderName,
      totalEarnings: influencer.totalEarnings,
      pendingEarnings: influencer.pendingEarnings,
      paidEarnings: influencer.paidEarnings,
      totalCommissions: influencer.totalCommissions,
      activeCommissions: influencer.activeCommissions
    };
  }

  async updateProfile(influencerId: string, updateDto: InfluencerUpdateDto) {
    const influencer = await this.influencerRepository.findOne({
      where: { id: influencerId }
    });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    Object.assign(influencer, updateDto);
    return await this.influencerRepository.save(influencer);
  }

  async getCommissions(influencerId: string) {
    return await this.commissionRepository.find({
      where: { influencerId },
      relations: ['promoCode'],
      order: { createdAt: 'DESC' }
    });
  }

  async getWithdrawals(influencerId: string) {
    return await this.withdrawalRepository.find({
      where: { influencerId },
      order: { requestedAt: 'DESC' }
    });
  }

  async requestWithdrawal(influencerId: string, withdrawalDto: WithdrawalRequestDto) {
    const influencer = await this.influencerRepository.findOne({
      where: { id: influencerId }
    });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    if (withdrawalDto.amount > influencer.pendingEarnings) {
      throw new BadRequestException('Insufficient pending earnings');
    }

    // Validate bank account information
    const bankValidation = this.bankValidationService.validateBankAccount({
      routingNumber: withdrawalDto.routingNumber,
      accountNumber: withdrawalDto.bankAccount,
      bankName: withdrawalDto.bankName,
      accountHolderName: withdrawalDto.accountHolderName,
      accountType: withdrawalDto.accountType
    });

    if (!bankValidation.isValid) {
      throw new BadRequestException(`Bank validation failed: ${bankValidation.errors.join(', ')}`);
    }

    const withdrawal = this.withdrawalRepository.create({
      ...withdrawalDto,
      influencerId
    });

    return await this.withdrawalRepository.save(withdrawal);
  }

  // Admin methods
  async getAllInfluencers() {
    return await this.influencerRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async getPendingInfluencers() {
    return await this.influencerRepository.find({
      where: { status: 'pending' },
      order: { createdAt: 'DESC' }
    });
  }

  async updateInfluencerStatus(influencerId: string, status: 'pending' | 'approved' | 'rejected') {
    const influencer = await this.influencerRepository.findOne({
      where: { id: influencerId }
    });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    influencer.status = status;
    return await this.influencerRepository.save(influencer);
  }

  async getAllWithdrawals() {
    return await this.withdrawalRepository.find({
      relations: ['influencer'],
      order: { requestedAt: 'DESC' }
    });
  }

  async approveWithdrawal(withdrawalId: string) {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id: withdrawalId },
      relations: ['influencer']
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal request not found');
    }

    if (withdrawal.status !== 'pending') {
      throw new BadRequestException('Withdrawal request already processed');
    }

    withdrawal.status = 'approved';
    return await this.withdrawalRepository.save(withdrawal);
  }

  async rejectWithdrawal(withdrawalId: string, reason: string) {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id: withdrawalId }
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal request not found');
    }

    if (withdrawal.status !== 'pending') {
      throw new BadRequestException('Withdrawal request already processed');
    }

    withdrawal.status = 'rejected';
    withdrawal.rejectionReason = reason;
    return await this.withdrawalRepository.save(withdrawal);
  }

  async processWithdrawal(withdrawalId: string) {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id: withdrawalId },
      relations: ['influencer']
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal request not found');
    }

    if (withdrawal.status !== 'approved') {
      throw new BadRequestException('Withdrawal request must be approved first');
    }

    // Here you would integrate with Stripe to process the payment
    // For now, we'll just mark it as paid
    withdrawal.status = 'paid';
    withdrawal.processedAt = new Date();
    withdrawal.stripeTransferId = `tr_${Date.now()}`; // Mock Stripe transfer ID

    // Update influencer earnings
    const influencer = withdrawal.influencer;
    influencer.pendingEarnings -= withdrawal.amount;
    influencer.paidEarnings += withdrawal.amount;

    await this.influencerRepository.save(influencer);
    return await this.withdrawalRepository.save(withdrawal);
  }

  async getInfluencerPromoCodes(influencerId: string) {
    return await this.promoCodeRepository.find({
      where: { influencerId },
      order: { createdAt: 'DESC' }
    });
  }
}
