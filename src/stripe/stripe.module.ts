import { Module, forwardRef } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [forwardRef(() => SubscriptionsModule)],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}