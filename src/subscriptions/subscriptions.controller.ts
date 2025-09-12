import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  UseGuards,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { User } from '../entities/user.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { Subscription } from '../entities/subscription.entity';
import { ApiResponseDto, PaginatedResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List all available subscription plans' })
  @ApiResponse({
    status: 200,
    description: 'Subscription plans retrieved successfully',
    type: ApiResponseDto,
  })
  async getSubscriptionPlans(): Promise<ApiResponseDto<SubscriptionPlan[]>> {
    const plans = await this.subscriptionsService.getSubscriptionPlans();
    return new ApiResponseDto(true, 'Subscription plans retrieved successfully', plans);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific subscription plan' })
  @ApiParam({
    name: 'id',
    description: 'Subscription plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription plan retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription plan not found',
  })
  async getSubscriptionPlanById(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<SubscriptionPlan>> {
    const plan = await this.subscriptionsService.getSubscriptionPlanById(id);
    return new ApiResponseDto(true, 'Subscription plan retrieved successfully', plan);
  }

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Purchase/activate a subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription purchased successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription plan not found',
  })
  @ApiResponse({
    status: 409,
    description: 'User already has an active subscription',
  })
  async purchaseSubscription(
    @CurrentUser() user: User,
    @Body() purchaseDto: PurchaseSubscriptionDto,
  ): Promise<ApiResponseDto<Subscription>> {
    const subscription = await this.subscriptionsService.purchaseSubscription(
      user.id,
      purchaseDto,
    );
    return new ApiResponseDto(true, 'Subscription purchased successfully', subscription);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current subscription status' })
  @ApiResponse({
    status: 200,
    description: 'Subscription status retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getSubscriptionStatus(@CurrentUser() user: User): Promise<ApiResponseDto> {
    const status = await this.subscriptionsService.getSubscriptionStatus(user.id);
    return new ApiResponseDto(true, 'Subscription status retrieved successfully', status);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all past subscription purchases/transactions' })
  @ApiResponse({
    status: 200,
    description: 'Subscription history retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getSubscriptionHistory(@CurrentUser() user: User): Promise<ApiResponseDto<Subscription[]>> {
    const history = await this.subscriptionsService.getSubscriptionHistory(user.id);
    return new ApiResponseDto(true, 'Subscription history retrieved successfully', history);
  }

  @Put('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel active subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'No active subscription found',
  })
  async cancelSubscription(
    @CurrentUser() user: User,
    @Body() cancelDto: CancelSubscriptionDto,
  ): Promise<ApiResponseDto<Subscription>> {
    const subscription = await this.subscriptionsService.cancelSubscription(
      user.id,
      cancelDto,
    );
    return new ApiResponseDto(true, 'Subscription cancelled successfully', subscription);
  }
}
