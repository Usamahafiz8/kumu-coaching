import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Influencer } from './influencer.entity';

@Entity('withdrawal_requests')
export class WithdrawalRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  influencerId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected' | 'paid';

  @Column()
  bankAccount: string;

  @Column()
  routingNumber: string;

  @Column()
  bankName: string;

  @Column()
  accountHolderName: string;

  @Column()
  accountType: string;

  @CreateDateColumn()
  requestedAt: Date;

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  stripeTransferId: string;

  @ManyToOne(() => Influencer, influencer => influencer.withdrawalRequests)
  @JoinColumn({ name: 'influencerId' })
  influencer: Influencer;
}
