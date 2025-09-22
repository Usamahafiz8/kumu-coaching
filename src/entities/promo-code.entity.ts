import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PromoCodeType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount'
}

export enum PromoCodeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired'
}

@Entity('promo_codes')
export class PromoCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PromoCodeType,
    default: PromoCodeType.PERCENTAGE
  })
  type: PromoCodeType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number; // Percentage (0-100) or fixed amount

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumAmount: number; // Minimum order amount to use this code

  @Column({ type: 'int', nullable: true })
  maxUses: number; // Maximum number of times this code can be used

  @Column({ type: 'int', default: 0 })
  usedCount: number; // Number of times this code has been used

  @Column({ type: 'date', nullable: true })
  validFrom: Date;

  @Column({ type: 'date', nullable: true })
  validUntil: Date;

  @Column({
    type: 'enum',
    enum: PromoCodeStatus,
    default: PromoCodeStatus.ACTIVE
  })
  status: PromoCodeStatus;

  @Column({ type: 'varchar', nullable: true })
  influencerId: string; // ID of the influencer who owns this code

  @Column({ type: 'varchar', nullable: true })
  influencerName: string; // Name of the influencer who owns this code

  @Column({ type: 'varchar', nullable: true })
  influencerEmail: string; // Email of the influencer

  @Column({ type: 'varchar', nullable: true })
  influencerSocialHandle: string; // Social media handle

  @Column({ type: 'text', nullable: true })
  influencerNotes: string; // Additional notes about the influencer

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10 })
  commissionPercentage: number; // Commission percentage for the influencer

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalCommissions: number; // Total commissions earned from this code

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
