import { Subscription } from './subscription.entity';
import { PasswordReset } from './password-reset.entity';
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin",
    COACH = "coach"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatar: string;
    role: UserRole;
    status: UserStatus;
    emailVerified: boolean;
    emailVerificationToken: string;
    createdAt: Date;
    updatedAt: Date;
    subscriptions: Subscription[];
    passwordResets: PasswordReset[];
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
    get fullName(): string;
}
