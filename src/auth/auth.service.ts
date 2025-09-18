import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { User, UserRole } from '../entities/user.entity';
import { PasswordReset } from '../entities/password-reset.entity';
import { PasswordResetCode } from '../entities/password-reset-code.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SendPasswordResetCodeDto } from './dto/send-password-reset-code.dto';
import { ResetPasswordWithCodeDto } from './dto/reset-password-with-code.dto';
import { AuthResponseDto } from '../common/dto/auth-response.dto';
import { EmailService } from '../email/email.service';
import { VerificationCodesService } from '../verification-codes/verification-codes.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
    @InjectRepository(PasswordResetCode)
    private passwordResetCodeRepository: Repository<PasswordResetCode>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private verificationCodesService: VerificationCodesService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, phone, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user (email not verified initially)
    const user = this.userRepository.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      role: role || UserRole.PLAYER, // Default to player if no role specified
      emailVerified: false, // Email not verified initially
    });

    const savedUser = await this.userRepository.save(user);

    // Send email verification code
    await this.verificationCodesService.sendEmailVerificationCode(savedUser);

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);

    return {
      ...tokens,
      user: this.sanitizeUser(savedUser),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);


    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async logout(userId: string): Promise<void> {
    // No-op since we're not using refresh tokens
  }


  async sendPasswordResetCode(sendPasswordResetCodeDto: SendPasswordResetCodeDto): Promise<void> {
    const { email } = sendPasswordResetCodeDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return;
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Invalidate any existing reset codes for this user
    await this.passwordResetCodeRepository.update(
      { userId: user.id },
      { isUsed: true }
    );

    // Save reset code
    const passwordResetCode = this.passwordResetCodeRepository.create({
      userId: user.id,
      code: resetCode,
      expiresAt,
    });

    await this.passwordResetCodeRepository.save(passwordResetCode);

    // Send reset code email
    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Password Reset Code - Kumu Coaching',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Code</h2>
          <p>Hello ${user.firstName},</p>
          <p>You have requested to reset your password for your Kumu Coaching account.</p>
          <p>Your password reset code is:</p>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${resetCode}</h1>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>The Kumu Coaching Team</p>
        </div>
      `,
    });
  }

  async resetPasswordWithCode(resetPasswordWithCodeDto: ResetPasswordWithCodeDto): Promise<void> {
    const { code, newPassword } = resetPasswordWithCodeDto;

    // Find valid reset code
    const resetCode = await this.passwordResetCodeRepository.findOne({
      where: { code, isUsed: false },
      relations: ['user'],
    });

    if (!resetCode || resetCode.isExpired) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    // Update user password
    const user = resetCode.user;
    user.password = newPassword;
    await this.userRepository.save(user);

    // Mark reset code as used
    resetCode.isUsed = true;
    await this.passwordResetCodeRepository.save(resetCode);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return;
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token
    const passwordReset = this.passwordResetRepository.create({
      userId: user.id,
      token: resetToken,
      expiresAt,
    });

    await this.passwordResetRepository.save(passwordReset);

    // Send reset email
    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.firstName},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
      `,
    });
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;

    const passwordReset = await this.passwordResetRepository.findOne({
      where: { token, isUsed: false },
      relations: ['user'],
    });

    if (!passwordReset || !passwordReset.isValid) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update user password
    await this.userRepository.update(passwordReset.userId, {
      password: newPassword,
    });

    // Mark reset token as used
    await this.passwordResetRepository.update(passwordReset.id, {
      isUsed: true,
    });
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate current password
    const isCurrentPasswordValid = await user.validatePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update password
    await this.userRepository.update(userId, {
      password: newPassword,
    });
  }

  async validateUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });

    return {
      accessToken,
      expiresIn: 3600, // 1 hour in seconds
    };
  }

  private sanitizeUser(user: User): Partial<User> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
