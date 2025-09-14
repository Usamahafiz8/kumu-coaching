import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Influencer } from './influencer.entity';
import { Subscription } from './subscription.entity';

export enum PromoCodeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

export enum PromoCodeType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}

@Entity('promo_codes')
export class PromoCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column('uuid')
  influencerId: string;

  @Column({
    type: 'varchar',
    default: PromoCodeType.PERCENTAGE,
  })
  type: PromoCodeType;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  value: number; // Percentage or fixed amount

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscount: number; // Maximum discount amount

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minOrderAmount: number; // Minimum order amount to use this code

  @Column({ type: 'int', default: 0 })
  usageLimit: number; // 0 means unlimited

  @Column({ type: 'int', default: 0 })
  usedCount: number;

  @Column({
    type: 'varchar',
    default: PromoCodeStatus.ACTIVE,
  })
  status: PromoCodeStatus;

  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Influencer, (influencer) => influencer.promoCodes)
  @JoinColumn({ name: 'influencerId' })
  influencer: Influencer;

  @OneToMany(() => Subscription, (subscription) => subscription.promoCode)
  subscriptions: Subscription[];

  get isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  get isActive(): boolean {
    return (
      this.status === PromoCodeStatus.ACTIVE &&
      !this.isExpired &&
      (this.usageLimit === 0 || this.usedCount < this.usageLimit)
    );
  }

  get remainingUses(): number {
    return this.usageLimit === 0 ? -1 : Math.max(0, this.usageLimit - this.usedCount);
  }
}
