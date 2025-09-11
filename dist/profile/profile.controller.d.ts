import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import { User } from '../entities/user.entity';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { AuthService } from '../auth/auth.service';
export declare class ProfileController {
    private readonly profileService;
    private readonly authService;
    constructor(profileService: ProfileService, authService: AuthService);
    getProfile(user: User): Promise<ApiResponseDto<User>>;
    updateProfile(user: User, updateProfileDto: UpdateProfileDto): Promise<ApiResponseDto<User>>;
    changePassword(user: User, changePasswordDto: ChangePasswordDto): Promise<ApiResponseDto>;
}
