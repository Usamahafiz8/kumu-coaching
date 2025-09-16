import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomInt } from 'crypto';
import { VerificationCode, VerificationCodeStatus } from '../entities/verification-code.entity';
import { User } from '../entities/user.entity';
import { EmailService } from '../email/email.service';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class VerificationCodesService {
  private readonly logger = new Logger(VerificationCodesService.name);

  constructor(
    @InjectRepository(VerificationCode)
    private verificationCodeRepository: Repository<VerificationCode>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  /**
   * Generate a 6-digit verification code
   */
  private generateCode(): string {
    return randomInt(100000, 999999).toString();
  }

  /**
   * Send email verification code to user
   */
  async sendEmailVerificationCode(user: User): Promise<VerificationCode> {
    // Check if user already has a pending verification code
    const existingCode = await this.verificationCodeRepository.findOne({
      where: {
        user: { id: user.id },
        type: 'email_verification',
        status: VerificationCodeStatus.PENDING,
      },
    });

    if (existingCode) {
      // Check if the existing code is still valid (not expired)
      if (existingCode.expiresAt > new Date()) {
        throw new BadRequestException('Verification code already sent. Please check your email.');
      } else {
        // Delete expired code
        await this.verificationCodeRepository.remove(existingCode);
      }
    }

    // Generate new verification code
    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiry

    // Create verification code record
    const verificationCode = this.verificationCodeRepository.create({
      user,
      code,
      type: 'email_verification',
      status: VerificationCodeStatus.PENDING,
      expiresAt,
    });

    const savedCode = await this.verificationCodeRepository.save(verificationCode);

    // Send email
    try {
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Email Verification Code',
        html: `
          <h2>Email Verification</h2>
          <p>Hello ${user.firstName},</p>
          <p>Your email verification code is: <strong>${code}</strong></p>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        `,
      });

      this.logger.log(`Email verification code sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send email verification code to ${user.email}:`, error);
      // Don't throw error here, just log it
    }

    return savedCode;
  }

  /**
   * Verify email with verification code
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<void> {
    const { email, code } = verifyEmailDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find verification code
    const verificationCode = await this.verificationCodeRepository.findOne({
      where: {
        user: { id: user.id },
        code,
        type: 'email_verification',
        status: VerificationCodeStatus.PENDING,
      },
    });

    if (!verificationCode) {
      throw new BadRequestException('Invalid verification code');
    }

    // Check if code is expired
    if (verificationCode.expiresAt < new Date()) {
      throw new BadRequestException('Verification code has expired');
    }

    // Mark code as verified
    verificationCode.status = VerificationCodeStatus.VERIFIED;
    verificationCode.verifiedAt = new Date();
    await this.verificationCodeRepository.save(verificationCode);

    // Update user email verification status
    user.emailVerified = true;
    await this.userRepository.save(user);

    this.logger.log(`Email verified for user ${user.email}`);
  }

  /**
   * Clean up expired verification codes (called by cron job)
   */
  async cleanupExpiredCodes(): Promise<void> {
    const expiredCodes = await this.verificationCodeRepository.find({
      where: {
        status: VerificationCodeStatus.PENDING,
      },
    });

    const now = new Date();
    const expiredCodesToDelete = expiredCodes.filter(code => code.expiresAt < now);

    if (expiredCodesToDelete.length > 0) {
      await this.verificationCodeRepository.remove(expiredCodesToDelete);
      this.logger.log(`Cleaned up ${expiredCodesToDelete.length} expired verification codes`);
    }
  }
}