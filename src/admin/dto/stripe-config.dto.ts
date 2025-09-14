import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StripeConfigDto {
  @ApiProperty({
    description: 'Stripe Secret Key',
    example: 'sk_test_...',
    required: false,
  })
  @IsOptional()
  @IsString()
  secretKey?: string;

  @ApiProperty({
    description: 'Stripe Publishable Key',
    example: 'pk_test_...',
    required: false,
  })
  @IsOptional()
  @IsString()
  publishableKey?: string;

  @ApiProperty({
    description: 'Stripe Webhook Secret',
    example: 'whsec_...',
    required: false,
  })
  @IsOptional()
  @IsString()
  webhookSecret?: string;

  @ApiProperty({
    description: 'Stripe Currency',
    example: 'usd',
    required: false,
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: 'Stripe Mode',
    example: 'test',
    enum: ['test', 'live'],
    required: false,
  })
  @IsOptional()
  @IsIn(['test', 'live'])
  mode?: string;

  @ApiProperty({
    description: 'Stripe Account ID',
    example: 'acct_...',
    required: false,
  })
  @IsOptional()
  @IsString()
  accountId?: string;
}

export class StripeConfigResponseDto {
  @ApiProperty()
  secretKey?: string;

  @ApiProperty()
  publishableKey?: string;

  @ApiProperty()
  webhookSecret?: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  mode: string;

  @ApiProperty()
  accountId?: string;

  @ApiProperty()
  isConfigured: boolean;
}
