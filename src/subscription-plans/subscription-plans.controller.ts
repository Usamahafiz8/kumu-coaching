import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubscriptionPlansService } from './subscription-plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Subscription Plans')
@Controller('subscription-plans')
export class SubscriptionPlansController {
  constructor(private readonly subscriptionPlansService: SubscriptionPlansService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active subscription plans' })
  @ApiResponse({
    status: 200,
    description: 'Subscription plans retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Subscription plans retrieved successfully' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string', example: 'Premium Plan' },
              description: { type: 'string', example: 'Access to all features' },
              price: { type: 'number', example: 29.99 },
              currency: { type: 'string', example: 'USD' },
              interval: { type: 'string', example: 'monthly' },
              features: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  })
  async getActivePlans() {
    const plans = await this.subscriptionPlansService.getActivePlans();
    return new ApiResponseDto(true, 'Subscription plans retrieved successfully', plans);
  }

}
