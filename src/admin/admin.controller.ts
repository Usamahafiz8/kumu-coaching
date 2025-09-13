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

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly stripeService: StripeService,
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

  // Stripe Management Endpoints
  @Get('stripe/config')
  @ApiOperation({ summary: 'Get Stripe configuration (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Stripe configuration retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getStripeConfig(@Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin role required.');
    }

    const publishableKey = await this.stripeService.getPublishableKey();
    const mode = await this.stripeService.getMode();
    
    return new ApiResponseDto(true, 'Stripe configuration retrieved', {
      publishableKey,
      mode,
      currency: 'usd', // You can make this configurable
    });
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
}
