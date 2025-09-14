import { IsString, IsOptional, IsBoolean, IsNumber, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailConfigDto {
  @ApiProperty({
    description: 'SMTP Host',
    example: 'smtp.gmail.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  host?: string;

  @ApiProperty({
    description: 'SMTP Port',
    example: '587',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  port?: number;

  @ApiProperty({
    description: 'SMTP Username',
    example: 'your-email@gmail.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  user?: string;

  @ApiProperty({
    description: 'SMTP Password',
    example: 'your-app-password',
    required: false,
  })
  @IsOptional()
  @IsString()
  pass?: string;

  @ApiProperty({
    description: 'Use secure connection',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  secure?: boolean;

  @ApiProperty({
    description: 'From Email Address',
    example: 'noreply@yourdomain.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  fromEmail?: string;

  @ApiProperty({
    description: 'From Name',
    example: 'Kumu Coaching',
    required: false,
  })
  @IsOptional()
  @IsString()
  fromName?: string;

  @ApiProperty({
    description: 'Reply To Email',
    example: 'support@yourdomain.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  replyTo?: string;

  @ApiProperty({
    description: 'Enable Email Service',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class EmailConfigResponseDto {
  @ApiProperty()
  host: string;

  @ApiProperty()
  port: string;

  @ApiProperty()
  user: string;

  @ApiProperty()
  pass: string;

  @ApiProperty()
  secure: string;

  @ApiProperty()
  fromEmail: string;

  @ApiProperty()
  fromName: string;

  @ApiProperty()
  replyTo: string;

  @ApiProperty()
  enabled: boolean;

  @ApiProperty()
  isConfigured: boolean;
}

export class TestEmailDto {
  @ApiProperty({
    description: 'Email address to send test email to',
    example: 'test@example.com',
  })
  @IsEmail()
  to: string;
}
