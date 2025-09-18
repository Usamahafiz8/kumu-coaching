import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  TRIALING = 'trialing'
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  productId: string;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.INACTIVE
  })
  status: SubscriptionStatus;

  @Column({ nullable: true })
  currentPeriodStart: Date;

  @Column({ nullable: true })
  currentPeriodEnd: Date;

  @Column({ nullable: true })
  cancelAtPeriodEnd: boolean;

  @Column({ nullable: true })
  canceledAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.subscriptions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Product, product => product.subscriptions)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
