import { PartialType } from '@nestjs/mapped-types';
import { CreateInfluencerDto } from './create-influencer.dto';
import { IsNumber, IsOptional, Min, Max, IsString } from 'class-validator';

export class UpdateInfluencerDto extends PartialType(CreateInfluencerDto) {
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  commissionRate?: number;

  @IsString()
  @IsOptional()
  stripeAccountId?: string;

  @IsString()
  @IsOptional()
  bankAccountId?: string;
}
