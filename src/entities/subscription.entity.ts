import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { PromoCode } from './promo-code.entity';
import { Commission } from './commission.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
  FAILED = 'failed',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  planId: string;

  @Column({
    type: 'varchar',
    default: SubscriptionStatus.PENDING,
  })
  status: SubscriptionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string | null;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @Column('uuid', { nullable: true })
  promoCodeId: string;

  @Column({ nullable: true })
  stripePaymentIntentId: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.subscriptions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => PromoCode, (promoCode) => promoCode.subscriptions)
  @JoinColumn({ name: 'promoCodeId' })
  promoCode: PromoCode;

  @OneToOne(() => Commission, (commission) => commission.subscription)
  commission: Commission;

  @ManyToOne(() => SubscriptionPlan, (plan) => plan.subscriptions)
  @JoinColumn({ name: 'planId' })
  plan: SubscriptionPlan;

  get isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE && new Date() <= this.endDate;
  }

  get isExpired(): boolean {
    return new Date() > this.endDate;
  }
}
