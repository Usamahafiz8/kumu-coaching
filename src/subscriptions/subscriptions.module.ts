import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { WebhooksController } from './webhooks.controller';
import { User } from '../entities/user.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { Subscription } from '../entities/subscription.entity';
import { AuthModule } from '../auth/auth.module';
import { StripeService } from '../common/services/stripe.service';
import { EmailService } from '../common/services/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, SubscriptionPlan, Subscription]),
    AuthModule,
  ],
  controllers: [SubscriptionsController, WebhooksController],
  providers: [SubscriptionsService, StripeService, EmailService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
