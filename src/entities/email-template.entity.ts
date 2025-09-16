import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EmailTemplateType {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  SUBSCRIPTION_CONFIRMATION = 'subscription_confirmation',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  INFLUENCER_INVITATION = 'influencer_invitation',
  COMMISSION_EARNED = 'commission_earned',
  PASSWORD_CHANGE_VERIFICATION = 'password_change_verification',
  EMAIL_CHANGE_VERIFICATION = 'email_change_verification',
  PHONE_CHANGE_VERIFICATION = 'phone_change_verification',
  PROFILE_UPDATE_VERIFICATION = 'profile_update_verification',
  ACCOUNT_DELETION_VERIFICATION = 'account_deletion_verification',
  CUSTOM = 'custom',
}

export enum EmailTemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

@Entity('email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'varchar',
  })
  type: EmailTemplateType;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  htmlContent: string;

  @Column({ type: 'text', nullable: true })
  textContent: string;

  @Column({ type: 'json', nullable: true })
  variables: string[]; // Array of available template variables

  @Column({
    type: 'varchar',
    default: EmailTemplateStatus.ACTIVE,
  })
  status: EmailTemplateStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
