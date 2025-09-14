import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AdminModule } from './admin/admin.module';
import { InfluencerModule } from './influencer/influencer.module';
import { PromoCodesModule } from './promo-codes/promo-codes.module';
import { User } from './entities/user.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { Subscription } from './entities/subscription.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { Influencer } from './entities/influencer.entity';
import { PromoCode } from './entities/promo-code.entity';
import { Commission } from './entities/commission.entity';
import { AppConfig } from './entities/app-config.entity';
import { EmailConfig } from './entities/email-config.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters/http-exception.filter';
import databaseConfig from './config/database-sqlite.config';
import jwtConfig from './config/jwt.config';
import stripeConfig from './config/stripe.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, stripeConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('database')!,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, SubscriptionPlan, Subscription, PasswordReset, Influencer, PromoCode, Commission, AppConfig, EmailConfig, EmailTemplate]),
    AuthModule,
    ProfileModule,
    SubscriptionsModule,
    AdminModule,
    InfluencerModule,
    PromoCodesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
