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
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('influencers')
export class Influencer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  userId: string; // Reference to User entity

  @Column({ type: 'varchar', length: 100, nullable: true })
  socialMediaHandle: string; // Instagram, TikTok, YouTube handle

  @Column({ type: 'varchar', length: 50, nullable: true })
  platform: string; // Instagram, TikTok, YouTube, etc.

  @Column({ type: 'int', nullable: true })
  followerCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.0 })
  commissionRate: number; // Default 10% commission

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalEarnings: number; // Total earnings from commissions

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pendingEarnings: number; // Earnings not yet paid out

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidEarnings: number; // Earnings already paid out

  @Column({
    type: 'varchar',
    length: 20,
    default: InfluencerStatus.PENDING,
  })
  status: InfluencerStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  stripeAccountId: string; // For payouts

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImageUrl: string;

  @Column({ type: 'text', nullable: true })
  notes: string; // Admin notes

  @Column({ type: 'datetime', nullable: true })
  approvedAt: Date;

  @Column('uuid', { nullable: true })
  approvedBy: string; // Admin user ID who approved

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => PromoCode, (promoCode) => promoCode.influencer)
  promoCodes: PromoCode[];

  @OneToMany(() => Commission, (commission) => commission.influencer)
  commissions: Commission[];

  // Computed properties
  get isActive(): boolean {
    return this.status === InfluencerStatus.ACTIVE;
  }

  get totalReferrals(): number {
    return this.commissions?.length || 0;
  }

  get successfulReferrals(): number {
    return this.commissions?.filter(c => c.status === 'approved' || c.status === 'paid').length || 0;
  }

  get conversionRate(): number {
    if (this.totalReferrals === 0) return 0;
    return (this.successfulReferrals / this.totalReferrals) * 100;
  }
}
