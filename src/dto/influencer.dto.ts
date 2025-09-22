import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsDecimal, IsNotEmpty, IsIn } from 'class-validator';

export class InfluencerRegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  socialHandle?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  accountHolderName?: string;
}

export class InfluencerLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class InfluencerUpdateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  socialHandle?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  accountHolderName?: string;
}

export class WithdrawalRequestDto {
  @IsDecimal()
  amount: number;

  @IsString()
  @IsNotEmpty()
  routingNumber: string;

  @IsString()
  @IsNotEmpty()
  bankAccount: string;

  @IsString()
  @IsNotEmpty()
  bankName: string;

  @IsString()
  @IsNotEmpty()
  accountHolderName: string;

  @IsString()
  @IsIn(['checking', 'savings'])
  accountType: string;
}

export class WithdrawalActionDto {
  @IsString()
  reason: string;
}

export class InfluencerStatusDto {
  @IsEnum(['pending', 'approved', 'rejected'])
  status: 'pending' | 'approved' | 'rejected';
}
