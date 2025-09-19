import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { SignUpDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from '../dto/auth.dto';
import { AdminLoginDto, AdminSignUpDto, AdminProfileDto } from '../dto/admin.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ user: User; token: string }> {
    const { email, password, firstName, lastName } = signUpDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const token = this.jwtService.sign({ sub: savedUser.id, email: savedUser.email });

    return { user: savedUser, token };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return { user, token };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists or not
      return { message: 'If an account with that email exists, we sent a verification code.' };
    }

    // Generate 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 600000); // 10 minutes

    // Save reset code
    user.passwordResetCode = resetCode;
    user.passwordResetCodeExpires = resetExpires;
    await this.userRepository.save(user);

    // Send email with verification code
    await this.emailService.sendPasswordResetCode(email, resetCode);

    return { message: 'If an account with that email exists, we sent a verification code.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { code, password } = resetPasswordDto;

    const user = await this.userRepository.findOne({
      where: {
        passwordResetCode: code,
      },
    });

    if (!user || !user.passwordResetCodeExpires || user.passwordResetCodeExpires < new Date()) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Update password
    user.password = await bcrypt.hash(password, 12);
    user.passwordResetCode = null;
    user.passwordResetCodeExpires = null;
    await this.userRepository.save(user);

    return { message: 'Password has been reset successfully' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 12);
    await this.userRepository.save(user);

    return { message: 'Password has been changed successfully' };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // Admin-specific methods
  async adminLogin(adminLoginDto: AdminLoginDto): Promise<{ user: User; token: string }> {
    const { email, password } = adminLoginDto;

    // Find user with admin role
    const user = await this.userRepository.findOne({ 
      where: { email, role: 'admin' } 
    });
    
    if (!user) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    // Generate JWT token with admin role
    const token = this.jwtService.sign({ 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    });

    return { user, token };
  }

  async adminSignUp(adminSignUpDto: AdminSignUpDto): Promise<{ user: User; token: string }> {
    const { email, password, firstName, lastName } = adminSignUpDto;

    // Check if admin already exists
    const existingAdmin = await this.userRepository.findOne({ where: { email } });
    if (existingAdmin) {
      throw new BadRequestException('Admin with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const admin = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'admin',
      isEmailVerified: true, // Auto-verify admin emails
    });

    const savedAdmin = await this.userRepository.save(admin);

    // Generate JWT token
    const token = this.jwtService.sign({ 
      sub: savedAdmin.id, 
      email: savedAdmin.email, 
      role: savedAdmin.role 
    });

    return { user: savedAdmin, token };
  }

  async updateAdminProfile(adminId: string, updateData: Partial<AdminProfileDto>): Promise<{ message: string; user: User }> {
    const admin = await this.userRepository.findOne({ where: { id: adminId, role: 'admin' } });
    
    if (!admin) {
      throw new BadRequestException('Admin not found');
    }

    // Update allowed fields
    if (updateData.firstName) admin.firstName = updateData.firstName;
    if (updateData.lastName) admin.lastName = updateData.lastName;
    if (updateData.email) admin.email = updateData.email;

    const updatedAdmin = await this.userRepository.save(admin);
    
    return { 
      message: 'Admin profile updated successfully', 
      user: updatedAdmin 
    };
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isEmailVerified', 'createdAt', 'updatedAt']
    });
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isEmailVerified', 'createdAt', 'updatedAt']
    });
    
    if (!user) {
      throw new BadRequestException('User not found');
    }
    
    return user;
  }
}
