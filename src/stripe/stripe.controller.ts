import { Controller, Post, Body, UseGuards, Request, Headers, Req } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(@Request() req, @Body() body: { productId: string }) {
    return this.stripeService.createCheckoutSession(body.productId, req.user.id);
  }

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
