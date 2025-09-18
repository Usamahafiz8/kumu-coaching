import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../entities/user.entity';
import { PasswordReset } from '../entities/password-reset.entity';
import { PasswordResetCode } from '../entities/password-reset-code.entity';
import { EmailModule } from '../email/email.module';
import { VerificationCodesModule } from '../verification-codes/verification-codes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PasswordReset, PasswordResetCode]),
    PassportModule,
    EmailModule,
    VerificationCodesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
