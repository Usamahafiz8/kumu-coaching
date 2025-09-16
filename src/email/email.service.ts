import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { EmailTemplate, EmailTemplateType, EmailTemplateStatus } from '../entities/email-template.entity';

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
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
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
        port: emailConfig.port,
        secure: emailConfig.secure,
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

  private getEmailConfig(): {
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
    fromEmail: string;
    fromName: string;
    replyTo: string;
    enabled: boolean;
  } {
    return {
      host: process.env.EMAIL_HOST || '',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || '',
      secure: process.env.EMAIL_SECURE === 'true',
      fromEmail: process.env.EMAIL_FROM || process.env.EMAIL_USER || '',
      fromName: process.env.EMAIL_FROM_NAME || 'Kumu Coaching',
      replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM || process.env.EMAIL_USER || '',
      enabled: process.env.EMAIL_ENABLED !== 'false',
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
  async getEmailConfigForAdmin(): Promise<any> {
    const config = this.getEmailConfig();
    return {
      ...config,
      pass: config.pass ? '***hidden***' : '', // Hide password in admin response
    };
  }

  // Subscription confirmation email
  async sendSubscriptionConfirmation(data: {
    to: string;
    firstName: string;
    lastName: string;
    planName: string;
    amount: number;
    currency: string;
    subscriptionId: string;
    currentPeriodEnd: Date;
  }): Promise<boolean> {
    const subject = 'Subscription Confirmation - Kumu Coaching';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Subscription Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .highlight { background-color: #e8f5e8; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Subscription Confirmed!</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${data.firstName} ${data.lastName},</h2>
            
            <p>Thank you for subscribing to Kumu Coaching! Your payment has been successfully processed and your subscription is now active.</p>
            
            <div class="highlight">
              <h3>Subscription Details:</h3>
              <ul>
                <li><strong>Plan:</strong> ${data.planName}</li>
                <li><strong>Amount:</strong> ${data.currency.toUpperCase()} ${data.amount}</li>
                <li><strong>Subscription ID:</strong> ${data.subscriptionId}</li>
                <li><strong>Next Billing Date:</strong> ${data.currentPeriodEnd.toLocaleDateString()}</li>
              </ul>
            </div>
            
            <p>You now have full access to all premium features. You can manage your subscription and access your dashboard at any time.</p>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Welcome to the Kumu Coaching community!</p>
            
            <p>Best regards,<br>
            The Kumu Coaching Team</p>
          </div>
          
          <div class="footer">
            <p>This email was sent to ${data.to}</p>
            <p>© ${new Date().getFullYear()} Kumu Coaching. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Subscription Confirmation - Kumu Coaching
      
      Hello ${data.firstName} ${data.lastName},
      
      Thank you for subscribing to Kumu Coaching! Your payment has been successfully processed and your subscription is now active.
      
      Subscription Details:
      - Plan: ${data.planName}
      - Amount: ${data.currency.toUpperCase()} ${data.amount}
      - Subscription ID: ${data.subscriptionId}
      - Next Billing Date: ${data.currentPeriodEnd.toLocaleDateString()}
      
      You now have full access to all premium features. You can manage your subscription and access your dashboard at any time.
      
      If you have any questions or need assistance, please don't hesitate to contact our support team.
      
      Welcome to the Kumu Coaching community!
      
      Best regards,
      The Kumu Coaching Team
      
      This email was sent to ${data.to}
      © ${new Date().getFullYear()} Kumu Coaching. All rights reserved.
    `;

    return this.sendEmail({
      to: data.to,
      subject,
      html: htmlContent,
      text: textContent,
    });
  }
}
