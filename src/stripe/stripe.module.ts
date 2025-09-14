import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import stripeConfig from '../config/stripe.config';
import { ConfigModule as AppConfigModule } from '../config/config.module';

@Module({
  imports: [
    ConfigModule.forFeature(stripeConfig),
    AppConfigModule,
  ],
  providers: [StripeService],
  controllers: [StripeController],
  exports: [StripeService],
})
export class StripeModule {}
