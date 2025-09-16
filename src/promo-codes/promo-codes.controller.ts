import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { PromoCodesService } from './promo-codes.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Promo Codes')
@Controller('promo-codes')
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new promo code (Admin only)' })
  @ApiBody({ type: CreatePromoCodeDto })
  @ApiResponse({
    status: 201,
    description: 'Promo code created successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Promo code already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin access required',
  })
  async createPromoCode(
    @Request() req,
    @Body() createPromoCodeDto: CreatePromoCodeDto,
  ) {
    const promoCode = await this.promoCodesService.createPromoCode(
      createPromoCodeDto,
      req.user.id,
    );
    return new ApiResponseDto(true, 'Promo code created successfully', promoCode);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all promo codes (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Promo codes retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin access required',
  })
  async getAllPromoCodes() {
    const promoCodes = await this.promoCodesService.getAllPromoCodes();
    return new ApiResponseDto(true, 'Promo codes retrieved successfully', promoCodes);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get promo code by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Promo code retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Promo code not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin access required',
  })
  async getPromoCodeById(@Param('id') id: string) {
    const promoCode = await this.promoCodesService.getPromoCodeById(id);
    return new ApiResponseDto(true, 'Promo code retrieved successfully', promoCode);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update promo code (Admin only)' })
  @ApiBody({ type: UpdatePromoCodeDto })
  @ApiResponse({
    status: 200,
    description: 'Promo code updated successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Promo code not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Promo code already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin access required',
  })
  async updatePromoCode(
    @Param('id') id: string,
    @Body() updatePromoCodeDto: UpdatePromoCodeDto,
  ) {
    const promoCode = await this.promoCodesService.updatePromoCode(id, updatePromoCodeDto);
    return new ApiResponseDto(true, 'Promo code updated successfully', promoCode);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete promo code (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Promo code deleted successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Promo code not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin access required',
  })
  async deletePromoCode(@Param('id') id: string) {
    await this.promoCodesService.deletePromoCode(id);
    return new ApiResponseDto(true, 'Promo code deleted successfully');
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get promo code usage statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Promo code statistics retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Promo code not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin access required',
  })
  async getPromoCodeStats(@Param('id') id: string) {
    const stats = await this.promoCodesService.getPromoCodeStats(id);
    return new ApiResponseDto(true, 'Promo code statistics retrieved successfully', stats);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate a promo code (Public endpoint)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'WELCOME20' },
        orderAmount: { type: 'number', example: 20 },
      },
      required: ['code'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Promo code validation result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Promo code is valid' },
        data: {
          type: 'object',
          properties: {
            valid: { type: 'boolean', example: true },
            discountAmount: { type: 'number', example: 4 },
            promoCode: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid promo code',
  })
  async validatePromoCode(
    @Body() body: { code: string; orderAmount?: number },
  ) {
    const { code, orderAmount = 0 } = body;
    const result = await this.promoCodesService.validatePromoCode(code, orderAmount);
    
    if (result.valid && result.promoCode) {
      return new ApiResponseDto(true, result.message || 'Promo code is valid', {
        valid: result.valid,
        discountAmount: result.discountAmount,
        promoCode: {
          id: result.promoCode.id,
          code: result.promoCode.code,
          type: result.promoCode.type,
          value: result.promoCode.value,
          description: result.promoCode.description,
        },
      });
    } else {
      return new ApiResponseDto(false, result.message || 'Invalid promo code', {
        valid: false,
        discountAmount: 0,
      });
    }
  }
}
