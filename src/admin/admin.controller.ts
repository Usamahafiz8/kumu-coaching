import { Controller, Post, Body, UseGuards, Request, Get, Put, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { AdminLoginDto, AdminSignUpDto, AdminProfileDto } from '../dto/admin.dto';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { PromoCodesService } from '../promo-codes/promo-codes.service';

@ApiTags('Admin Authentication')
@Controller('admin')
export class AdminController {
  constructor(
    private authService: AuthService,
    private subscriptionsService: SubscriptionsService,
    private promoCodesService: PromoCodesService,
  ) {}

  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Admin successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Access denied - Admin privileges required' })
  @ApiBody({ type: AdminLoginDto })
  @Post('login')
  async adminLogin(@Body() adminLoginDto: AdminLoginDto) {
    return this.authService.adminLogin(adminLoginDto);
  }

  @ApiOperation({ summary: 'Create admin account' })
  @ApiResponse({ status: 201, description: 'Admin account successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiBody({ type: AdminSignUpDto })
  @Post('signup')
  async adminSignUp(@Body() adminSignUpDto: AdminSignUpDto) {
    return this.authService.adminSignUp(adminSignUpDto);
  }

  @ApiOperation({ summary: 'Get admin profile' })
  @ApiResponse({ status: 200, description: 'Admin profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied - Admin privileges required' })
  @ApiBearerAuth('JWT-auth')
  @Get('profile')
  @UseGuards(AdminAuthGuard)
  async getAdminProfile(@Request() req): Promise<AdminProfileDto> {
    const { password, ...adminProfile } = req.user;
    return adminProfile;
  }

  @ApiOperation({ summary: 'Update admin profile' })
  @ApiResponse({ status: 200, description: 'Admin profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied - Admin privileges required' })
  @ApiBearerAuth('JWT-auth')
  @Put('profile')
  @UseGuards(AdminAuthGuard)
  async updateAdminProfile(@Request() req, @Body() updateData: Partial<AdminProfileDto>) {
    return this.authService.updateAdminProfile(req.user.id, updateData);
  }

  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users list retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied - Admin privileges required' })
  @ApiBearerAuth('JWT-auth')
  @Get('users')
  @UseGuards(AdminAuthGuard)
  async getAllUsers(@Request() req) {
    return this.authService.getAllUsers();
  }

  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User details retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied - Admin privileges required' })
  @ApiBearerAuth('JWT-auth')
  @Get('users/:id')
  @UseGuards(AdminAuthGuard)
  async getUserById(@Request() req, @Param('id') userId: string) {
    return this.authService.getUserById(userId);
  }

  @ApiOperation({ summary: 'Get subscription statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Subscription statistics retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied - Admin privileges required' })
  @ApiBearerAuth('JWT-auth')
  @Get('subscriptions/stats')
  @UseGuards(AdminAuthGuard)
  async getSubscriptionStatistics(@Request() req) {
    return this.subscriptionsService.getSubscriptionStatistics();
  }

  @ApiOperation({ summary: 'Get all subscriptions (Admin only)' })
  @ApiResponse({ status: 200, description: 'All subscriptions retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied - Admin privileges required' })
  @ApiBearerAuth('JWT-auth')
  @Get('subscriptions')
  @UseGuards(AdminAuthGuard)
  async getAllSubscriptions(@Request() req) {
    return this.subscriptionsService.getAllSubscriptions();
  }

  @ApiOperation({ summary: 'Get promo code statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Promo code statistics retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied - Admin privileges required' })
  @ApiBearerAuth('JWT-auth')
  @Get('promo-codes/stats')
  @UseGuards(AdminAuthGuard)
  async getPromoCodeStatistics(@Request() req) {
    return this.promoCodesService.getPromoCodeStatistics();
  }
}
