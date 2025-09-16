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

export enum PromoCodeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

export enum PromoCodeType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed',
}

@Entity('promo_codes')
export class PromoCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column('uuid', { nullable: true })
  createdBy: string; // Admin user ID who created this promo code

  @Column('uuid', { nullable: true })
  influencerId: string; // Influencer ID if this promo code is for an influencer

  @Column({
    type: 'varchar',
    default: PromoCodeType.PERCENTAGE,
  })
  type: PromoCodeType;

  // Add alias properties for compatibility
  get discountType(): PromoCodeType {
    return this.type;
  }

  get discountValue(): number {
    return this.value;
  }

  @Column({ type: 'varchar', length: 100, nullable: true })
  stripeCouponId: string;

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

  @Column({ type: 'varchar', length: 100, nullable: true })
  campaignName: string; // Name of the campaign or reward program

  @Column({ type: 'text', nullable: true })
  notes: string; // Admin notes about this promo code

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


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

  // Relations
  @ManyToOne(() => Influencer, (influencer) => influencer.promoCodes, { nullable: true })
  @JoinColumn({ name: 'influencerId' })
  influencer: Influencer;
}
