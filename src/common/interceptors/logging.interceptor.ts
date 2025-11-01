import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: (): void => {
          const { statusCode } = response;
          const delay = Date.now() - now;

          this.logger.log(
            `${method} ${url} ${statusCode} ${delay}ms - ${userAgent} ${ip}`,
          );
        },
        error: (error: Error): void => {
          const delay = Date.now() - now;

          this.logger.error(
            `${method} ${url} ${error.message} ${delay}ms - ${userAgent} ${ip}`,
          );
        },
      }),
    );
  }
}
