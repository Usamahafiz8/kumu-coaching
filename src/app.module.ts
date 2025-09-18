import { Module, BadRequestException } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { AdminModule } from './admin/admin.module';
import { PromoCodesModule } from './promo-codes/promo-codes.module';
import { StripeModule } from './stripe/stripe.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { SubscriptionPlansModule } from './subscription-plans/subscription-plans.module';
import { InfluencersModule } from './influencers/influencers.module';
import { User } from './entities/user.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { PromoCode } from './entities/promo-code.entity';
import { AppConfig } from './entities/app-config.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { PurchaseRecord } from './entities/purchase-record.entity';
import { VerificationCode } from './entities/verification-code.entity';
import { Influencer } from './entities/influencer.entity';
import { Commission } from './entities/commission.entity';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters/http-exception.filter';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('database')!,
      inject: [ConfigService],
    }),
          TypeOrmModule.forFeature([User, PasswordReset, PromoCode, AppConfig, EmailTemplate, Subscription, SubscriptionPlan, PurchaseRecord, VerificationCode, Influencer, Commission]),
    AuthModule,
    ProfileModule,
    AdminModule,
    PromoCodesModule,
    StripeModule,
    SubscriptionsModule,
    SubscriptionPlansModule,
    InfluencersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        disableErrorMessages: false,
        validationError: {
          target: false,
          value: false,
        },
        exceptionFactory: (errors) => {
          const result = errors.map((error) => ({
            property: error.property,
            value: error.value,
            constraints: error.constraints,
          }));
          return new BadRequestException({
            message: 'Validation failed',
            errors: result,
          });
        },
      }),
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
