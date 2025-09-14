import { IsString, IsNumber, IsOptional, IsEnum, Min, IsDateString } from 'class-validator';
import { PromoCodeType } from '../../entities/promo-code.entity';

export class CreatePromoCodeDto {
  @IsString()
  code: string;

  @IsString()
  influencerId: string;

  @IsEnum(PromoCodeType)
  type: PromoCodeType;

  @IsNumber()
  @Min(0)
  value: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxDiscount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minOrderAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  usageLimit?: number;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
