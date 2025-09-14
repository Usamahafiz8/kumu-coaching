import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InfluencerService } from './influencer.service';
import { CreateInfluencerDto } from '../admin/dto/create-influencer.dto';
import { UpdateInfluencerDto } from '../admin/dto/update-influencer.dto';
import { CreatePromoCodeDto } from '../admin/dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from '../admin/dto/update-promo-code.dto';
import { ValidatePromoCodeDto } from '../admin/dto/validate-promo-code.dto';
import { CreateWithdrawalRequestDto } from '../admin/dto/withdrawal-request.dto';
import { CommissionStatus } from '../entities/commission.entity';

@Controller('influencer')
@UseGuards(JwtAuthGuard)
export class InfluencerController {
  constructor(private readonly influencerService: InfluencerService) {}

  // Admin endpoints
  @Post()
  async createInfluencer(@Body() createInfluencerDto: CreateInfluencerDto) {
    return this.influencerService.createInfluencer(createInfluencerDto);
  }

  @Get()
  async getAllInfluencers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.influencerService.getAllInfluencers(parseInt(page), parseInt(limit));
  }

  @Get(':id')
  async getInfluencerById(@Param('id') id: string) {
    return this.influencerService.getInfluencerById(id);
  }

  @Put(':id')
  async updateInfluencer(
    @Param('id') id: string,
    @Body() updateInfluencerDto: UpdateInfluencerDto,
  ) {
    return this.influencerService.updateInfluencer(id, updateInfluencerDto);
  }

  @Delete(':id')
  async deleteInfluencer(@Param('id') id: string) {
    await this.influencerService.deleteInfluencer(id);
    return { message: 'Influencer deleted successfully' };
  }

  // Promo code endpoints
  @Post('promo-codes')
  async createPromoCode(@Body() createPromoCodeDto: CreatePromoCodeDto) {
    return this.influencerService.createPromoCode(createPromoCodeDto);
  }

  @Get('promo-codes/:influencerId')
  async getPromoCodesByInfluencer(@Param('influencerId') influencerId: string) {
    return this.influencerService.getPromoCodesByInfluencer(influencerId);
  }

  @Put('promo-codes/:id')
  async updatePromoCode(
    @Param('id') id: string,
    @Body() updatePromoCodeDto: UpdatePromoCodeDto,
  ) {
    return this.influencerService.updatePromoCode(id, updatePromoCodeDto);
  }

  @Delete('promo-codes/:id')
  async deletePromoCode(@Param('id') id: string) {
    await this.influencerService.deletePromoCode(id);
    return { message: 'Promo code deleted successfully' };
  }


  // Commission endpoints
  @Get('commissions/all')
  async getAllCommissions(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.influencerService.getAllCommissions(parseInt(page), parseInt(limit));
  }

  @Get('commissions/:influencerId')
  async getCommissionsByInfluencer(
    @Param('influencerId') influencerId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.influencerService.getCommissionsByInfluencer(
      influencerId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Put('commissions/:id/status')
  async updateCommissionStatus(
    @Param('id') id: string,
    @Body() body: { status: CommissionStatus; notes?: string },
  ) {
    return this.influencerService.updateCommissionStatus(id, body.status, body.notes);
  }

  // Influencer dashboard endpoints
  @Get('dashboard/:influencerId')
  async getInfluencerDashboard(@Param('influencerId') influencerId: string) {
    return this.influencerService.getInfluencerStats(influencerId);
  }

  @Get('my-dashboard')
  async getMyDashboard(@Request() req) {
    const influencer = await this.influencerService.getInfluencerByUserId(req.user.id);
    return this.influencerService.getInfluencerStats(influencer.id);
  }

  @Get('my-profile')
  async getMyProfile(@Request() req) {
    return this.influencerService.getInfluencerByUserId(req.user.id);
  }

  @Get('my/promo-codes')
  async getMyPromoCodes(@Request() req) {
    const influencer = await this.influencerService.getInfluencerByUserId(req.user.id);
    return this.influencerService.getPromoCodesByInfluencer(influencer.id);
  }

  @Get('my/commissions')
  async getMyCommissions(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const influencer = await this.influencerService.getInfluencerByUserId(req.user.id);
    return this.influencerService.getCommissionsByInfluencer(
      influencer.id,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Post('my/withdrawal')
  async createWithdrawalRequest(
    @Request() req,
    @Body() createWithdrawalRequestDto: CreateWithdrawalRequestDto,
  ) {
    const influencer = await this.influencerService.getInfluencerByUserId(req.user.id);
    return this.influencerService.createWithdrawalRequest(influencer.id, createWithdrawalRequestDto);
  }
}
