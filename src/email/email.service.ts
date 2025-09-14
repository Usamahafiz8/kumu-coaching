import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { EmailConfig, EmailConfigKey } from '../entities/email-config.entity';
import { EmailTemplate, EmailTemplateType, EmailTemplateStatus } from '../entities/email-template.entity';
import { ConfigService } from '../config/config.service';
import { AppConfig } from '../entities/app-config.entity';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: any[];
}

export interface TemplateEmailOptions {
  to: string | string[];
  templateType: EmailTemplateType;
  variables?: Record<string, any>;
  from?: string;
  replyTo?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    @InjectRepository(EmailConfig)
    private emailConfigRepository: Repository<EmailConfig>,
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
    private configService: ConfigService,
  ) {}

  async initializeTransporter(): Promise<void> {
    try {
      const emailConfig = await this.getEmailConfig();
      
      if (!emailConfig.enabled) {
        this.logger.warn('Email service is disabled');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: parseInt(emailConfig.port),
        secure: emailConfig.secure === 'true',
        auth: {
          user: emailConfig.user,
          pass: emailConfig.pass,
        },
      });

      // Verify connection
      if (this.transporter) {
        await this.transporter.verify();
      }
      this.logger.log('Email transporter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize email transporter:', error);
      this.transporter = null;
    }
  }

  private async getEmailConfig(): Promise<{
    host: string;
    port: string;
    user: string;
    pass: string;
    secure: string;
    fromEmail: string;
    fromName: string;
    replyTo: string;
    enabled: boolean;
  }> {
    const [
      host,
      port,
      user,
      pass,
      secure,
      fromEmail,
      fromName,
      replyTo,
      enabled,
    ] = await Promise.all([
      this.configService.getConfig(EmailConfigKey.SMTP_HOST),
      this.configService.getConfig(EmailConfigKey.SMTP_PORT),
      this.configService.getConfig(EmailConfigKey.SMTP_USER),
      this.configService.getConfig(EmailConfigKey.SMTP_PASS),
      this.configService.getConfig(EmailConfigKey.SMTP_SECURE),
      this.configService.getConfig(EmailConfigKey.FROM_EMAIL),
      this.configService.getConfig(EmailConfigKey.FROM_NAME),
      this.configService.getConfig(EmailConfigKey.REPLY_TO),
      this.configService.getConfig(EmailConfigKey.EMAIL_ENABLED),
    ]);

    return {
      host: host || '',
      port: port || '587',
      user: user || '',
      pass: pass || '',
      secure: secure || 'false',
      fromEmail: fromEmail || '',
      fromName: fromName || '',
      replyTo: replyTo || '',
      enabled: enabled === 'true',
    };
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      await this.initializeTransporter();
    }

    if (!this.transporter) {
      this.logger.error('Email transporter not available');
      return false;
    }

    try {
      const emailConfig = await this.getEmailConfig();
      
      const mailOptions = {
        from: options.from || `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo || emailConfig.replyTo,
        attachments: options.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${options.to}: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      return false;
    }
  }

  async sendTemplateEmail(options: TemplateEmailOptions): Promise<boolean> {
    try {
      const template = await this.emailTemplateRepository.findOne({
        where: { type: options.templateType, status: EmailTemplateStatus.ACTIVE },
      });

      if (!template) {
        this.logger.error(`Email template not found for type: ${options.templateType}`);
        return false;
      }

      // Replace template variables
      let subject = template.subject;
      let htmlContent = template.htmlContent;
      let textContent = template.textContent;

      if (options.variables) {
        Object.entries(options.variables).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`;
          subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
          htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), String(value));
          if (textContent) {
            textContent = textContent.replace(new RegExp(placeholder, 'g'), String(value));
          }
        });
      }

      return this.sendEmail({
        to: options.to,
        subject,
        html: htmlContent,
        text: textContent,
        from: options.from,
        replyTo: options.replyTo,
      });
    } catch (error) {
      this.logger.error('Failed to send template email:', error);
      return false;
    }
  }

  async testEmailConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.initializeTransporter();
      
      if (!this.transporter) {
        return { success: false, message: 'Failed to initialize email transporter' };
      }

      await this.transporter.verify();
      return { success: true, message: 'Email connection test successful' };
    } catch (error) {
      return { success: false, message: `Email connection test failed: ${error.message}` };
    }
  }

  async sendTestEmail(to: string): Promise<{ success: boolean; message: string }> {
    try {
      const success = await this.sendEmail({
        to,
        subject: 'Test Email from Kumu Coaching',
        html: `
          <h2>Test Email</h2>
          <p>This is a test email to verify your email configuration.</p>
          <p>If you received this email, your SMTP settings are working correctly!</p>
          <p>Sent at: ${new Date().toISOString()}</p>
        `,
        text: 'This is a test email to verify your email configuration. If you received this email, your SMTP settings are working correctly!',
      });

      if (success) {
        return { success: true, message: 'Test email sent successfully' };
      } else {
        return { success: false, message: 'Failed to send test email' };
      }
    } catch (error) {
      return { success: false, message: `Failed to send test email: ${error.message}` };
    }
  }

  // Template management methods
  async createTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const newTemplate = this.emailTemplateRepository.create(template);
    return this.emailTemplateRepository.save(newTemplate);
  }

  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    await this.emailTemplateRepository.update(id, updates);
    return this.emailTemplateRepository.findOne({ where: { id } });
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.emailTemplateRepository.delete(id);
  }

  async getTemplate(id: string): Promise<EmailTemplate | null> {
    return this.emailTemplateRepository.findOne({ where: { id } });
  }

  async getTemplateByType(type: EmailTemplateType): Promise<EmailTemplate | null> {
    return this.emailTemplateRepository.findOne({ where: { type, status: EmailTemplateStatus.ACTIVE } });
  }

  async getAllTemplates(): Promise<EmailTemplate[]> {
    return this.emailTemplateRepository.find({ order: { type: 'ASC' } });
  }

  // Configuration management methods
  async setEmailConfig(config: {
    host?: string;
    port?: string;
    user?: string;
    pass?: string;
    secure?: boolean;
    fromEmail?: string;
    fromName?: string;
    replyTo?: string;
    enabled?: boolean;
  }): Promise<void> {
    const promises: Promise<AppConfig | EmailConfig>[] = [];

    if (config.host !== undefined) {
      promises.push(this.configService.setConfig(EmailConfigKey.SMTP_HOST, config.host, 'SMTP Host'));
    }
    if (config.port !== undefined) {
      promises.push(this.configService.setConfig(EmailConfigKey.SMTP_PORT, config.port.toString(), 'SMTP Port'));
    }
    if (config.user !== undefined) {
      promises.push(this.configService.setConfig(EmailConfigKey.SMTP_USER, config.user, 'SMTP Username'));
    }
    if (config.pass !== undefined) {
      promises.push(this.configService.setConfig(EmailConfigKey.SMTP_PASS, config.pass, 'SMTP Password', true));
    }
    if (config.secure !== undefined) {
      promises.push(this.configService.setConfig(EmailConfigKey.SMTP_SECURE, config.secure.toString(), 'SMTP Secure'));
    }
    if (config.fromEmail !== undefined) {
      promises.push(this.configService.setConfig(EmailConfigKey.FROM_EMAIL, config.fromEmail, 'From Email'));
    }
    if (config.fromName !== undefined) {
      promises.push(this.configService.setConfig(EmailConfigKey.FROM_NAME, config.fromName, 'From Name'));
    }
    if (config.replyTo !== undefined) {
      promises.push(this.configService.setConfig(EmailConfigKey.REPLY_TO, config.replyTo, 'Reply To Email'));
    }
    if (config.enabled !== undefined) {
      promises.push(this.configService.setConfig(EmailConfigKey.EMAIL_ENABLED, config.enabled.toString(), 'Email Enabled'));
    }

    await Promise.all(promises);
    
    // Reinitialize transporter with new config
    await this.initializeTransporter();
  }

  async getEmailConfigForAdmin(): Promise<any> {
    const config = await this.getEmailConfig();
    return {
      ...config,
      pass: config.pass ? '***hidden***' : '', // Hide password in admin response
    };
  }
}
