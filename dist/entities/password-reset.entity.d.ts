import { User } from './user.entity';
export declare class PasswordReset {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;
    user: User;
    get isExpired(): boolean;
    get isValid(): boolean;
}
