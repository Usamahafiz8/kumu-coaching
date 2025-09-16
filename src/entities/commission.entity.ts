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
import { PurchaseRecord } from './purchase-record.entity';

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
  purchaseRecordId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number; // Commission amount earned

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  rate: number; // Commission rate used (percentage)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  originalAmount: number; // Original purchase amount

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: CommissionStatus.PENDING,
  })
  status: CommissionStatus;

  @Column({ type: 'datetime', nullable: true })
  paidAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  stripePayoutId: string; // Stripe payout ID when paid

  @Column({ type: 'text', nullable: true })
  notes: string; // Admin notes

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Influencer, (influencer) => influencer.commissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'influencerId' })
  influencer: Influencer;

  @ManyToOne(() => PurchaseRecord, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchaseRecordId' })
  purchaseRecord: PurchaseRecord;

  // Computed properties
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

