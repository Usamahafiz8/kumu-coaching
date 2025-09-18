import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @ApiOperation({ summary: 'Get user subscriptions' })
  @ApiResponse({ status: 200, description: 'User subscriptions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  @Get()
  async getUserSubscriptions(@Request() req) {
    return this.subscriptionsService.getUserSubscriptions(req.user.id);
  }

  @ApiOperation({ summary: 'Get subscription status' })
  @ApiResponse({ status: 200, description: 'Subscription status retrieved successfully', schema: { properties: { hasActiveSubscription: { type: 'boolean' }, subscriptions: { type: 'array' } } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  @Get('status')
  async getSubscriptionStatus(@Request() req) {
    return this.subscriptionsService.getSubscriptionStatus(req.user.id);
  }

  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription canceled successfully', schema: { properties: { message: { type: 'string', example: 'Subscription will be canceled at the end of the current period' } } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'Subscription ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Post(':id/cancel')
  async cancelSubscription(@Request() req, @Param('id') id: string) {
    return this.subscriptionsService.cancelSubscription(req.user.id, id);
  }
}
