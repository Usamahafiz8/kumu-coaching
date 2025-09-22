import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Commission } from './commission.entity';
import { WithdrawalRequest } from './withdrawal-request.entity';

@Entity('influencers')
export class Influencer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  socialHandle: string;

  @Column({ nullable: true })
  bankAccount: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  accountHolderName: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';

  @Column({ default: 0 })
  totalEarnings: number;

  @Column({ default: 0 })
  pendingEarnings: number;

  @Column({ default: 0 })
  paidEarnings: number;

  @Column({ default: 0 })
  totalCommissions: number;

  @Column({ default: 0 })
  activeCommissions: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Commission, commission => commission.influencer)
  commissions: Commission[];

  @OneToMany(() => WithdrawalRequest, withdrawal => withdrawal.influencer)
  withdrawalRequests: WithdrawalRequest[];
}
