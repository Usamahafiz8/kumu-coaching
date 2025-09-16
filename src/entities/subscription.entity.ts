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

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PENDING = 'pending',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid', { nullable: true })
  planId: string;

  @Column({ type: 'varchar', length: 50 })
  stripeSubscriptionId: string;

  @Column({ type: 'varchar', length: 50 })
  stripeCustomerId: string;

  @Column({ type: 'varchar', length: 50 })
  stripePriceId: string;

  @Column({ type: 'varchar', length: 50 })
  stripeProductId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: SubscriptionStatus.PENDING,
  })
  status: SubscriptionStatus;

  @Column({ type: 'datetime' })
  currentPeriodStart: Date;

  @Column({ type: 'datetime' })
  currentPeriodEnd: Date;

  @Column({ type: 'datetime', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'datetime', nullable: true })
  endedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.subscriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => SubscriptionPlan, { nullable: true })
  @JoinColumn({ name: 'planId' })
  plan: SubscriptionPlan;
}
