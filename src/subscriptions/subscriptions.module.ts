import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from '../entities/subscription.entity';
import { User } from '../entities/user.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { PromoCode } from '../entities/promo-code.entity';
import { PurchaseRecord } from '../entities/purchase-record.entity';
import { Influencer } from '../entities/influencer.entity';
import { Commission } from '../entities/commission.entity';
import { StripeModule } from '../stripe/stripe.module';
import { EmailModule } from '../email/email.module';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, User, SubscriptionPlan, PromoCode, PurchaseRecord, Influencer, Commission]),
    forwardRef(() => StripeModule),
    forwardRef(() => EmailModule),
    forwardRef(() => PromoCodesModule),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}