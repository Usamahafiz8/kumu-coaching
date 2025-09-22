import { Controller, Post, Get, Put, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { InfluencersService } from './influencers.service';
import { InfluencerRegisterDto, InfluencerLoginDto, InfluencerUpdateDto, WithdrawalRequestDto, WithdrawalActionDto } from '../dto/influencer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/admin-auth.guard';

@Controller('influencer')
export class InfluencersController {
  constructor(private readonly influencersService: InfluencersService) {}

  @Post('register')
  async register(@Body() registerDto: InfluencerRegisterDto) {
    return await this.influencersService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: InfluencerLoginDto) {
    return await this.influencersService.login(loginDto.email, loginDto.password);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return await this.influencersService.getProfile(req.user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() updateDto: InfluencerUpdateDto) {
    return await this.influencersService.updateProfile(req.user.id, updateDto);
  }

  @Get('commissions')
  @UseGuards(JwtAuthGuard)
  async getCommissions(@Request() req) {
    return await this.influencersService.getCommissions(req.user.id);
  }

  @Get('withdrawals')
  @UseGuards(JwtAuthGuard)
  async getWithdrawals(@Request() req) {
    return await this.influencersService.getWithdrawals(req.user.id);
  }

  @Post('withdrawals')
  @UseGuards(JwtAuthGuard)
  async requestWithdrawal(@Request() req, @Body() withdrawalDto: WithdrawalRequestDto) {
    return await this.influencersService.requestWithdrawal(req.user.id, withdrawalDto);
  }

  @Get('promo-codes')
  @UseGuards(JwtAuthGuard)
  async getPromoCodes(@Request() req) {
    return await this.influencersService.getInfluencerPromoCodes(req.user.id);
  }
}

@Controller('admin/influencers')
@UseGuards(AdminAuthGuard)
export class AdminInfluencersController {
  constructor(private readonly influencersService: InfluencersService) {}

  @Get()
  async getAllInfluencers() {
    return await this.influencersService.getAllInfluencers();
  }

  @Get('pending')
  async getPendingInfluencers() {
    return await this.influencersService.getPendingInfluencers();
  }

  @Put(':id/status')
  async updateInfluencerStatus(@Param('id') id: string, @Body() statusDto: { status: 'pending' | 'approved' | 'rejected' }) {
    return await this.influencersService.updateInfluencerStatus(id, statusDto.status);
  }
}

@Controller('admin/withdrawals')
@UseGuards(AdminAuthGuard)
export class AdminWithdrawalsController {
  constructor(private readonly influencersService: InfluencersService) {}

  @Get()
  async getAllWithdrawals() {
    return await this.influencersService.getAllWithdrawals();
  }

  @Post(':id/approve')
  async approveWithdrawal(@Param('id') id: string) {
    return await this.influencersService.approveWithdrawal(id);
  }

  @Post(':id/reject')
  async rejectWithdrawal(@Param('id') id: string, @Body() actionDto: WithdrawalActionDto) {
    return await this.influencersService.rejectWithdrawal(id, actionDto.reason);
  }

  @Post(':id/process')
  async processWithdrawal(@Param('id') id: string) {
    return await this.influencersService.processWithdrawal(id);
  }

}
