import { User } from '../../entities/user.entity';
export declare class AuthResponseDto {
    accessToken: string;
    expiresIn: number;
    user: Partial<User>;
}
