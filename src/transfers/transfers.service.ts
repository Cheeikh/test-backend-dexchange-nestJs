import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransferStatus, TransferChannel, Prisma } from '@prisma/client';

import { AuditService, AuditAction } from '../audit/audit.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { ListTransfersQueryDto } from './dto/list-transfers.dto';
import { ProviderSimulator } from './provider.simulator';
import { TransfersRepository } from './transfers.repository';

@Injectable()
export class TransfersService {
  private readonly logger = new Logger(TransfersService.name);

  constructor(
    private transfersRepository: TransfersRepository,
    private auditService: AuditService,
    private providerSimulator: ProviderSimulator,
    private configService: ConfigService,
  ) {}

  calculateFees(amount: number): number {
    const feePercentage = this.configService.get<number>('FEE_PERCENTAGE', 0.8);
    const minFee = this.configService.get<number>('MIN_FEE', 100);
    const maxFee = this.configService.get<number>('MAX_FEE', 1500);

    let fees = Math.ceil((amount * feePercentage) / 100);

    if (fees < minFee) {
      fees = minFee;
    }

    if (fees > maxFee) {
      fees = maxFee;
    }

    return fees;
  }

  generateReference(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `TRF-${year}${month}${day}-${random}`;
  }

  async create(createTransferDto: CreateTransferDto) {
    const { amount, currency, channel, recipient, metadata } =
      createTransferDto;

    const fees = this.calculateFees(amount);
    const total = amount + fees;
    const reference = this.generateReference();

    const transfer = await this.transfersRepository.create({
      reference,
      amount,
      currency:
        currency || this.configService.get<string>('DEFAULT_CURRENCY', 'XOF'),
      channel: channel as TransferChannel,
      fees,
      total,
      recipientPhone: recipient.phone,
      recipientName: recipient.name,
      metadata: (metadata ?? {}) as Prisma.InputJsonValue,
    });

    await this.auditService.log(AuditAction.TRANSFER_CREATED, transfer.id, {
      amount,
      channel,
      recipient,
    });

    this.logger.log(`Transfer created: ${transfer.reference} (${transfer.id})`);

    return transfer;
  }

  async findAll(query: ListTransfersQueryDto) {
    return this.transfersRepository.findMany(query);
  }

  async findOne(id: string) {
    const transfer = await this.transfersRepository.findById(id);

    if (!transfer) {
      throw new NotFoundException(`Transfer with ID ${id} not found`);
    }

    return transfer;
  }

  async process(id: string) {
    const transfer = await this.findOne(id);

    const finalStatuses: TransferStatus[] = [
      TransferStatus.SUCCESS,
      TransferStatus.FAILED,
      TransferStatus.CANCELED,
    ];
    if (finalStatuses.includes(transfer.status)) {
      throw new ConflictException(
        `Transfer is already in a final state: ${transfer.status}`,
      );
    }

    await this.transfersRepository.updateStatus(id, TransferStatus.PROCESSING);
    await this.auditService.log(AuditAction.TRANSFER_PROCESSING, id);

    this.logger.log(`Processing transfer ${transfer.reference}...`);

    try {
      const result = await this.providerSimulator.processTransfer(
        transfer.channel,
        transfer.id,
        transfer.amount,
        transfer.recipientPhone,
      );

      if (result.success) {
        const updatedTransfer = await this.transfersRepository.updateStatus(
          id,
          TransferStatus.SUCCESS,
          { providerRef: result.providerRef },
        );

        await this.auditService.log(AuditAction.TRANSFER_SUCCESS, id, {
          providerRef: result.providerRef,
        });

        this.logger.log(
          `Transfer ${transfer.reference} succeeded with ref ${result.providerRef}`,
        );

        return updatedTransfer;
      } else {
        const updatedTransfer = await this.transfersRepository.updateStatus(
          id,
          TransferStatus.FAILED,
          { errorCode: result.errorCode },
        );

        await this.auditService.log(AuditAction.TRANSFER_FAILED, id, {
          errorCode: result.errorCode,
        });

        this.logger.warn(
          `Transfer ${transfer.reference} failed with error ${result.errorCode}`,
        );

        return updatedTransfer;
      }
    } catch (error) {
      this.logger.error(
        `Error processing transfer ${transfer.reference}`,
        error instanceof Error ? error.stack : String(error),
      );

      const updatedTransfer = await this.transfersRepository.updateStatus(
        id,
        TransferStatus.FAILED,
        { errorCode: 'SYSTEM_ERROR' },
      );

      await this.auditService.log(AuditAction.TRANSFER_FAILED, id, {
        errorCode: 'SYSTEM_ERROR',
        error: error instanceof Error ? error.message : String(error),
      });

      return updatedTransfer;
    }
  }

  async cancel(id: string) {
    const transfer = await this.findOne(id);

    if (transfer.status !== TransferStatus.PENDING) {
      throw new ConflictException(
        `Only PENDING transfers can be canceled. Current status: ${transfer.status}`,
      );
    }

    const updatedTransfer = await this.transfersRepository.updateStatus(
      id,
      TransferStatus.CANCELED,
    );

    await this.auditService.log(AuditAction.TRANSFER_CANCELED, id);

    this.logger.log(`Transfer ${transfer.reference} has been canceled`);

    return updatedTransfer;
  }
}
