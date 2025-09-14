import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from './config.service';
import { AppConfig } from '../entities/app-config.entity';
import { EmailConfig } from '../entities/email-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppConfig, EmailConfig])],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
