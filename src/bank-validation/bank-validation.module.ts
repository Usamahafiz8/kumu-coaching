import { Module } from '@nestjs/common';
import { BankValidationService } from './bank-validation.service';

@Module({
  providers: [BankValidationService],
  exports: [BankValidationService]
})
export class BankValidationModule {}
