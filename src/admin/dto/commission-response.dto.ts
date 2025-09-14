import { CommissionStatus } from '../../entities/commission.entity';

export class CommissionResponseDto {
  id: string;
  influencerId: string;
  subscriptionId: string;
  subscriptionAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: CommissionStatus;
  paidAt?: Date;
  payoutId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  influencer: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  subscription: {
    id: string;
    plan: {
      name: string;
    };
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}
