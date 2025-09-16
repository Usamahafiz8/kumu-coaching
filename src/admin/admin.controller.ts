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
import { ConfigService } from '../config/config.service';
import { EmailService } from '../email/email.service';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto, EmailTemplateResponseDto } from './dto/email-template.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.adminService.getUsers(page, limit);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Put('users/:id/status')
  @ApiOperation({ summary: 'Update user status' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateUserStatus(id, status);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats() {
    return this.adminService.getStats();
  }


  @Get('email-templates')
  @ApiOperation({ summary: 'Get all email templates' })
  @ApiResponse({ status: 200, description: 'Email templates retrieved successfully' })
  async getEmailTemplates() {
    return this.adminService.getEmailTemplates();
  }

  @Get('email-templates/:id')
  @ApiOperation({ summary: 'Get email template by ID' })
  @ApiResponse({ status: 200, description: 'Email template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Email template not found' })
  async getEmailTemplate(@Param('id') id: string) {
    return this.adminService.getEmailTemplate(id);
  }

  @Post('email-templates')
  @ApiOperation({ summary: 'Create new email template' })
  @ApiResponse({ status: 201, description: 'Email template created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid template data' })
  async createEmailTemplate(@Body() createTemplateDto: CreateEmailTemplateDto) {
    return this.adminService.createEmailTemplate(createTemplateDto);
  }

  @Put('email-templates/:id')
  @ApiOperation({ summary: 'Update email template' })
  @ApiResponse({ status: 200, description: 'Email template updated successfully' })
  @ApiResponse({ status: 404, description: 'Email template not found' })
  async updateEmailTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateEmailTemplateDto,
  ) {
    return this.adminService.updateEmailTemplate(id, updateTemplateDto);
  }

  @Delete('email-templates/:id')
  @ApiOperation({ summary: 'Delete email template' })
  @ApiResponse({ status: 200, description: 'Email template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Email template not found' })
  async deleteEmailTemplate(@Param('id') id: string) {
    return this.adminService.deleteEmailTemplate(id);
  }

  // App Configuration Management
  @Get('app-configs')
  @ApiOperation({ summary: 'Get all app configurations' })
  @ApiResponse({ status: 200, description: 'App configurations retrieved successfully' })
  async getAppConfigs() {
    return this.adminService.getAppConfigs();
  }

  @Post('app-configs')
  @ApiOperation({ summary: 'Create new app configuration' })
  @ApiResponse({ status: 201, description: 'App configuration created successfully' })
  async createAppConfig(@Body() configData: any) {
    return this.adminService.createAppConfig(configData);
  }

  @Put('app-configs/:id')
  @ApiOperation({ summary: 'Update app configuration' })
  @ApiResponse({ status: 200, description: 'App configuration updated successfully' })
  async updateAppConfig(@Param('id') id: string, @Body() configData: any) {
    return this.adminService.updateAppConfig(id, configData);
  }

  @Delete('app-configs/:id')
  @ApiOperation({ summary: 'Delete app configuration' })
  @ApiResponse({ status: 200, description: 'App configuration deleted successfully' })
  async deleteAppConfig(@Param('id') id: string) {
    return this.adminService.deleteAppConfig(id);
  }

  // Purchase Records Management
  @Get('purchase-records')
  @ApiOperation({ summary: 'Get all purchase records' })
  @ApiResponse({ status: 200, description: 'Purchase records retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getPurchaseRecords(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.adminService.getPurchaseRecords(page, limit);
  }

  @Get('purchase-records/:id')
  @ApiOperation({ summary: 'Get purchase record by ID' })
  @ApiResponse({ status: 200, description: 'Purchase record retrieved successfully' })
  async getPurchaseRecord(@Param('id') id: string) {
    return this.adminService.getPurchaseRecord(id);
  }

  // Subscription Plans Management (Admin)
  @Get('subscription-plans')
  @ApiOperation({ summary: 'Get all subscription plans (Admin)' })
  @ApiResponse({ status: 200, description: 'Subscription plans retrieved successfully' })
  async getAllSubscriptionPlans() {
    return this.adminService.getAllSubscriptionPlans();
  }

  @Post('subscription-plans')
  @ApiOperation({ summary: 'Create new subscription plan' })
  @ApiResponse({ status: 201, description: 'Subscription plan created successfully' })
  async createSubscriptionPlan(@Body() planData: any) {
    return this.adminService.createSubscriptionPlan(planData);
  }

  @Put('subscription-plans/:id')
  @ApiOperation({ summary: 'Update subscription plan' })
  @ApiResponse({ status: 200, description: 'Subscription plan updated successfully' })
  async updateSubscriptionPlan(@Param('id') id: string, @Body() planData: any) {
    return this.adminService.updateSubscriptionPlan(id, planData);
  }

  @Delete('subscription-plans/:id')
  @ApiOperation({ summary: 'Delete subscription plan' })
  @ApiResponse({ status: 200, description: 'Subscription plan deleted successfully' })
  async deleteSubscriptionPlan(@Param('id') id: string) {
    return this.adminService.deleteSubscriptionPlan(id);
  }

  // Influencer Management Endpoints
  @Get('influencers')
  @ApiOperation({ summary: 'Get all influencers with pagination' })
  @ApiResponse({ status: 200, description: 'Influencers retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getInfluencers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.adminService.getInfluencers(page, limit);
  }

  @Get('influencers/:id')
  @ApiOperation({ summary: 'Get influencer by ID' })
  @ApiResponse({ status: 200, description: 'Influencer retrieved successfully' })
  async getInfluencerById(@Param('id') id: string) {
    return this.adminService.getInfluencerById(id);
  }

  @Get('influencers/stats')
  @ApiOperation({ summary: 'Get influencer statistics' })
  @ApiResponse({ status: 200, description: 'Influencer stats retrieved successfully' })
  async getInfluencerStats() {
    return this.adminService.getInfluencerStats();
  }

  @Get('commissions')
  @ApiOperation({ summary: 'Get all commissions with pagination' })
  @ApiResponse({ status: 200, description: 'Commissions retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getCommissions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.adminService.getCommissions(page, limit);
  }

  @Put('commissions/:id/status')
  @ApiOperation({ summary: 'Update commission status' })
  @ApiResponse({ status: 200, description: 'Commission status updated successfully' })
  async updateCommissionStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateCommissionStatus(id, status);
  }
}