import { AppService } from './app.service';
import type { Response } from 'express';
import { User } from './entities/user.entity';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    getFavicon(res: Response): void;
    testAuth(user: User): {
        message: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    };
}
