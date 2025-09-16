import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationCodesController } from './verification-codes.controller';
import { VerificationCodesService } from './verification-codes.service';
import { VerificationCode } from '../entities/verification-code.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationCode, User]),
  ],
  controllers: [VerificationCodesController],
  providers: [VerificationCodesService],
  exports: [VerificationCodesService],
})
export class VerificationCodesModule {}
