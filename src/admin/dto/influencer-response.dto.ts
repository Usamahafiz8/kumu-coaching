import { InfluencerStatus } from '../../entities/influencer.entity';

export class InfluencerResponseDto {
  id: string;
  userId: string;
  commissionRate: number;
  totalEarnings: number;
  availableBalance: number;
  totalWithdrawn: number;
  status: InfluencerStatus;
  stripeAccountId?: string;
  bankAccountId?: string;
  notes?: string;
  totalReferrals: number;
  successfulReferrals: number;
  conversionRate: number;
  averageCommission: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  promoCodes: {
    id: string;
    code: string;
    type: string;
    value: number;
    status: string;
    usedCount: number;
    usageLimit: number;
  }[];
}
