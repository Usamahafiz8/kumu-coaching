import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule,
    SubscriptionsModule,
    PromoCodesModule,
  ],
  controllers: [AdminController],
  providers: [],
  exports: [],
})
export class AdminModule {}
