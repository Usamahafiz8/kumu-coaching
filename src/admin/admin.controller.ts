import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../entities/user.entity';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { SubscriptionPlanResponseDto } from './dto/subscription-plan-response.dto';
import { StripeService } from '../stripe/stripe.service';
import { InfluencerService } from '../influencer/influencer.service';
import { ConfigService } from '../config/config.service';
import { StripeConfigDto, StripeConfigResponseDto } from './dto/stripe-config.dto';
import { EmailService } from '../email/email.service';
import { EmailConfigDto, EmailConfigResponseDto, TestEmailDto } from './dto/email-config.dto';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto, EmailTemplateResponseDto } from './dto/email-template.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly stripeService: StripeService,
    private readonly influencerService: InfluencerService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAllUsers(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    return this.adminService.getAllUsers(page, limit);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getUserById(@Request() req, @Param('id') userId: string) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    return this.adminService.getUserById(userId);
  }

  @Get('users/:id/subscriptions')
  @ApiOperation({ summary: 'Get user subscriptions (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User subscriptions retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getUserSubscriptions(@Request() req, @Param('id') userId: string) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    return this.adminService.getUserSubscriptions(userId);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'Get all subscriptions (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAllSubscriptions(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    return this.adminService.getAllSubscriptions(page, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get subscription statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getSubscriptionStats(@Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    return this.adminService.getSubscriptionStats();
  }

  @Put('users/:id/status')
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async updateUserStatus(
    @Request() req,
    @Param('id') userId: string,
    @Body('status') status: string,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    const user = await this.adminService.updateUserStatus(userId, status);
    return new ApiResponseDto(true, 'User status updated successfully', user);
  }

  @Put('users/:id/role')
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async updateUserRole(
    @Request() req,
    @Param('id') userId: string,
    @Body('role') role: string,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    const user = await this.adminService.updateUserRole(userId, role);
    return new ApiResponseDto(true, 'User role updated successfully', user);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async deleteUser(@Request() req, @Param('id') userId: string) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    await this.adminService.deleteUser(userId);
    return new ApiResponseDto(true, 'User deleted successfully');
  }

  // Subscription Plan Management Endpoints
  @Get('subscription-plans')
  @ApiOperation({ summary: 'Get all subscription plans (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Subscription plans retrieved successfully',
    type: [SubscriptionPlanResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAllSubscriptionPlans(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    return this.adminService.getAllSubscriptionPlans(page, limit);
  }

  @Get('subscription-plans/stats')
  @ApiOperation({ summary: 'Get subscription plan statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Subscription plan statistics retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getSubscriptionPlanStats(@Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    return this.adminService.getSubscriptionPlanStats();
  }

  @Get('subscription-plans/:id')
  @ApiOperation({ summary: 'Get subscription plan by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Subscription plan retrieved successfully',
    type: SubscriptionPlanResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription plan not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getSubscriptionPlanById(@Request() req, @Param('id') planId: string) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    return this.adminService.getSubscriptionPlanById(planId);
  }

  @Post('subscription-plans')
  @ApiOperation({ summary: 'Create new subscription plan (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Subscription plan created successfully',
    type: SubscriptionPlanResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or plan name already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async createSubscriptionPlan(
    @Request() req,
    @Body() createPlanDto: CreateSubscriptionPlanDto,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    const plan = await this.adminService.createSubscriptionPlan(createPlanDto);
    return new ApiResponseDto(true, 'Subscription plan created successfully', plan);
  }

  @Put('subscription-plans/:id')
  @ApiOperation({ summary: 'Update subscription plan (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Subscription plan updated successfully',
    type: SubscriptionPlanResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or cannot deactivate plan with active subscriptions',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription plan not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async updateSubscriptionPlan(
    @Request() req,
    @Param('id') planId: string,
    @Body() updatePlanDto: UpdateSubscriptionPlanDto,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    const plan = await this.adminService.updateSubscriptionPlan(planId, updatePlanDto);
    return new ApiResponseDto(true, 'Subscription plan updated successfully', plan);
  }

  @Delete('subscription-plans/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete subscription plan (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Subscription plan deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot delete plan with associated subscriptions',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription plan not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async deleteSubscriptionPlan(@Request() req, @Param('id') planId: string) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    await this.adminService.deleteSubscriptionPlan(planId);
    return new ApiResponseDto(true, 'Subscription plan deleted successfully');
  }

  // Stripe Configuration Management Endpoints
  @Get('stripe/config')
  @ApiOperation({ summary: 'Get Stripe configuration (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Stripe configuration retrieved successfully',
    type: StripeConfigResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getStripeConfig(@Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    const config = await this.configService.getStripeConfig();
    const isConfigured = !!(config.secretKey && config.publishableKey);
    
    return new ApiResponseDto(true, 'Stripe configuration retrieved', {
      ...config,
      isConfigured,
    });
  }

  @Put('stripe/config')
  @ApiOperation({ summary: 'Update Stripe configuration (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Stripe configuration updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid configuration data',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async updateStripeConfig(@Request() req, @Body() stripeConfigDto: StripeConfigDto) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    await this.configService.setStripeConfig(stripeConfigDto);
    
    return new ApiResponseDto(true, 'Stripe configuration updated successfully');
  }

  @Post('stripe/test-connection')
  @ApiOperation({ summary: 'Test Stripe connection (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Stripe connection test successful',
  })
  @ApiResponse({
    status: 400,
    description: 'Stripe connection test failed',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async testStripeConnection(@Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    try {
      // Test connection by retrieving account info
      const account = await this.stripeService.getAccount();
      return new ApiResponseDto(true, 'Stripe connection successful', {
        accountId: account.id,
        country: account.country,
        currency: account.default_currency,
      });
    } catch (error) {
      throw new Error('Stripe connection test failed: ' + error.message);
    }
  }

  // Influencer Management Endpoints
  @Post('influencers')
  @ApiOperation({ summary: 'Create a new influencer (Admin only)' })
  @ApiResponse({ status: 201, description: 'Influencer created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async createInfluencer(@Request() req, @Body() createInfluencerDto: any) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    const influencer = await this.influencerService.createInfluencer(createInfluencerDto);
    return new ApiResponseDto(true, 'Influencer created successfully', influencer);
  }

  @Get('influencers')
  @ApiOperation({ summary: 'Get all influencers (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Influencers retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllInfluencers(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    return this.influencerService.getAllInfluencers(parseInt(page), parseInt(limit));
  }

  @Get('influencers/:id')
  @ApiOperation({ summary: 'Get influencer by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Influencer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Influencer not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getInfluencerById(@Request() req, @Param('id') id: string) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    return this.influencerService.getInfluencerById(id);
  }

  @Put('influencers/:id')
  @ApiOperation({ summary: 'Update influencer (Admin only)' })
  @ApiResponse({ status: 200, description: 'Influencer updated successfully' })
  @ApiResponse({ status: 404, description: 'Influencer not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async updateInfluencer(
    @Request() req,
    @Param('id') id: string,
    @Body() updateInfluencerDto: any,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    const influencer = await this.influencerService.updateInfluencer(id, updateInfluencerDto);
    return new ApiResponseDto(true, 'Influencer updated successfully', influencer);
  }

  @Delete('influencers/:id')
  @ApiOperation({ summary: 'Delete influencer (Admin only)' })
  @ApiResponse({ status: 200, description: 'Influencer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Influencer not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async deleteInfluencer(@Request() req, @Param('id') id: string) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    await this.influencerService.deleteInfluencer(id);
    return new ApiResponseDto(true, 'Influencer deleted successfully');
  }

  @Get('influencers/:id/stats')
  @ApiOperation({ summary: 'Get influencer statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Influencer statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Influencer not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getInfluencerStats(@Request() req, @Param('id') id: string) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    return this.influencerService.getInfluencerStats(id);
  }

  @Get('commissions')
  @ApiOperation({ summary: 'Get all commissions (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Commissions retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllCommissions(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    return this.influencerService.getAllCommissions(parseInt(page), parseInt(limit));
  }

  @Put('commissions/:id/status')
  @ApiOperation({ summary: 'Update commission status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Commission status updated successfully' })
  @ApiResponse({ status: 404, description: 'Commission not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async updateCommissionStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    const commission = await this.influencerService.updateCommissionStatus(id, body.status as any, body.notes);
    return new ApiResponseDto(true, 'Commission status updated successfully', commission);
  }

  // Email Configuration Management Endpoints
  @Get('email/config')
  @ApiOperation({ summary: 'Get email configuration (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Email configuration retrieved successfully',
    type: EmailConfigResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getEmailConfig(@Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    const config = await this.emailService.getEmailConfigForAdmin();
    const isConfigured = !!(config.host && config.port && config.user && config.pass);
    
    return new ApiResponseDto(true, 'Email configuration retrieved', {
      ...config,
      isConfigured,
    });
  }

  @Put('email/config')
  @ApiOperation({ summary: 'Update email configuration (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Email configuration updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid configuration data',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async updateEmailConfig(@Request() req, @Body() emailConfigDto: EmailConfigDto) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    // Convert port to string if it's a number
    const configData = {
      ...emailConfigDto,
      port: emailConfigDto.port?.toString(),
    };
    await this.emailService.setEmailConfig(configData);
    
    return new ApiResponseDto(true, 'Email configuration updated successfully');
  }

  @Post('email/test-connection')
  @ApiOperation({ summary: 'Test email connection (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Email connection test result',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async testEmailConnection(@Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    const result = await this.emailService.testEmailConnection();
    return new ApiResponseDto(result.success, result.message);
  }

  @Post('email/send-test')
  @ApiOperation({ summary: 'Send test email (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Test email sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email address',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async sendTestEmail(@Request() req, @Body() testEmailDto: TestEmailDto) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    const result = await this.emailService.sendTestEmail(testEmailDto.to);
    return new ApiResponseDto(result.success, result.message);
  }

  // Email Template Management Endpoints
  @Get('email/templates')
  @ApiOperation({ summary: 'Get all email templates (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Email templates retrieved successfully',
    type: [EmailTemplateResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAllEmailTemplates(@Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    const templates = await this.emailService.getAllTemplates();
    return new ApiResponseDto(true, 'Email templates retrieved successfully', templates);
  }

  @Get('email/templates/:id')
  @ApiOperation({ summary: 'Get email template by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Email template retrieved successfully',
    type: EmailTemplateResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Email template not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getEmailTemplateById(@Request() req, @Param('id') id: string) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    const template = await this.emailService.getTemplate(id);
    if (!template) {
      throw new Error('Email template not found');
    }

    return new ApiResponseDto(true, 'Email template retrieved successfully', template);
  }

  @Post('email/templates')
  @ApiOperation({ summary: 'Create email template (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Email template created successfully',
    type: EmailTemplateResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid template data',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async createEmailTemplate(@Request() req, @Body() createTemplateDto: CreateEmailTemplateDto) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    const template = await this.emailService.createTemplate(createTemplateDto);
    return new ApiResponseDto(true, 'Email template created successfully', template);
  }

  @Put('email/templates/:id')
  @ApiOperation({ summary: 'Update email template (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Email template updated successfully',
    type: EmailTemplateResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid template data',
  })
  @ApiResponse({
    status: 404,
    description: 'Email template not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async updateEmailTemplate(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateEmailTemplateDto,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    const template = await this.emailService.updateTemplate(id, updateTemplateDto);
    return new ApiResponseDto(true, 'Email template updated successfully', template);
  }

  @Delete('email/templates/:id')
  @ApiOperation({ summary: 'Delete email template (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Email template deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Email template not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async deleteEmailTemplate(@Request() req, @Param('id') id: string) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    await this.emailService.deleteTemplate(id);
    return new ApiResponseDto(true, 'Email template deleted successfully');
  }
}
