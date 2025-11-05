import { HttpStatus } from '@nestjs/common';

export interface ErrorOptions {
  message: string;
  name?: string;
  statusCode?: number;
  errorCode?: string;
  details?: any;
  cause?: Error;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details: any;
  public readonly timestamp: Date;
  public readonly cause?: Error;

  constructor(options: ErrorOptions) {
    const { 
      message, 
      name = 'AppError',
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode = 'INTERNAL_ERROR',
      details = {},
      cause 
    } = options;

    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.timestamp = new Date();
    this.cause = cause;

    // This ensures the stack trace is properly captured
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      error: this.name,
      errorCode: this.errorCode,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      ...(this.cause && { cause: this.cause.message })
    };
  }
}
