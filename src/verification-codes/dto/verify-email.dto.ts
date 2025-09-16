import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Verification code sent to email',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString({ message: 'Verification code must be a string' })
  @IsNotEmpty({ message: 'Verification code is required' })
  @Length(6, 6, { message: 'Verification code must be exactly 6 digits' })
  code: string;
}
