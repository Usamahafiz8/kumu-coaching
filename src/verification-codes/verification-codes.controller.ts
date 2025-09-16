import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { VerificationCodesService } from './verification-codes.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Email Verification')
@Controller('verification-codes')
export class VerificationCodesController {
  constructor(private readonly verificationCodesService: VerificationCodesService) {}

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify user email with verification code' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification code',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<ApiResponseDto> {
    await this.verificationCodesService.verifyEmail(verifyEmailDto);
    return new ApiResponseDto(true, 'Email verified successfully');
  }
}