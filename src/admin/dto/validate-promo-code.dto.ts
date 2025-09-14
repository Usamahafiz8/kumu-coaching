import { IsString, IsNumber, Min } from 'class-validator';

export class ValidatePromoCodeDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  orderAmount: number;
}

export class PromoCodeValidationResponseDto {
  isValid: boolean;
  discountAmount: number;
  finalAmount: number;
  promoCode?: {
    id: string;
    code: string;
    type: string;
    value: number;
    maxDiscount?: number;
    description?: string;
  };
  error?: string;
}
