import { Module } from '@nestjs/common';
import { PromoCodesController } from './promo-codes.controller';
import { InfluencerModule } from '../influencer/influencer.module';

@Module({
  imports: [InfluencerModule],
  controllers: [PromoCodesController],
})
export class PromoCodesModule {}
