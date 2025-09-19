import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<boolean>('EMAIL_SECURE'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendPasswordResetCode(email: string, resetCode: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"${this.configService.get<string>('EMAIL_FROM_NAME') || 'Kumu Coaching'}" <${this.configService.get<string>('EMAIL_FROM')}>`,
        to: email,
        subject: 'Password Reset Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Verification Code</h2>
            <p>You requested a password reset for your Kumu Coaching account.</p>
            <p>Your verification code is:</p>
            <div style="background-color: #f8f9fa; border: 2px solid #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 4px;">${resetCode}</h1>
            </div>
            <p>Enter this code in the password reset form to continue.</p>
            <p><strong>This code will expire in 10 minutes.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.log('Email service not configured. Verification code:', resetCode);
      console.log('Code would be sent to:', email);
      // Don't throw error - just log it for development
    }
  }

  async sendWelcomeEmail(email: string, firstName?: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"${this.configService.get<string>('EMAIL_FROM_NAME') || 'Kumu Coaching'}" <${this.configService.get<string>('EMAIL_FROM')}>`,
        to: email,
        subject: 'Welcome to Kumu Coaching!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Kumu Coaching${firstName ? `, ${firstName}` : ''}!</h2>
            <p>Thank you for signing up. We're excited to have you on board!</p>
            <p>Get started by exploring our coaching programs and resources.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Get Started</a>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.log('Email service not configured. Welcome email would be sent to:', email);
      // Don't throw error - just log it for development
    }
  }
}
