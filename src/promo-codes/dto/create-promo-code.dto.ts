import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { PromoCodeType } from '../../entities/promo-code.entity';

export class CreatePromoCodeDto {
  @ApiProperty({
    description: 'The promo code string (will be auto-generated if not provided)',
    example: 'WELCOME20',
    required: false,
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'Type of discount',
    enum: PromoCodeType,
    example: PromoCodeType.PERCENTAGE,
  })
  @IsEnum(PromoCodeType)
  @IsNotEmpty()
  type: PromoCodeType;

  @ApiProperty({
    description: 'Discount value (percentage or fixed amount)',
    example: 20,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  value: number;

  @ApiProperty({
    description: 'Maximum discount amount (for percentage discounts)',
    example: 50,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxDiscount?: number;

  @ApiProperty({
    description: 'Minimum order amount to use this code',
    example: 10,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minOrderAmount?: number;

  @ApiProperty({
    description: 'Usage limit (0 = unlimited)',
    example: 100,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  usageLimit?: number;

  @ApiProperty({
    description: 'Expiration date (ISO string)',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiProperty({
    description: 'Description of the promo code',
    example: 'Welcome discount for new users',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Campaign name',
    example: 'Summer Sale 2024',
    required: false,
  })
  @IsString()
  @IsOptional()
  campaignName?: string;

  @ApiProperty({
    description: 'Admin notes',
    example: 'Created for marketing campaign',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Influencer ID (if this promo code is for an influencer)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  influencerId?: string;
}

