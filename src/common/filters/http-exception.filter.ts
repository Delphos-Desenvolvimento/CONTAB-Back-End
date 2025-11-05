import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError } from '../errors/app.error';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Internal server error',
    };

    // Handle AppError instances
    if (exception instanceof AppError) {
      status = exception.statusCode;
      errorResponse = {
        ...errorResponse,
        ...exception.toJSON(),
        path: request.url,
      };
    } 
    // Handle NestJS HttpException
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      
      errorResponse = {
        ...errorResponse,
        statusCode: status,
        ...(typeof response === 'string' ? { message: response } : response),
      };
    } 
    // Handle other errors
    else if (exception instanceof Error) {
      errorResponse = {
        ...errorResponse,
        message: exception.message,
        name: exception.name,
        ...(process.env.NODE_ENV === 'development' && { stack: exception.stack }),
      };
    }

    // Log the error
    if (status >= 500) {
      console.error('Unhandled exception:', exception);
    }

    response.status(status).json(errorResponse);
  }
}
