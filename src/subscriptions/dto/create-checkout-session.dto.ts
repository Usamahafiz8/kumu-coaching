import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    description: 'ID of the subscription plan to purchase',
    example: 'plan-annual',
  })
  @IsString()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({
    description: 'Promo code to apply discount (optional)',
    example: 'SAVE20',
    required: false,
  })
  @IsString()
  @IsOptional()
  promoCode?: string;
}