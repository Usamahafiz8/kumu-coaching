import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { InfluencerStatus } from '../../entities/influencer.entity';

export class CreateInfluencerDto {
  @IsString()
  userId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  commissionRate?: number;

  @IsEnum(InfluencerStatus)
  @IsOptional()
  status?: InfluencerStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
