import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum VerificationCodeStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  EXPIRED = 'expired',
}

@Entity('verification_codes')
@Index(['code', 'type'], { unique: true })
@Index(['userId', 'type', 'status'])
export class VerificationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ length: 6 })
  code: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'email_verification',
  })
  type: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: VerificationCodeStatus.PENDING,
  })
  status: VerificationCodeStatus;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @Column({ type: 'datetime', nullable: true })
  verifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.verificationCodes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}