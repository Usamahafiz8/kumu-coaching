import {
  Controller,
  Post,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { SubscriptionsService } from './subscriptions.service';
import { StripeService } from '../common/services/stripe.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly stripeService: StripeService,
  ) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature or payload',
  })
  async handleStripeWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    try {
      // Get the raw body
      const payload = req.rawBody;

      if (!payload) {
        this.logger.error('No payload received');
        throw new Error('No payload received');
      }

      if (!signature) {
        this.logger.error('No signature received');
        throw new Error('No signature received');
      }

      // Verify webhook signature and construct event
      const event = await this.stripeService.constructWebhookEvent(payload, signature);

      this.logger.log(`Received webhook event: ${event.type}`);

      // Handle the event
      await this.subscriptionsService.handleStripeWebhook(event);

      return { received: true };
    } catch (error) {
      this.logger.error('Webhook error:', error);
      throw error;
    }
  }
}
