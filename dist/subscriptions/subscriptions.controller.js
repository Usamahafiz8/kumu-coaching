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
exports.SubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const subscriptions_service_1 = require("./subscriptions.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const purchase_subscription_dto_1 = require("./dto/purchase-subscription.dto");
const cancel_subscription_dto_1 = require("./dto/cancel-subscription.dto");
const user_entity_1 = require("../entities/user.entity");
const api_response_dto_1 = require("../common/dto/api-response.dto");
let SubscriptionsController = class SubscriptionsController {
    subscriptionsService;
    constructor(subscriptionsService) {
        this.subscriptionsService = subscriptionsService;
    }
    async getSubscriptionPlans() {
        const plans = await this.subscriptionsService.getSubscriptionPlans();
        return new api_response_dto_1.ApiResponseDto(true, 'Subscription plans retrieved successfully', plans);
    }
    async getSubscriptionPlanById(id) {
        const plan = await this.subscriptionsService.getSubscriptionPlanById(id);
        return new api_response_dto_1.ApiResponseDto(true, 'Subscription plan retrieved successfully', plan);
    }
    async purchaseSubscription(user, purchaseDto) {
        const subscription = await this.subscriptionsService.purchaseSubscription(user.id, purchaseDto);
        return new api_response_dto_1.ApiResponseDto(true, 'Subscription purchased successfully', subscription);
    }
    async getSubscriptionStatus(user) {
        const status = await this.subscriptionsService.getSubscriptionStatus(user.id);
        return new api_response_dto_1.ApiResponseDto(true, 'Subscription status retrieved successfully', status);
    }
    async getSubscriptionHistory(user) {
        const history = await this.subscriptionsService.getSubscriptionHistory(user.id);
        return new api_response_dto_1.ApiResponseDto(true, 'Subscription history retrieved successfully', history);
    }
    async cancelSubscription(user, cancelDto) {
        const subscription = await this.subscriptionsService.cancelSubscription(user.id, cancelDto);
        return new api_response_dto_1.ApiResponseDto(true, 'Subscription cancelled successfully', subscription);
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, common_1.Get)('plans'),
    (0, swagger_1.ApiOperation)({ summary: 'List all available subscription plans' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Subscription plans retrieved successfully',
        type: api_response_dto_1.ApiResponseDto,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getSubscriptionPlans", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details of a specific subscription plan' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Subscription plan ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Subscription plan retrieved successfully',
        type: api_response_dto_1.ApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Subscription plan not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getSubscriptionPlanById", null);
__decorate([
    (0, common_1.Post)('purchase'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Purchase/activate a subscription' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Subscription purchased successfully',
        type: api_response_dto_1.ApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Subscription plan not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'User already has an active subscription',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        purchase_subscription_dto_1.PurchaseSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "purchaseSubscription", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current subscription status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Subscription status retrieved successfully',
        type: api_response_dto_1.ApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getSubscriptionStatus", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all past subscription purchases/transactions' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Subscription history retrieved successfully',
        type: api_response_dto_1.ApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getSubscriptionHistory", null);
__decorate([
    (0, common_1.Put)('cancel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel active subscription' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Subscription cancelled successfully',
        type: api_response_dto_1.ApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'No active subscription found',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        cancel_subscription_dto_1.CancelSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "cancelSubscription", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, swagger_1.ApiTags)('Subscriptions'),
    (0, common_1.Controller)('subscriptions'),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService])
], SubscriptionsController);
//# sourceMappingURL=subscriptions.controller.js.map