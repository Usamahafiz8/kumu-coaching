import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PromoCode } from './promo-code.entity';
import { Commission } from './commission.entity';

export enum InfluencerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('influencers')
export class Influencer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  userId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.0 })
  commissionRate: number; // Commission percentage (e.g., 10.0 for 10%)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalEarnings: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  availableBalance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalWithdrawn: number;

  @Column({
    type: 'varchar',
    default: InfluencerStatus.ACTIVE,
  })
  status: InfluencerStatus;

  @Column({ nullable: true })
  stripeAccountId: string; // For payouts

  @Column({ nullable: true })
  bankAccountId: string; // For bank transfers

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: 0 })
  totalReferrals: number;

  @Column({ default: 0 })
  successfulReferrals: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.influencer)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => PromoCode, (promoCode) => promoCode.influencer)
  promoCodes: PromoCode[];

  @OneToMany(() => Commission, (commission) => commission.influencer)
  commissions: Commission[];

  get conversionRate(): number {
    if (this.totalReferrals === 0) return 0;
    return (this.successfulReferrals / this.totalReferrals) * 100;
  }

  get averageCommission(): number {
    if (this.successfulReferrals === 0) return 0;
    return this.totalEarnings / this.successfulReferrals;
  }
}
