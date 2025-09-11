import { IsUUID, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseSubscriptionDto {
  @ApiProperty({
    description: 'Subscription plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'Please provide a valid plan ID' })
  planId: string;

  @ApiProperty({
    description: 'Additional metadata for the subscription',
    example: { paymentMethod: 'card', coupon: 'WELCOME10' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
