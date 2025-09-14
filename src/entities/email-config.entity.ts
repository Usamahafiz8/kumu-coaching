import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EmailConfigKey {
  SMTP_HOST = 'smtp_host',
  SMTP_PORT = 'smtp_port',
  SMTP_USER = 'smtp_user',
  SMTP_PASS = 'smtp_pass',
  SMTP_SECURE = 'smtp_secure',
  FROM_EMAIL = 'from_email',
  FROM_NAME = 'from_name',
  REPLY_TO = 'reply_to',
  EMAIL_ENABLED = 'email_enabled',
}

@Entity('email_configs')
export class EmailConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: EmailConfigKey;

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
