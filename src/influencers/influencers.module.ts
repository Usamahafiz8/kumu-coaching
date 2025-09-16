import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfluencersService } from './influencers.service';
import { InfluencersController } from './influencers.controller';
import { Influencer } from '../entities/influencer.entity';
import { User } from '../entities/user.entity';
import { Commission } from '../entities/commission.entity';
import { PurchaseRecord } from '../entities/purchase-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Influencer, User, Commission, PurchaseRecord]),
  ],
  controllers: [InfluencersController],
  providers: [InfluencersService],
  exports: [InfluencersService],
})
export class InfluencersModule {}

