import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsUrl, Min, Max } from 'class-validator';
import { InfluencerStatus } from '../../entities/influencer.entity';

export class UpdateInfluencerDto {
  @ApiProperty({
    description: 'Social media handle',
    example: '@johndoe',
    required: false,
  })
  @IsString()
  @IsOptional()
  socialMediaHandle?: string;

  @ApiProperty({
    description: 'Social media platform',
    example: 'Instagram',
    required: false,
  })
  @IsString()
  @IsOptional()
  platform?: string;

  @ApiProperty({
    description: 'Follower count',
    example: 10000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  followerCount?: number;

  @ApiProperty({
    description: 'Commission rate percentage',
    example: 15.0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  commissionRate?: number;

  @ApiProperty({
    description: 'Influencer status',
    enum: InfluencerStatus,
    example: InfluencerStatus.ACTIVE,
    required: false,
  })
  @IsEnum(InfluencerStatus)
  @IsOptional()
  status?: InfluencerStatus;

  @ApiProperty({
    description: 'Stripe account ID for payouts',
    example: 'acct_1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  stripeAccountId?: string;

  @ApiProperty({
    description: 'Influencer bio',
    example: 'Fitness enthusiast and lifestyle coach',
    required: false,
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    description: 'Website URL',
    example: 'https://johndoe.com',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  profileImageUrl?: string;

  @ApiProperty({
    description: 'Admin notes',
    example: 'High engagement rate, good fit for fitness niche',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
