import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Subscription } from './subscription.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  currency: string;

  @Column({ nullable: true })
  stripePriceId: string;

  @Column({ nullable: true })
  stripeProductId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSubscription: boolean;

  @Column({ nullable: true })
  billingInterval: string; // 'month', 'year', etc.

  @Column({ nullable: true })
  trialPeriodDays: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Subscription, subscription => subscription.product)
  subscriptions: Subscription[];
}
