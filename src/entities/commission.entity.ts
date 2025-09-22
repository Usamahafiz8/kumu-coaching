import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Influencer } from './influencer.entity';
import { PromoCode } from './promo-code.entity';

@Entity('commissions')
export class Commission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  influencerId: string;

  @Column()
  promoCodeId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'paid';

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  paidAt: Date;

  @ManyToOne(() => Influencer, influencer => influencer.commissions)
  @JoinColumn({ name: 'influencerId' })
  influencer: Influencer;

  @ManyToOne(() => PromoCode)
  @JoinColumn({ name: 'promoCodeId' })
  promoCode: PromoCode;
}
