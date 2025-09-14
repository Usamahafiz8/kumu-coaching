import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Influencer } from './influencer.entity';
import { Subscription } from './subscription.entity';

export enum CommissionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Entity('commissions')
export class Commission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  influencerId: string;

  @Column('uuid')
  subscriptionId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subscriptionAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  commissionRate: number; // Percentage at time of purchase

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commissionAmount: number;

  @Column({
    type: 'varchar',
    default: CommissionStatus.PENDING,
  })
  status: CommissionStatus;

  @Column({ nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  payoutId: string; // Stripe payout ID

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Influencer, (influencer) => influencer.commissions)
  @JoinColumn({ name: 'influencerId' })
  influencer: Influencer;

  @ManyToOne(() => Subscription, (subscription) => subscription.commission)
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription;

  get isPaid(): boolean {
    return this.status === CommissionStatus.PAID;
  }

  get isPending(): boolean {
    return this.status === CommissionStatus.PENDING;
  }

  get isApproved(): boolean {
    return this.status === CommissionStatus.APPROVED;
  }
}
