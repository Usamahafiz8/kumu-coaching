import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreateWithdrawalRequestDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class WithdrawalRequestResponseDto {
  id: string;
  influencerId: string;
  amount: number;
  status: string;
  requestedAt: Date;
  processedAt?: Date;
  payoutId?: string;
  notes?: string;
  influencer: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}
