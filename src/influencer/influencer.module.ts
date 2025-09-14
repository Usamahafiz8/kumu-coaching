import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfluencerController } from './influencer.controller';
import { InfluencerService } from './influencer.service';
import { Influencer } from '../entities/influencer.entity';
import { PromoCode } from '../entities/promo-code.entity';
import { Commission } from '../entities/commission.entity';
import { User } from '../entities/user.entity';
import { Subscription } from '../entities/subscription.entity';
import { StripeModule } from '../stripe/stripe.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Influencer, PromoCode, Commission, User, Subscription]),
    forwardRef(() => StripeModule),
  ],
  controllers: [InfluencerController],
  providers: [InfluencerService],
  exports: [InfluencerService],
})
export class InfluencerModule {}
