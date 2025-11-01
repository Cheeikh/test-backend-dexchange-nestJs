import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key is missing');
    }

    const validKeys = this.configService
      .get<string>('API_KEYS', '')
      .split(',')
      .map((key) => key.trim())
      .filter((key) => key.length > 0);

    if (!validKeys.includes(apiKey as string)) {
      throw new ForbiddenException('Invalid API key');
    }

    return true;
  }
}
