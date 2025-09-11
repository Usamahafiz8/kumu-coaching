import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelSubscriptionDto {
  @ApiProperty({
    description: 'Reason for cancellation',
    example: 'No longer needed',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Cancellation reason must not exceed 500 characters' })
  reason?: string;
}
