import { HttpStatus } from '@nestjs/common';
import { AppError } from './app.error';

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: any) {
    super({
      message,
      name: 'NotFoundError',
      statusCode: HttpStatus.NOT_FOUND,
      errorCode: 'RESOURCE_NOT_FOUND',
      details,
    });
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: any) {
    super({
      message,
      name: 'ValidationError',
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: 'VALIDATION_ERROR',
      details,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?: any) {
    super({
      message,
      name: 'UnauthorizedError',
      statusCode: HttpStatus.UNAUTHORIZED,
      errorCode: 'UNAUTHORIZED',
      details,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: any) {
    super({
      message,
      name: 'ForbiddenError',
      statusCode: HttpStatus.FORBIDDEN,
      errorCode: 'FORBIDDEN',
      details,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', details?: any) {
    super({
      message,
      name: 'ConflictError',
      statusCode: HttpStatus.CONFLICT,
      errorCode: 'CONFLICT',
      details,
    });
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', details?: any) {
    super({
      message,
      name: 'RateLimitError',
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      errorCode: 'RATE_LIMIT_EXCEEDED',
      details,
    });
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable', details?: any) {
    super({
      message,
      name: 'ServiceUnavailableError',
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      errorCode: 'SERVICE_UNAVAILABLE',
      details,
    });
  }
}
