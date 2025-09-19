import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@kumu.com', description: 'Admin email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123', description: 'Admin password' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class AdminSignUpDto {
  @ApiProperty({ example: 'admin@kumu.com', description: 'Admin email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123', description: 'Admin password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John', description: 'Admin first name' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Admin last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'admin', description: 'Admin role', required: false })
  @IsOptional()
  @IsString()
  role?: string;
}

export class AdminProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
