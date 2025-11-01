import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error occurred';
    let code = 'DATABASE_ERROR';

    switch (exception.code) {
      case 'P2002':
        // Unique constraint violation
        status = HttpStatus.CONFLICT;
        message = 'A record with this value already exists';
        code = 'UNIQUE_CONSTRAINT_VIOLATION';
        if (exception.meta?.target) {
          const targetValue = exception.meta.target;
          let target: string;
          if (Array.isArray(targetValue)) {
            target = targetValue.join(', ');
          } else if (typeof targetValue === 'string') {
            target = targetValue;
          } else {
            target = JSON.stringify(targetValue);
          }
          message = `A record with this ${target} already exists`;
        }
        break;

      case 'P2025':
        // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        code = 'RECORD_NOT_FOUND';
        break;

      case 'P2003':
        // Foreign key constraint violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Related record not found';
        code = 'FOREIGN_KEY_CONSTRAINT';
        break;

      case 'P2014':
        // Invalid ID
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid ID provided';
        code = 'INVALID_ID';
        break;

      case 'P2016':
        // Query interpretation error
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid query parameters';
        code = 'QUERY_INTERPRETATION_ERROR';
        break;

      default:
        // Log unexpected Prisma errors
        this.logger.error(
          `Unhandled Prisma error code: ${exception.code}`,
          exception.stack,
        );
        super.catch(exception, host);
        return;
    }

    // Log the error
    this.logger.warn(
      `Prisma error ${exception.code} on ${request.method} ${request.url}: ${message}`,
    );

    // Send response
    response.status(status).json({
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }
}
