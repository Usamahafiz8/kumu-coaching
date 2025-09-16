import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { EmailTemplate } from '../entities/email-template.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([EmailTemplate]),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
