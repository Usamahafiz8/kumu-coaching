import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmailTemplateType, EmailTemplateStatus } from '../../entities/email-template.entity';

export class CreateEmailTemplateDto {
  @ApiProperty({
    description: 'Template name',
    example: 'Welcome Email',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Template type',
    enum: EmailTemplateType,
    example: EmailTemplateType.WELCOME,
  })
  @IsEnum(EmailTemplateType)
  type: EmailTemplateType;

  @ApiProperty({
    description: 'Email subject',
    example: 'Welcome to Kumu Coaching!',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'HTML content of the email',
    example: '<h1>Welcome {{firstName}}!</h1><p>Thank you for joining us.</p>',
  })
  @IsString()
  htmlContent: string;

  @ApiProperty({
    description: 'Plain text content of the email',
    example: 'Welcome {{firstName}}! Thank you for joining us.',
    required: false,
  })
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiProperty({
    description: 'Available template variables',
    example: ['firstName', 'lastName', 'email'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @ApiProperty({
    description: 'Template status',
    enum: EmailTemplateStatus,
    example: EmailTemplateStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(EmailTemplateStatus)
  status?: EmailTemplateStatus;

  @ApiProperty({
    description: 'Template description',
    example: 'Welcome email sent to new users',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateEmailTemplateDto {
  @ApiProperty({
    description: 'Template name',
    example: 'Welcome Email',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Email subject',
    example: 'Welcome to Kumu Coaching!',
    required: false,
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({
    description: 'HTML content of the email',
    example: '<h1>Welcome {{firstName}}!</h1><p>Thank you for joining us.</p>',
    required: false,
  })
  @IsOptional()
  @IsString()
  htmlContent?: string;

  @ApiProperty({
    description: 'Plain text content of the email',
    example: 'Welcome {{firstName}}! Thank you for joining us.',
    required: false,
  })
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiProperty({
    description: 'Available template variables',
    example: ['firstName', 'lastName', 'email'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @ApiProperty({
    description: 'Template status',
    enum: EmailTemplateStatus,
    example: EmailTemplateStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(EmailTemplateStatus)
  status?: EmailTemplateStatus;

  @ApiProperty({
    description: 'Template description',
    example: 'Welcome email sent to new users',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class EmailTemplateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: EmailTemplateType;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  htmlContent: string;

  @ApiProperty()
  textContent?: string;

  @ApiProperty()
  variables: string[];

  @ApiProperty()
  status: EmailTemplateStatus;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
