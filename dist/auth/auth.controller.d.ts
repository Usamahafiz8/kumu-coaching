import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthResponseDto } from '../common/dto/auth-response.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    logout(req: any): Promise<ApiResponseDto>;
    refreshToken(refreshToken: string): Promise<AuthResponseDto>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<ApiResponseDto>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<ApiResponseDto>;
    changePassword(req: any, changePasswordDto: ChangePasswordDto): Promise<ApiResponseDto>;
}
