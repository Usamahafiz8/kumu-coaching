import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from './config.service';
import { AppConfig } from '../entities/app-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppConfig])],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
