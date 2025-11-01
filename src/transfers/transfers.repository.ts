import { Injectable } from '@nestjs/common';
import {
  TransferStatus,
  TransferChannel,
  Transfer,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { ListTransfersQueryDto } from './dto/list-transfers.dto';

@Injectable()
export class TransfersRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    reference: string;
    amount: number;
    currency: string;
    channel: TransferChannel;
    fees: number;
    total: number;
    recipientPhone: string;
    recipientName: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<Transfer> {
    return this.prisma.transfer.create({
      data,
    });
  }

  async findById(id: string): Promise<Transfer | null> {
    return this.prisma.transfer.findUnique({
      where: { id },
    });
  }

  async findByReference(reference: string): Promise<Transfer | null> {
    return this.prisma.transfer.findUnique({
      where: { reference },
    });
  }

  async findMany(query: ListTransfersQueryDto) {
    const {
      status,
      channel,
      minAmount,
      maxAmount,
      q,
      limit = 20,
      cursor,
    } = query;

    const where: Prisma.TransferWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (channel) {
      where.channel = channel;
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) {
        where.amount.gte = minAmount;
      }
      if (maxAmount !== undefined) {
        where.amount.lte = maxAmount;
      }
    }

    if (q) {
      where.OR = [
        { reference: { contains: q, mode: 'insensitive' } },
        { recipientName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const queryOptions: Prisma.TransferFindManyArgs = {
      where,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
    };

    if (cursor) {
      try {
        const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');
        queryOptions.cursor = { id: decodedCursor };
        queryOptions.skip = 1;
      } catch (error) {
        throw new Error('Invalid cursor', { cause: error });
      }
    }

    const transfers = await this.prisma.transfer.findMany(queryOptions);

    let nextCursor: string | undefined;
    if (transfers.length > limit) {
      const lastItem = transfers[limit];
      if (lastItem) {
        nextCursor = Buffer.from(lastItem.id).toString('base64');
      }
      transfers.pop();
    }

    return {
      items: transfers,
      nextCursor,
    };
  }

  async updateStatus(
    id: string,
    status: TransferStatus,
    additionalData?: {
      providerRef?: string;
      errorCode?: string;
    },
  ): Promise<Transfer> {
    return this.prisma.transfer.update({
      where: { id },
      data: {
        status,
        ...additionalData,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.TransferUpdateInput,
  ): Promise<Transfer> {
    return this.prisma.transfer.update({
      where: { id },
      data,
    });
  }
}
