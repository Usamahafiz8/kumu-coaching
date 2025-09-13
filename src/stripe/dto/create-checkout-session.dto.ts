import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({ description: 'Stripe price ID for the subscription plan' })
  @IsString()
  priceId: string;

  @ApiProperty({ description: 'Success URL to redirect after successful payment' })
  @IsString()
  successUrl: string;

  @ApiProperty({ description: 'Cancel URL to redirect if payment is cancelled' })
  @IsString()
  cancelUrl: string;

  @ApiProperty({ description: 'Additional metadata for the session', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
