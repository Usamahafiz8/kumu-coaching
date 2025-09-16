import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { PasswordReset } from './password-reset.entity';
import { VerificationCode } from './verification-code.entity';
import { Subscription } from './subscription.entity';

export enum UserRole {
  ADMIN = 'admin',
  PLAYER = 'player',
  INFLUENCER = 'influencer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({
    type: 'varchar',
    default: UserRole.PLAYER,
  })
  role: UserRole;

  @Column({
    type: 'varchar',
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  @OneToMany(() => PasswordReset, (passwordReset) => passwordReset.user)
  passwordResets: PasswordReset[];

  @OneToMany(() => VerificationCode, (verificationCode) => verificationCode.user)
  verificationCodes: VerificationCode[];

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions: Subscription[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
