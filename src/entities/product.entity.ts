import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Subscription } from './subscription.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar' })
  currency: string;

  @Column({ type: 'varchar', nullable: true })
  stripePriceId: string;

  @Column({ type: 'varchar', nullable: true })
  stripeProductId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSubscription: boolean;

  @Column({ type: 'varchar', nullable: true })
  billingInterval: string; // 'month', 'year', etc.

  @Column({ type: 'int', nullable: true })
  trialPeriodDays: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Subscription, subscription => subscription.product)
  subscriptions: Subscription[];
}
