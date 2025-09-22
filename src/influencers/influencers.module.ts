import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfluencersService } from './influencers.service';
import { InfluencersController, AdminInfluencersController, AdminWithdrawalsController } from './influencers.controller';
import { Influencer } from '../entities/influencer.entity';
import { Commission } from '../entities/commission.entity';
import { WithdrawalRequest } from '../entities/withdrawal-request.entity';
import { PromoCode } from '../entities/promo-code.entity';
import { BankValidationModule } from '../bank-validation/bank-validation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Influencer, Commission, WithdrawalRequest, PromoCode]),
    BankValidationModule
  ],
  controllers: [InfluencersController, AdminInfluencersController, AdminWithdrawalsController],
  providers: [InfluencersService],
  exports: [InfluencersService]
})
export class InfluencersModule {}
