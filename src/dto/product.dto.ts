import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Kumu Coaching Premium'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Premium coaching subscription with personalized sessions'
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Product price',
    example: 20.99
  })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'USD',
    default: 'USD'
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Stripe Price ID',
    example: 'price_1S8n4wFooGVEYWinxi5NxFSL'
  })
  @IsString()
  @IsOptional()
  stripePriceId?: string;

  @ApiPropertyOptional({
    description: 'Stripe Product ID',
    example: 'prod_T4wyxMacGpdDKB'
  })
  @IsString()
  @IsOptional()
  stripeProductId?: string;

  @ApiPropertyOptional({
    description: 'Product active status',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Is this a subscription product',
    example: true,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isSubscription?: boolean;

  @ApiPropertyOptional({
    description: 'Billing interval for subscriptions',
    example: 'year',
    enum: ['month', 'year']
  })
  @IsString()
  @IsOptional()
  billingInterval?: string;

  @ApiPropertyOptional({
    description: 'Trial period in days',
    example: 7
  })
  @IsNumber()
  @IsOptional()
  trialPeriodDays?: number;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ProductResponseDto {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  isActive: boolean;
  isSubscription: boolean;
  billingInterval: string;
  trialPeriodDays: number;
  createdAt: Date;
  updatedAt: Date;
}
