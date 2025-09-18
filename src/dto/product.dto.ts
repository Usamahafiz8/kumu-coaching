import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  stripePriceId?: string;

  @IsString()
  @IsOptional()
  stripeProductId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isSubscription?: boolean;

  @IsString()
  @IsOptional()
  billingInterval?: string;

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
