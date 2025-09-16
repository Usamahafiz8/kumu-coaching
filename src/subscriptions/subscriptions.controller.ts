import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Create Stripe checkout session for subscription',
    description: 'Creates a Stripe checkout session for the specified subscription plan. Success and cancel URLs are configured in environment variables.'
  })
  @ApiBody({ type: CreateCheckoutSessionDto })
  @ApiResponse({
    status: 200,
    description: 'Checkout session created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Checkout session created successfully' },
        data: {
          type: 'object',
          properties: {
            sessionId: { type: 'string', example: 'cs_test_...' },
            url: { type: 'string', example: 'https://checkout.stripe.com/...' },
            purchaseRecordId: { type: 'string', example: 'uuid' },
            plan: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'plan-annual' },
                name: { type: 'string', example: 'Annual Subscription' },
                originalPrice: { type: 'number', example: 20 },
                finalPrice: { type: 'number', example: 20 },
                currency: { type: 'string', example: 'GBP' },
                interval: { type: 'string', example: 'annually' },
                discount: { type: 'object', nullable: true }
              }
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid' },
                email: { type: 'string', example: 'user@example.com' },
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' }
              }
            }
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User already has an active subscription',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription plan not found or inactive',
  })
  async createCheckoutSession(
    @Request() req,
    @Body() body: CreateCheckoutSessionDto,
  ) {
    const { planId, promoCode } = body;
    const result = await this.subscriptionsService.createCheckoutSession(
      req.user.id,
      planId,
      promoCode,
    );

    return new ApiResponseDto(true, 'Checkout session created successfully', result);
  }


  @Get('success')
  @ApiOperation({ summary: 'Handle successful subscription payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment success page',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Payment successful! Your subscription is now active.' },
        data: {
          type: 'object',
          properties: {
            subscriptionId: { type: 'string' },
            status: { type: 'string', example: 'active' },
            redirectUrl: { type: 'string', example: 'http://localhost:3001/dashboard' },
          },
        },
      },
    },
  })
  async paymentSuccess(@Request() req, @Query() query: any) {
    const sessionId = query.session_id as string;
    
    if (!sessionId) {
      return new ApiResponseDto(false, 'Missing session ID', null);
    }

    try {
      // Verify payment with Stripe and complete the subscription
      const result = await this.subscriptionsService.verifyAndCompletePayment(sessionId);
      
      if (result.success) {
        return new ApiResponseDto(true, 'Payment verified and subscription activated!', {
          subscriptionId: result.subscriptionId,
          status: 'active',
          purchaseRecordId: result.purchaseRecordId,
          redirectUrl: 'http://localhost:3001/dashboard',
        });
      } else {
        return new ApiResponseDto(false, result.message, null);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      return new ApiResponseDto(false, 'Failed to verify payment', null);
    }
  }

  @Get('cancel')
  @ApiOperation({ summary: 'Handle cancelled subscription payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment cancelled page',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Payment was cancelled. You can try again anytime.' },
        data: {
          type: 'object',
          properties: {
            redirectUrl: { type: 'string', example: 'http://localhost:3001/subscription' },
          },
        },
      },
    },
  })
  async paymentCancel(@Request() req) {
    // This endpoint handles cancelled payments from Stripe
    return new ApiResponseDto(false, 'Payment was cancelled. You can try again anytime.', {
      redirectUrl: 'http://localhost:3001/subscription',
    });
  }

  @Get('purchase-history')
  @ApiOperation({ summary: 'Get user purchase history' })
  @ApiResponse({
    status: 200,
    description: 'Purchase history retrieved successfully',
    type: ApiResponseDto,
  })
  async getPurchaseHistory(@Request() req) {
    const purchases = await this.subscriptionsService.getUserPurchaseHistory(req.user.id);
    return new ApiResponseDto(true, 'Purchase history retrieved successfully', purchases);
  }

}