import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsArray, IsOptional, IsBoolean, Min } from 'class-validator';
import { PlanType, PlanStatus } from '../../entities/subscription-plan.entity';

export class CreateSubscriptionPlanDto {
  @ApiProperty({ description: 'Name of the subscription plan' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the subscription plan', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Price of the subscription plan' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ 
    description: 'Type of the subscription plan',
    enum: PlanType,
    example: PlanType.MONTHLY
  })
  @IsEnum(PlanType)
  type: PlanType;

  @ApiProperty({ description: 'Duration in months', default: 1 })
  @IsNumber()
  @Min(1)
  durationInMonths: number;

  @ApiProperty({ 
    description: 'Features included in the plan',
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiProperty({ 
    description: 'Status of the plan',
    enum: PlanStatus,
    default: PlanStatus.ACTIVE,
    required: false
  })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;

  @ApiProperty({ description: 'Whether the plan is active', default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Stripe price ID', required: false })
  @IsOptional()
  @IsString()
  stripePriceId?: string;

  @ApiProperty({ description: 'Stripe product ID', required: false })
  @IsOptional()
  @IsString()
  stripeProductId?: string;
}
