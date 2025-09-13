import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCustomerPortalDto {
  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  customerId: string;

  @ApiProperty({ description: 'Return URL after portal session' })
  @IsString()
  returnUrl: string;
}
