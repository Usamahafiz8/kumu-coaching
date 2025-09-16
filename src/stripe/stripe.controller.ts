import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  RawBody,
  HttpCode,
  HttpStatus,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private readonly stripeService: StripeService,
    @Inject(forwardRef(() => SubscriptionsService))
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Get('config')
  @ApiOperation({ summary: 'Get Stripe configuration for frontend' })
  @ApiResponse({
    status: 200,
    description: 'Stripe configuration retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Stripe configuration retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            publishableKey: { type: 'string', example: 'pk_test_...' },
            priceId: { type: 'string', example: 'price_...' },
          },
        },
      },
    },
  })
  async getStripeConfig() {
    const config = this.stripeService.getConfig();
    return {
      success: true,
      message: 'Stripe configuration retrieved successfully',
      data: config,
    };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  async handleWebhook(
    @RawBody() body: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      const event = this.stripeService.constructWebhookEvent(body.toString(), signature);

      this.logger.log(`Received Stripe webhook: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object);
          break;

        case 'customer.subscription.created':
          await this.subscriptionsService.handleSubscriptionCreated(event.data.object);
          break;

        case 'customer.subscription.updated':
          await this.subscriptionsService.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.subscriptionsService.handleSubscriptionUpdated(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Webhook error:', error);
      throw error;
    }
  }

  private async handleCheckoutSessionCompleted(session: any) {
    this.logger.log(`Checkout session completed: ${session.id}`);
    // Additional logic can be added here if needed
  }

  private async handlePaymentSucceeded(invoice: any) {
    this.logger.log(`Payment succeeded for invoice: ${invoice.id}`);
    // Additional logic can be added here if needed
  }

  private async handlePaymentFailed(invoice: any) {
    this.logger.log(`Payment failed for invoice: ${invoice.id}`);
    // Additional logic can be added here if needed
  }
}