import { IsUUID, IsOptional, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({
    description: 'Subscription plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'Please provide a valid plan ID' })
  planId: string;

  @ApiProperty({
    description: 'Payment method ID (optional, for saved payment methods)',
    example: 'pm_1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @ApiProperty({
    description: 'Additional metadata for the payment',
    example: { coupon: 'WELCOME10', source: 'web' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
