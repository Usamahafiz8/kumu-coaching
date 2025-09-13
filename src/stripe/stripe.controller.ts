import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  RawBody,
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
} from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../entities/user.entity';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get Stripe configuration for frontend' })
  @ApiResponse({
    status: 200,
    description: 'Stripe configuration retrieved successfully',
  })
  async getStripeConfig() {
    const publishableKey = await this.stripeService.getPublishableKey();
    const mode = await this.stripeService.getMode();
    
    return new ApiResponseDto(true, 'Stripe configuration retrieved', {
      publishableKey,
      mode,
    });
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  async handleWebhook(
    @RawBody() payload: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      const event = await this.stripeService.constructWebhookEvent(payload, signature);
      
      // Handle different event types
      switch (event.type) {
        case 'checkout.session.completed':
          // Handle successful checkout
          console.log('Checkout session completed:', event.data.object);
          break;
        case 'customer.subscription.created':
          // Handle new subscription
          console.log('Subscription created:', event.data.object);
          break;
        case 'customer.subscription.updated':
          // Handle subscription update
          console.log('Subscription updated:', event.data.object);
          break;
        case 'customer.subscription.deleted':
          // Handle subscription cancellation
          console.log('Subscription deleted:', event.data.object);
          break;
        case 'invoice.payment_succeeded':
          // Handle successful payment
          console.log('Payment succeeded:', event.data.object);
          break;
        case 'invoice.payment_failed':
          // Handle failed payment
          console.log('Payment failed:', event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  }
}
