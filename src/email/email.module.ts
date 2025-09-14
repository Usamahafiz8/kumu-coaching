import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { EmailConfig } from '../entities/email-config.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailConfig, EmailTemplate]),
    ConfigModule,
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
