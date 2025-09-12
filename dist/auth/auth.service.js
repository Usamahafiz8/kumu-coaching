"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const user_entity_1 = require("../entities/user.entity");
const password_reset_entity_1 = require("../entities/password-reset.entity");
const email_service_1 = require("../common/services/email.service");
let AuthService = class AuthService {
    userRepository;
    passwordResetRepository;
    jwtService;
    configService;
    emailService;
    constructor(userRepository, passwordResetRepository, jwtService, configService, emailService) {
        this.userRepository = userRepository;
        this.passwordResetRepository = passwordResetRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.emailService = emailService;
    }
    async register(registerDto) {
        const { email, password, firstName, lastName, phone } = registerDto;
        const existingUser = await this.userRepository.findOne({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const user = this.userRepository.create({
            email,
            password,
            firstName,
            lastName,
            phone,
        });
        const savedUser = await this.userRepository.save(user);
        const tokens = await this.generateTokens(savedUser);
        await this.emailService.sendWelcomeEmail(savedUser.email, savedUser.firstName);
        return {
            ...tokens,
            user: this.sanitizeUser(savedUser),
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status !== 'active') {
            throw new common_1.UnauthorizedException('Account is not active');
        }
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.generateTokens(user);
        return {
            ...tokens,
            user: this.sanitizeUser(user),
        };
    }
    async logout(userId) {
    }
    async forgotPassword(forgotPasswordDto) {
        const { email } = forgotPasswordDto;
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (!user) {
            return;
        }
        const resetToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        const passwordReset = this.passwordResetRepository.create({
            userId: user.id,
            token: resetToken,
            expiresAt,
        });
        await this.passwordResetRepository.save(passwordReset);
        await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    }
    async resetPassword(resetPasswordDto) {
        const { token, newPassword } = resetPasswordDto;
        const passwordReset = await this.passwordResetRepository.findOne({
            where: { token, isUsed: false },
            relations: ['user'],
        });
        if (!passwordReset || !passwordReset.isValid) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        await this.userRepository.update(passwordReset.userId, {
            password: newPassword,
        });
        await this.passwordResetRepository.update(passwordReset.id, {
            isUsed: true,
        });
    }
    async changePassword(userId, changePasswordDto) {
        const { currentPassword, newPassword } = changePasswordDto;
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isCurrentPasswordValid = await user.validatePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        await this.userRepository.update(userId, {
            password: newPassword,
        });
    }
    async validateUserById(userId) {
        return this.userRepository.findOne({
            where: { id: userId },
        });
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('jwt.secret'),
            expiresIn: this.configService.get('jwt.expiresIn'),
        });
        return {
            accessToken,
            expiresIn: 3600,
        };
    }
    sanitizeUser(user) {
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(password_reset_entity_1.PasswordReset)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map