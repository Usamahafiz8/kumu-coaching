import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { ProductsModule } from '../products/products.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { UsersModule } from '../users/users.module';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';
import { Product } from '../entities/product.entity';
import { Subscription } from '../entities/subscription.entity';

@Module({
  imports: [
    ConfigModule, 
    TypeOrmModule.forFeature([Product, Subscription]),
    ProductsModule, 
    SubscriptionsModule,
    UsersModule,
    PromoCodesModule
  ],
  providers: [StripeService],
  controllers: [StripeController],
  exports: [StripeService],
})
export class StripeModule {}
