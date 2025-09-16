import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../entities/user.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import { AppConfig } from '../entities/app-config.entity';
import { PurchaseRecord } from '../entities/purchase-record.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { Influencer } from '../entities/influencer.entity';
import { Commission } from '../entities/commission.entity';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '../config/config.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EmailTemplate, AppConfig, PurchaseRecord, SubscriptionPlan, Influencer, Commission]),
    AuthModule,
    ConfigModule,
    EmailModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
