import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCode, PromoCodeStatus } from '../entities/promo-code.entity';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface CreatePromoCodeDto {
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  minimumAmount?: number;
  maxUses?: number;
  validFrom?: Date;
  validUntil?: Date;
  influencerName?: string;
  influencerEmail?: string;
  influencerSocialHandle?: string;
  influencerNotes?: string;
}

export interface UpdatePromoCodeDto {
  name?: string;
  description?: string;
  minimumAmount?: number;
  maxUses?: number;
  validFrom?: Date;
  validUntil?: Date;
  status?: PromoCodeStatus;
  influencerName?: string;
  influencerEmail?: string;
  influencerSocialHandle?: string;
  influencerNotes?: string;
}

@Injectable()
export class PromoCodesService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(PromoCode)
    private promoCodeRepository: Repository<PromoCode>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });
  }

  async createPromoCode(createDto: CreatePromoCodeDto): Promise<PromoCode> {
    // Check if code already exists
    const existingCode = await this.promoCodeRepository.findOne({
      where: { code: createDto.code },
    });

    if (existingCode) {
      throw new BadRequestException('Promo code already exists');
    }

    const promoCode = this.promoCodeRepository.create({
      code: createDto.code,
      name: createDto.name,
      description: createDto.description,
      type: createDto.type as any, // Type assertion for enum
      value: createDto.value,
      minimumAmount: createDto.minimumAmount,
      maxUses: createDto.maxUses,
      validFrom: createDto.validFrom,
      validUntil: createDto.validUntil,
      influencerName: createDto.influencerName,
      influencerEmail: createDto.influencerEmail,
      influencerSocialHandle: createDto.influencerSocialHandle,
      influencerNotes: createDto.influencerNotes,
    });
    
    const savedPromoCode = await this.promoCodeRepository.save(promoCode);
    
    // Automatically sync to Stripe
    try {
      await this.syncPromoCodeToStripe(savedPromoCode);
      console.log(`✅ Promo code ${savedPromoCode.code} synced to Stripe automatically`);
    } catch (error) {
      console.error(`❌ Failed to sync promo code ${savedPromoCode.code} to Stripe:`, error);
      // Don't throw error - promo code is still created in database
    }
    
    return savedPromoCode;
  }

  async syncPromoCodeToStripe(promoCode: PromoCode): Promise<void> {
    try {
      // Check if coupon already exists in Stripe
      const existingCoupons = await this.stripe.coupons.list({
        limit: 100,
      });
      
      const existingCoupon = existingCoupons.data.find(coupon => 
        coupon.metadata && coupon.metadata.promo_code_id === promoCode.id
      );
      
      if (!existingCoupon) {
        // Create Stripe coupon
        const couponData: any = {
          duration: 'once',
          metadata: {
            promo_code_id: promoCode.id,
            promo_code: promoCode.code,
          },
        };
        
        if (promoCode.type === 'percentage') {
          couponData.percent_off = promoCode.value;
        } else {
          couponData.amount_off = Math.round(promoCode.value * 100); // Convert to cents
          couponData.currency = 'usd';
        }
        
        const coupon = await this.stripe.coupons.create(couponData);
        
        // Create promotion code
        await this.stripe.promotionCodes.create({
          coupon: coupon.id,
          code: promoCode.code,
          max_redemptions: promoCode.maxUses,
          metadata: {
            promo_code_id: promoCode.id,
            influencer_name: promoCode.influencerName || '',
          },
        });
        
        console.log(`✅ Created Stripe coupon for promo code: ${promoCode.code}`);
      }
    } catch (error) {
      console.error(`❌ Error creating Stripe coupon for ${promoCode.code}:`, error);
      throw error;
    }
  }

  async getAllPromoCodes(): Promise<PromoCode[]> {
    return this.promoCodeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getPromoCodeById(id: string): Promise<PromoCode> {
    const promoCode = await this.promoCodeRepository.findOne({
      where: { id },
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    return promoCode;
  }

  async getPromoCodeByCode(code: string): Promise<PromoCode> {
    const promoCode = await this.promoCodeRepository.findOne({
      where: { code },
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    return promoCode;
  }

  async updatePromoCode(id: string, updateDto: UpdatePromoCodeDto): Promise<PromoCode> {
    const promoCode = await this.getPromoCodeById(id);
    
    Object.assign(promoCode, updateDto);
    return this.promoCodeRepository.save(promoCode);
  }

  async deletePromoCode(id: string): Promise<{ message: string }> {
    const promoCode = await this.getPromoCodeById(id);
    await this.promoCodeRepository.remove(promoCode);
    return { message: 'Promo code deleted successfully' };
  }

  async validatePromoCode(code: string, orderAmount: number): Promise<{
    valid: boolean;
    discount: number;
    promoCode?: PromoCode;
    error?: string;
  }> {
    try {
      const promoCode = await this.getPromoCodeByCode(code);

      // Check if code is active
      if (promoCode.status !== PromoCodeStatus.ACTIVE) {
        return { valid: false, discount: 0, error: 'Promo code is not active' };
      }

      // Check if code has expired
      const now = new Date();
      if (promoCode.validUntil && now > promoCode.validUntil) {
        return { valid: false, discount: 0, error: 'Promo code has expired' };
      }

      // Check if code is not yet valid
      if (promoCode.validFrom && now < promoCode.validFrom) {
        return { valid: false, discount: 0, error: 'Promo code is not yet valid' };
      }

      // Check minimum amount
      if (promoCode.minimumAmount && orderAmount < promoCode.minimumAmount) {
        return { 
          valid: false, 
          discount: 0, 
          error: `Minimum order amount is $${promoCode.minimumAmount}` 
        };
      }

      // Check max uses
      if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
        return { valid: false, discount: 0, error: 'Promo code has reached maximum uses' };
      }

      // Calculate discount
      let discount = 0;
      if (promoCode.type === 'percentage') {
        discount = (orderAmount * promoCode.value) / 100;
      } else {
        discount = promoCode.value;
      }

      // Don't allow discount to exceed order amount
      discount = Math.min(discount, orderAmount);

      return { valid: true, discount, promoCode };
    } catch (error) {
      return { valid: false, discount: 0, error: 'Invalid promo code' };
    }
  }

  async usePromoCode(code: string): Promise<{ message: string; promoCode: PromoCode }> {
    const promoCode = await this.getPromoCodeByCode(code);
    
    // Increment usage count
    promoCode.usedCount += 1;
    await this.promoCodeRepository.save(promoCode);

    return { message: 'Promo code used successfully', promoCode };
  }

  async getPromoCodeStatistics(): Promise<{
    totalPromoCodes: number;
    activePromoCodes: number;
    totalUses: number;
    topPromoCodes: PromoCode[];
  }> {
    const [totalPromoCodes, activePromoCodes, allPromoCodes] = await Promise.all([
      this.promoCodeRepository.count(),
      this.promoCodeRepository.count({ where: { status: PromoCodeStatus.ACTIVE } }),
      this.promoCodeRepository.find({
        order: { usedCount: 'DESC' },
        take: 5,
      }),
    ]);

    const totalUses = allPromoCodes.reduce((sum, code) => sum + code.usedCount, 0);

    return {
      totalPromoCodes,
      activePromoCodes,
      totalUses,
      topPromoCodes: allPromoCodes,
    };
  }
}
