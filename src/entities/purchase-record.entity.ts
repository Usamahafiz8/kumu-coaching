import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { PromoCode } from './promo-code.entity';
import { Influencer } from './influencer.entity';

export enum PurchaseStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('purchase_records')
export class PurchaseRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  planId: string;

  @Column('uuid', { nullable: true })
  promoCodeId: string;

  @Column({ type: 'varchar', length: 100 })
  stripeSessionId: string;

  @Column({ type: 'varchar', length: 100 })
  stripeCustomerId: string;

  @Column({ type: 'varchar', length: 100 })
  stripePriceId: string;

  @Column({ type: 'varchar', length: 100 })
  stripeProductId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  finalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountAmount: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: PurchaseStatus.PENDING,
  })
  status: PurchaseStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  stripeSubscriptionId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  stripePaymentIntentId: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  commissionAmount: number; // Commission amount for influencer

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  commissionRate: number; // Commission rate used

  @Column('uuid', { nullable: true })
  influencerId: string; // Influencer who gets commission

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => SubscriptionPlan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'planId' })
  plan: SubscriptionPlan;

  @ManyToOne(() => PromoCode, { nullable: true })
  @JoinColumn({ name: 'promoCodeId' })
  promoCode: PromoCode;

  @ManyToOne(() => Influencer, { nullable: true })
  @JoinColumn({ name: 'influencerId' })
  influencer: Influencer;
}
