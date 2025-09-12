import { ApiProperty } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty({
    description: 'Payment intent ID',
    example: 'pi_1234567890',
  })
  paymentIntentId: string;

  @ApiProperty({
    description: 'Client secret for payment confirmation',
    example: 'pi_1234567890_secret_abc123',
  })
  clientSecret: string;

  @ApiProperty({
    description: 'Stripe publishable key',
    example: 'pk_test_1234567890',
  })
  publishableKey: string;

  @ApiProperty({
    description: 'Payment amount in cents',
    example: 2999,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'usd',
  })
  currency: string;

  @ApiProperty({
    description: 'Payment status',
    example: 'requires_payment_method',
  })
  status: string;
}
