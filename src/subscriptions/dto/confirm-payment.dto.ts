import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @ApiProperty({
    description: 'Payment intent ID from Stripe',
    example: 'pi_1234567890',
  })
  @IsString()
  paymentIntentId: string;
}
