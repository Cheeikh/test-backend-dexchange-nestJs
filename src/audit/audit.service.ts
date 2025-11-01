import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

export enum AuditAction {
  TRANSFER_CREATED = 'TRANSFER_CREATED',
  TRANSFER_PROCESSING = 'TRANSFER_PROCESSING',
  TRANSFER_SUCCESS = 'TRANSFER_SUCCESS',
  TRANSFER_FAILED = 'TRANSFER_FAILED',
  TRANSFER_CANCELED = 'TRANSFER_CANCELED',
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(
    action: AuditAction,
    transferId?: string,
    metadata?: Prisma.InputJsonValue | Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          transferId,
          metadata: (metadata ?? {}) as Prisma.InputJsonValue,
        },
      });

      this.logger.log(
        `Audit log created: ${action} for transfer ${transferId || 'N/A'}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create audit log for action ${action}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async getTransferLogs(transferId: string) {
    return this.prisma.auditLog.findMany({
      where: { transferId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllLogs(limit = 100) {
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        transfer: {
          select: {
            reference: true,
            amount: true,
            status: true,
          },
        },
      },
    });
  }
}
