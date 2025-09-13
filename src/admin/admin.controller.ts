import {
  Controller,
  Get,
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

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
}
