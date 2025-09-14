import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../entities/user.entity';
import { Subscription } from '../entities/subscription.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { AuthModule } from '../auth/auth.module';
import { StripeModule } from '../stripe/stripe.module';
import { InfluencerModule } from '../influencer/influencer.module';
import { ConfigModule } from '../config/config.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Subscription, SubscriptionPlan]),
    AuthModule,
    StripeModule,
    InfluencerModule,
    ConfigModule,
    EmailModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
