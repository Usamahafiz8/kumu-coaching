import { Logger, BadRequestException, NotFoundException, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';

export class ErrorHandler {
  private static logger = new Logger('ErrorHandler');

  /**
   * Handle database errors and convert them to appropriate HTTP exceptions
   */
  static handleDatabaseError(error: any, context: string): never {
    this.logger.error(`Database error in ${context}:`, error.stack);

    if (error.code === '23505') { // PostgreSQL unique constraint violation
      throw new ConflictException('Resource already exists');
    }
    
    if (error.code === '23503') { // PostgreSQL foreign key constraint violation
      throw new BadRequestException('Referenced resource does not exist');
    }
    
    if (error.code === '23502') { // PostgreSQL not null constraint violation
      throw new BadRequestException('Required field is missing');
    }

    if (error.name === 'ValidationError') {
      throw new BadRequestException('Invalid data provided');
    }

    if (error.name === 'CastError') {
      throw new BadRequestException('Invalid data format');
    }

    // Generic database error
    throw new BadRequestException('Database operation failed');
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(error: any, context: string): never {
    this.logger.warn(`Validation error in ${context}:`, error.message);
    throw new BadRequestException(error.message || 'Validation failed');
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(error: any, context: string): never {
    this.logger.warn(`Authentication error in ${context}:`, error.message);
    
    if (error.message?.includes('invalid') || error.message?.includes('expired')) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    
    if (error.message?.includes('insufficient')) {
      throw new ForbiddenException('Insufficient permissions');
    }

    throw new UnauthorizedException('Authentication failed');
  }

  /**
   * Handle external service errors (Stripe, email, etc.)
   */
  static handleExternalServiceError(error: any, service: string, context: string): never {
    this.logger.error(`External service error (${service}) in ${context}:`, error.stack);

    if (service === 'stripe') {
      if (error.type === 'StripeCardError') {
        throw new BadRequestException('Payment method declined');
      }
      if (error.type === 'StripeRateLimitError') {
        throw new BadRequestException('Too many requests. Please try again later');
      }
      if (error.type === 'StripeInvalidRequestError') {
        throw new BadRequestException('Invalid payment request');
      }
    }

    throw new BadRequestException(`${service} service temporarily unavailable`);
  }

  /**
   * Handle not found errors
   */
  static handleNotFoundError(resource: string, id?: string): never {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    throw new NotFoundException(message);
  }

  /**
   * Handle conflict errors
   */
  static handleConflictError(message: string): never {
    throw new ConflictException(message);
  }

  /**
   * Handle bad request errors
   */
  static handleBadRequestError(message: string): never {
    throw new BadRequestException(message);
  }

  /**
   * Generic error handler
   */
  static handleError(error: any, context: string): never {
    this.logger.error(`Unexpected error in ${context}:`, error.stack);

    if (error instanceof BadRequestException || 
        error instanceof NotFoundException || 
        error instanceof ConflictException ||
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException) {
      throw error;
    }

    throw new BadRequestException('An unexpected error occurred');
  }
}

/**
 * Decorator to wrap service methods with error handling
 */
export function HandleErrors(context: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await method.apply(this, args);
      } catch (error) {
        ErrorHandler.handleError(error, `${target.constructor.name}.${propertyName}`);
      }
    };
  };
}

