import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Get correlation ID from header or generate a new one
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['x-request-id'] as string) ||
      uuidv4();

    // Set correlation ID in request headers for downstream use
    req.headers['x-correlation-id'] = correlationId;

    // Set correlation ID in response headers for client tracking
    res.setHeader('x-correlation-id', correlationId);

    next();
  }
}
