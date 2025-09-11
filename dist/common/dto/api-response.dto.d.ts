export declare class ApiResponseDto<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
    constructor(success: boolean, message: string, data?: T, error?: any);
}
export declare class PaginatedResponseDto<T = any> extends ApiResponseDto<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
