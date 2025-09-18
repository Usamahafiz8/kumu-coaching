import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get()
  async getUserSubscriptions(@Request() req) {
    return this.subscriptionsService.getUserSubscriptions(req.user.id);
  }

  @Get('status')
  async getSubscriptionStatus(@Request() req) {
    return this.subscriptionsService.getSubscriptionStatus(req.user.id);
  }

  @Post(':id/cancel')
  async cancelSubscription(@Request() req, @Param('id') id: string) {
    return this.subscriptionsService.cancelSubscription(req.user.id, id);
  }
}
