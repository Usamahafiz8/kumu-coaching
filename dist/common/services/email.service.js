"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = EmailService_1 = class EmailService {
    configService;
    logger = new common_1.Logger(EmailService_1.name);
    transporter;
    constructor(configService) {
        this.configService = configService;
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('EMAIL_HOST'),
            port: this.configService.get('EMAIL_PORT'),
            secure: false,
            auth: {
                user: this.configService.get('EMAIL_USER'),
                pass: this.configService.get('EMAIL_PASS'),
            },
        });
    }
    async sendPasswordResetEmail(email, resetToken) {
        const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: this.configService.get('EMAIL_FROM'),
            to: email,
            subject: 'Password Reset Request - Kumu Coaching',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You have requested to reset your password for your Kumu Coaching account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>The Kumu Coaching Team</p>
        </div>
      `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Password reset email sent to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send password reset email to ${email}:`, error);
            throw new Error('Failed to send password reset email');
        }
    }
    async sendWelcomeEmail(email, firstName) {
        const mailOptions = {
            from: this.configService.get('EMAIL_FROM'),
            to: email,
            subject: 'Welcome to Kumu Coaching!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Kumu Coaching!</h2>
          <p>Hello ${firstName},</p>
          <p>Thank you for joining Kumu Coaching! We're excited to have you on board.</p>
          <p>Your account has been successfully created and you can now start your coaching journey.</p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The Kumu Coaching Team</p>
        </div>
      `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Welcome email sent to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send welcome email to ${email}:`, error);
        }
    }
    async sendSubscriptionPurchaseEmail(email, firstName, planName, amount, currency, startDate, endDate) {
        const formattedAmount = (amount / 100).toFixed(2);
        const formattedStartDate = startDate.toLocaleDateString();
        const formattedEndDate = endDate.toLocaleDateString();
        const mailOptions = {
            from: this.configService.get('EMAIL_FROM'),
            to: email,
            subject: 'Subscription Purchase Confirmation - Kumu Coaching',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #28a745; margin: 0; text-align: center;">🎉 Subscription Activated!</h2>
          </div>
          
          <p>Hello ${firstName},</p>
          <p>Thank you for your subscription purchase! Your payment has been processed successfully.</p>
          
          <div style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Subscription Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Plan:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${planName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Amount:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formattedAmount} ${currency.toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Start Date:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formattedStartDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">End Date:</td>
                <td style="padding: 8px 0;">${formattedEndDate}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
            <h4 style="color: #007bff; margin: 0 0 10px 0;">What's Next?</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Access your coaching dashboard</li>
              <li>Schedule your first coaching session</li>
              <li>Explore our premium features</li>
              <li>Connect with your personal coach</li>
            </ul>
          </div>
          
          <p>You can manage your subscription and view your billing history in your account dashboard.</p>
          <p>If you have any questions about your subscription or need assistance, please don't hesitate to contact our support team.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get('FRONTEND_URL')}/dashboard" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Access Dashboard
            </a>
          </div>
          
          <p>Thank you for choosing Kumu Coaching. We're excited to be part of your journey!</p>
          <p>Best regards,<br>The Kumu Coaching Team</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Subscription purchase email sent to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send subscription purchase email to ${email}:`, error);
            throw new Error('Failed to send subscription purchase email');
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map