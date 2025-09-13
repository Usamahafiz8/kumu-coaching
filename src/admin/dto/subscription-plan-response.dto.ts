import { ApiProperty } from '@nestjs/swagger';
import { PlanType, PlanStatus } from '../../entities/subscription-plan.entity';

export class SubscriptionPlanResponseDto {
  @ApiProperty({ description: 'Unique identifier of the subscription plan' })
  id: string;

  @ApiProperty({ description: 'Name of the subscription plan' })
  name: string;

  @ApiProperty({ description: 'Description of the subscription plan', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Price of the subscription plan' })
  price: number;

  @ApiProperty({ 
    description: 'Type of the subscription plan',
    enum: PlanType
  })
  type: PlanType;

  @ApiProperty({ description: 'Duration in months' })
  durationInMonths: number;

  @ApiProperty({ 
    description: 'Features included in the plan',
    type: [String],
    nullable: true
  })
  features: string[] | null;

  @ApiProperty({ 
    description: 'Status of the plan',
    enum: PlanStatus
  })
  status: PlanStatus;

  @ApiProperty({ description: 'Whether the plan is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Stripe price ID', nullable: true })
  stripePriceId: string | null;

  @ApiProperty({ description: 'Stripe product ID', nullable: true })
  stripeProductId: string | null;

  @ApiProperty({ description: 'Date when the plan was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the plan was last updated' })
  updatedAt: Date;

  @ApiProperty({ description: 'Number of active subscriptions for this plan' })
  subscriptionCount?: number;
}
