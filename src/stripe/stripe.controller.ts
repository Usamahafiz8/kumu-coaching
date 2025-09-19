import { Controller, Post, Body, UseGuards, Request, Headers, Req, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @ApiOperation({ summary: 'Create Stripe checkout session' })
  @ApiResponse({ status: 200, description: 'Checkout session created successfully', schema: { properties: { url: { type: 'string', example: 'https://checkout.stripe.com/pay/cs_test_...' } } } })
  @ApiResponse({ status: 400, description: 'Bad request - product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({ schema: { properties: { productId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' } } } })
  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(@Request() req, @Body() body: { productId: string }) {
    return this.stripeService.createCheckoutSession(body.productId, req.user.id);
  }

  @ApiOperation({ summary: 'Handle Stripe checkout success redirect' })
  @ApiResponse({ status: 200, description: 'Subscription activated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid session' })
  @ApiQuery({ name: 'session_id', description: 'Stripe checkout session ID' })
  @Get('success')
  async handleSuccess(@Query('session_id') sessionId: string) {
    return this.stripeService.handleCheckoutSuccess(sessionId);
  }

  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully', schema: { properties: { received: { type: 'boolean', example: true } } } })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  @ApiHeader({ name: 'stripe-signature', description: 'Stripe webhook signature', required: true })
  @Post('webhook')
  async handleWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = await this.stripeService.constructWebhookEvent(req.rawBody, signature);
    await this.stripeService.handleWebhook(event);
    return { received: true };
  }
}
