import { IsEmail, IsString, IsOptional, IsPhoneNumber } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isEmailVerified: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
