import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, Matches, MaxLength } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    description: 'ID of the subscription plan to purchase',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'Plan ID must be a string' })
  @IsNotEmpty({ message: 'Plan ID is required' })
  @IsUUID('4', { message: 'Plan ID must be a valid UUID' })
  planId: string;

  @ApiProperty({
    description: 'Promo code to apply discount (optional)',
    example: 'SAVE20',
    required: false,
  })
  @IsString({ message: 'Promo code must be a string' })
  @IsOptional()
  @MaxLength(20, { message: 'Promo code must not exceed 20 characters' })
  @Matches(/^[A-Z0-9_-]+$/, { 
    message: 'Promo code must contain only uppercase letters, numbers, hyphens, and underscores' 
  })
  promoCode?: string;
}