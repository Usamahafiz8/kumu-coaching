import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ConfigKey {
  STRIPE_SECRET_KEY = 'stripe_secret_key',
  STRIPE_PUBLISHABLE_KEY = 'stripe_publishable_key',
  STRIPE_WEBHOOK_SECRET = 'stripe_webhook_secret',
  STRIPE_CURRENCY = 'stripe_currency',
  STRIPE_MODE = 'stripe_mode',
  STRIPE_ACCOUNT_ID = 'stripe_account_id',
}

@Entity('app_configs')
export class AppConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: ConfigKey;

  @Column({ type: 'text' })
  value: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isEncrypted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
