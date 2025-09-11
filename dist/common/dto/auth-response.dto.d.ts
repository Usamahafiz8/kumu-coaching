import { User } from '../../entities/user.entity';
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: Partial<User>;
}
