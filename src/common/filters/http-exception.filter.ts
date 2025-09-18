import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseDto } from '../dto/api-response.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorResponse = exception.getResponse();
    let message = 'Internal server error';
    let validationErrors = null;

    if (typeof errorResponse === 'string') {
      message = errorResponse;
    } else if (typeof errorResponse === 'object' && errorResponse !== null) {
      const errorObj = errorResponse as any;
      
      // Handle validation errors
      if (Array.isArray(errorObj.message)) {
        message = 'Validation failed';
        validationErrors = errorObj.message;
      } else if (errorObj.message) {
        message = errorObj.message;
      }
      
      // Handle specific error types
      if (errorObj.error) {
        message = errorObj.error;
      }
    }

    const errorDetails: any = {};
    if (validationErrors) {
      errorDetails.validationErrors = validationErrors;
    }
    if (process.env.NODE_ENV === 'development') {
      errorDetails.details = errorResponse;
      errorDetails.stack = exception.stack;
    }

    const apiResponse = new ApiResponseDto(
      false,
      message,
      null,
      Object.keys(errorDetails).length > 0 ? errorDetails : undefined,
    );

    // Log with appropriate level based on status
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
        exception.stack,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${message}`,
      );
    }

    response.status(status).json(apiResponse);
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorDetails: any = null;

    // Handle different types of exceptions
    if (exception instanceof Error) {
      message = exception.message;
      
      // Handle specific error types
      if (exception.name === 'ValidationError') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Validation failed';
      } else if (exception.name === 'CastError') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid data format';
      } else if (exception.name === 'MongoError' || exception.name === 'MongooseError') {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database error';
      } else if (exception.name === 'TypeORMError') {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database error';
      }
      
      errorDetails = process.env.NODE_ENV === 'development' ? {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
      } : null;
    } else {
      errorDetails = process.env.NODE_ENV === 'development' ? exception : null;
    }

    const apiResponse = new ApiResponseDto(
      false,
      message,
      null,
      errorDetails,
    );

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response.status(status).json(apiResponse);
  }
}
