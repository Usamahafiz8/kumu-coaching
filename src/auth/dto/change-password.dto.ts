import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'CurrentPassword123!',
  })
  @IsString()
  @MinLength(1, { message: 'Current password is required' })
  currentPassword: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewSecurePassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password must not exceed 100 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  newPassword: string;
}
