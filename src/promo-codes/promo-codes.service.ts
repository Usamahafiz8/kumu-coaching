import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCode, PromoCodeStatus, PromoCodeType } from '../entities/promo-code.entity';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';

@Injectable()
export class PromoCodesService {
  private readonly logger = new Logger(PromoCodesService.name);

  constructor(
    @InjectRepository(PromoCode)
    private promoCodeRepository: Repository<PromoCode>,
  ) {}

  /**
   * Generate a random promo code
   */
  private generatePromoCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Create a new promo code
   */
  async createPromoCode(createPromoCodeDto: CreatePromoCodeDto, createdBy: string): Promise<PromoCode> {
    // Generate code if not provided
    let code = createPromoCodeDto.code;
    if (!code) {
      code = this.generatePromoCode();
      // Ensure uniqueness
      while (await this.promoCodeRepository.findOne({ where: { code } })) {
        code = this.generatePromoCode();
      }
    } else {
      // Check if code already exists
      const existingCode = await this.promoCodeRepository.findOne({ where: { code } });
      if (existingCode) {
        throw new ConflictException('Promo code already exists');
      }
    }

    // Validate percentage discount
    if (createPromoCodeDto.type === PromoCodeType.PERCENTAGE && createPromoCodeDto.value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    const promoCode = this.promoCodeRepository.create({
      ...createPromoCodeDto,
      code,
      createdBy,
      status: PromoCodeStatus.ACTIVE,
    });

    const savedPromoCode = await this.promoCodeRepository.save(promoCode);
    this.logger.log(`Created promo code: ${code} by admin: ${createdBy}`);
    
    return savedPromoCode;
  }

  /**
   * Get all promo codes (admin only)
   */
  async getAllPromoCodes(): Promise<PromoCode[]> {
    return this.promoCodeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get promo code by ID
   */
  async getPromoCodeById(id: string): Promise<PromoCode> {
    const promoCode = await this.promoCodeRepository.findOne({ where: { id } });
    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }
    return promoCode;
  }

  /**
   * Get promo code by code string
   */
  async getPromoCodeByCode(code: string): Promise<PromoCode | null> {
    return this.promoCodeRepository.findOne({ where: { code } });
  }

  /**
   * Update promo code
   */
  async updatePromoCode(id: string, updatePromoCodeDto: UpdatePromoCodeDto): Promise<PromoCode> {
    const promoCode = await this.getPromoCodeById(id);
    
    // Check if new code conflicts with existing codes
    if (updatePromoCodeDto.code && updatePromoCodeDto.code !== promoCode.code) {
      const existingCode = await this.promoCodeRepository.findOne({ 
        where: { code: updatePromoCodeDto.code } 
      });
      if (existingCode) {
        throw new ConflictException('Promo code already exists');
      }
    }

    // Validate percentage discount
    if (updatePromoCodeDto.type === PromoCodeType.PERCENTAGE && updatePromoCodeDto.value && updatePromoCodeDto.value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    Object.assign(promoCode, updatePromoCodeDto);
    const updatedPromoCode = await this.promoCodeRepository.save(promoCode);
    
    this.logger.log(`Updated promo code: ${promoCode.code}`);
    return updatedPromoCode;
  }

  /**
   * Delete promo code
   */
  async deletePromoCode(id: string): Promise<void> {
    const promoCode = await this.getPromoCodeById(id);
    await this.promoCodeRepository.remove(promoCode);
    this.logger.log(`Deleted promo code: ${promoCode.code}`);
  }

  /**
   * Validate promo code for use
   */
  async validatePromoCode(code: string, orderAmount: number = 0): Promise<{
    valid: boolean;
    promoCode?: PromoCode;
    discountAmount?: number;
    message?: string;
  }> {
    const promoCode = await this.getPromoCodeByCode(code);
    
    if (!promoCode) {
      return { valid: false, message: 'Promo code not found' };
    }

    if (!promoCode.isActive) {
      return { valid: false, message: 'Promo code is not active' };
    }

    if (promoCode.isExpired) {
      return { valid: false, message: 'Promo code has expired' };
    }

    if (promoCode.usageLimit > 0 && promoCode.usedCount >= promoCode.usageLimit) {
      return { valid: false, message: 'Promo code usage limit reached' };
    }

    if (promoCode.minOrderAmount && orderAmount < promoCode.minOrderAmount) {
      return { 
        valid: false, 
        message: `Minimum order amount of ${promoCode.minOrderAmount} required` 
      };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (promoCode.type === PromoCodeType.PERCENTAGE) {
      discountAmount = (orderAmount * promoCode.value) / 100;
      if (promoCode.maxDiscount && discountAmount > promoCode.maxDiscount) {
        discountAmount = promoCode.maxDiscount;
      }
    } else {
      discountAmount = promoCode.value;
    }

    return {
      valid: true,
      promoCode,
      discountAmount,
      message: 'Promo code is valid',
    };
  }

  /**
   * Increment usage count for a promo code
   */
  async incrementUsage(id: string): Promise<void> {
    const promoCode = await this.getPromoCodeById(id);
    promoCode.usedCount += 1;
    await this.promoCodeRepository.save(promoCode);
    this.logger.log(`Incremented usage for promo code: ${promoCode.code} (${promoCode.usedCount}/${promoCode.usageLimit || 'unlimited'})`);
  }

  /**
   * Get promo code usage statistics
   */
  async getPromoCodeStats(id: string): Promise<{
    totalUses: number;
    remainingUses: number;
    isActive: boolean;
    isExpired: boolean;
  }> {
    const promoCode = await this.getPromoCodeById(id);
    
    return {
      totalUses: promoCode.usedCount,
      remainingUses: promoCode.remainingUses,
      isActive: promoCode.isActive,
      isExpired: promoCode.isExpired,
    };
  }
}

