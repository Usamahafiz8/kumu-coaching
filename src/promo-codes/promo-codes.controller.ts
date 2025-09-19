import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PromoCodesService } from './promo-codes.service';
import type { CreatePromoCodeDto, UpdatePromoCodeDto } from './promo-codes.service';
import { AdminAuthGuard } from '../auth/admin-auth.guard';

@ApiTags('Promo Codes')
@Controller('promo-codes')
export class PromoCodesController {
  constructor(private promoCodesService: PromoCodesService) {}

  @ApiOperation({ summary: 'Create a new promo code' })
  @ApiResponse({ status: 201, description: 'Promo code created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - promo code already exists' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AdminAuthGuard)
  @Post()
  async createPromoCode(@Body() createDto: CreatePromoCodeDto) {
    return this.promoCodesService.createPromoCode(createDto);
  }

  @ApiOperation({ summary: 'Get all promo codes' })
  @ApiResponse({ status: 200, description: 'Promo codes retrieved successfully' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AdminAuthGuard)
  @Get()
  async getAllPromoCodes() {
    return this.promoCodesService.getAllPromoCodes();
  }

  @ApiOperation({ summary: 'Get promo code by ID' })
  @ApiResponse({ status: 200, description: 'Promo code retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Promo code not found' })
  @ApiParam({ name: 'id', description: 'Promo code ID' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AdminAuthGuard)
  @Get(':id')
  async getPromoCodeById(@Param('id') id: string) {
    return this.promoCodesService.getPromoCodeById(id);
  }

  @ApiOperation({ summary: 'Update promo code' })
  @ApiResponse({ status: 200, description: 'Promo code updated successfully' })
  @ApiResponse({ status: 404, description: 'Promo code not found' })
  @ApiParam({ name: 'id', description: 'Promo code ID' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AdminAuthGuard)
  @Put(':id')
  async updatePromoCode(@Param('id') id: string, @Body() updateDto: UpdatePromoCodeDto) {
    return this.promoCodesService.updatePromoCode(id, updateDto);
  }

  @ApiOperation({ summary: 'Delete promo code' })
  @ApiResponse({ status: 200, description: 'Promo code deleted successfully' })
  @ApiResponse({ status: 404, description: 'Promo code not found' })
  @ApiParam({ name: 'id', description: 'Promo code ID' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  async deletePromoCode(@Param('id') id: string) {
    return this.promoCodesService.deletePromoCode(id);
  }

  @ApiOperation({ summary: 'Validate promo code' })
  @ApiResponse({ status: 200, description: 'Promo code validation result' })
  @ApiQuery({ name: 'code', description: 'Promo code to validate' })
  @ApiQuery({ name: 'amount', description: 'Order amount' })
  @Get('validate/:code')
  async validatePromoCode(
    @Param('code') code: string,
    @Query('amount') amount: string
  ) {
    const orderAmount = parseFloat(amount) || 0;
    return this.promoCodesService.validatePromoCode(code, orderAmount);
  }

  @ApiOperation({ summary: 'Use promo code' })
  @ApiResponse({ status: 200, description: 'Promo code used successfully' })
  @ApiResponse({ status: 404, description: 'Promo code not found' })
  @ApiParam({ name: 'code', description: 'Promo code to use' })
  @Post('use/:code')
  async usePromoCode(@Param('code') code: string) {
    return this.promoCodesService.usePromoCode(code);
  }

  @ApiOperation({ summary: 'Get promo code statistics' })
  @ApiResponse({ status: 200, description: 'Promo code statistics retrieved successfully' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AdminAuthGuard)
  @Get('admin/statistics')
  async getPromoCodeStatistics() {
    return this.promoCodesService.getPromoCodeStatistics();
  }
}
