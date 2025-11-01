import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TransferStatus } from '@prisma/client';

import { AuditService } from '../audit/audit.service';
import { TransferChannel } from './dto/create-transfer.dto';
import { ProviderSimulator } from './provider.simulator';
import { TransfersRepository } from './transfers.repository';
import { TransfersService } from './transfers.service';

describe('TransfersService', () => {
  let service: TransfersService;

  const mockConfigService = {
    get: jest.fn(
      (key: string, defaultValue?: number | string): number | string => {
        const config: Record<string, number | string> = {
          FEE_PERCENTAGE: 0.8,
          MIN_FEE: 100,
          MAX_FEE: 1500,
          DEFAULT_CURRENCY: 'XOF',
        };
        return config[key] ?? defaultValue ?? '';
      },
    ),
  };

  const mockRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
    findMany: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockProviderSimulator = {
    processTransfer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransfersService,
        {
          provide: TransfersRepository,
          useValue: mockRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        {
          provide: ProviderSimulator,
          useValue: mockProviderSimulator,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<TransfersService>(TransfersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateFees', () => {
    it('should calculate fees correctly with 0.8%', () => {
      const amount = 15000;
      const fees = service.calculateFees(amount);
      expect(fees).toBe(120);
    });

    it('should apply minimum fee of 100', () => {
      const amount = 5000;
      const fees = service.calculateFees(amount);
      expect(fees).toBe(100);
    });

    it('should apply maximum fee of 1500', () => {
      const amount = 300000;
      const fees = service.calculateFees(amount);
      expect(fees).toBe(1500);
    });

    it('should round up fees to nearest integer', () => {
      const amount = 12500;
      const fees = service.calculateFees(amount);
      expect(fees).toBe(100);
    });
  });

  describe('generateReference', () => {
    it('should generate a unique reference in correct format', () => {
      const reference = service.generateReference();
      const pattern = /^TRF-\d{8}-[A-Z0-9]{4}$/;
      expect(reference).toMatch(pattern);
    });

    it('should generate different references on consecutive calls', () => {
      const ref1 = service.generateReference();
      const ref2 = service.generateReference();
      expect(ref1).not.toBe(ref2);
    });
  });

  describe('create', () => {
    it('should create a transfer with correct calculations', async () => {
      const createDto = {
        amount: 12500,
        currency: 'XOF',
        channel: TransferChannel.WAVE,
        recipient: {
          phone: '+221770000000',
          name: 'Jane Doe',
        },
        metadata: { orderId: 'ABC-123' },
      };

      const mockTransfer = {
        ...createDto,
        id: '123',
        reference: 'TRF-20250101-ABCD',
        fees: 100,
        total: 12600,
        status: TransferStatus.PENDING,
      };

      mockRepository.create.mockResolvedValue(mockTransfer);

      const result = await service.create(createDto);

      expect(result).toEqual(mockTransfer);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 12500,
          fees: 100,
          total: 12600,
        }),
      );
      expect(mockAuditService.log).toHaveBeenCalled();
    });
  });

  describe('process', () => {
    it('should successfully process a PENDING transfer', async () => {
      const transferId = '123';
      const mockTransfer = {
        id: transferId,
        reference: 'TRF-20250101-ABCD',
        status: TransferStatus.PENDING,
        channel: TransferChannel.WAVE,
        amount: 12500,
        recipientPhone: '+221770000000',
      };

      const mockProcessResult = {
        success: true,
        providerRef: 'WAVE-123456',
      };

      const mockUpdatedTransfer = {
        ...mockTransfer,
        status: TransferStatus.SUCCESS,
        providerRef: 'WAVE-123456',
      };

      mockRepository.findById.mockResolvedValue(mockTransfer);
      mockRepository.updateStatus.mockResolvedValueOnce({
        ...mockTransfer,
        status: TransferStatus.PROCESSING,
      });
      mockRepository.updateStatus.mockResolvedValueOnce(mockUpdatedTransfer);
      mockProviderSimulator.processTransfer.mockResolvedValue(
        mockProcessResult,
      );

      const result = await service.process(transferId);

      expect(result.status).toBe(TransferStatus.SUCCESS);
      expect(result.providerRef).toBe('WAVE-123456');
      expect(mockRepository.updateStatus).toHaveBeenCalledTimes(2);
    });

    it('should handle failed transfer processing', async () => {
      const transferId = '123';
      const mockTransfer = {
        id: transferId,
        reference: 'TRF-20250101-ABCD',
        status: TransferStatus.PENDING,
        channel: TransferChannel.WAVE,
        amount: 12500,
        recipientPhone: '+221770000000',
      };

      const mockProcessResult = {
        success: false,
        errorCode: 'INSUFFICIENT_FUNDS',
      };

      mockRepository.findById.mockResolvedValue(mockTransfer);
      mockRepository.updateStatus.mockResolvedValueOnce({
        ...mockTransfer,
        status: TransferStatus.PROCESSING,
      });
      mockRepository.updateStatus.mockResolvedValueOnce({
        ...mockTransfer,
        status: TransferStatus.FAILED,
        errorCode: 'INSUFFICIENT_FUNDS',
      });
      mockProviderSimulator.processTransfer.mockResolvedValue(
        mockProcessResult,
      );

      const result = await service.process(transferId);

      expect(result.status).toBe(TransferStatus.FAILED);
      expect(result.errorCode).toBe('INSUFFICIENT_FUNDS');
    });

    it('should throw ConflictException when transfer is in final state', async () => {
      const transferId = '123';
      const mockTransfer = {
        id: transferId,
        status: TransferStatus.SUCCESS,
      };

      mockRepository.findById.mockResolvedValue(mockTransfer);

      await expect(service.process(transferId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException when transfer does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.process('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a PENDING transfer', async () => {
      const transferId = '123';
      const mockTransfer = {
        id: transferId,
        reference: 'TRF-20250101-ABCD',
        status: TransferStatus.PENDING,
      };

      const mockCanceledTransfer = {
        ...mockTransfer,
        status: TransferStatus.CANCELED,
      };

      mockRepository.findById.mockResolvedValue(mockTransfer);
      mockRepository.updateStatus.mockResolvedValue(mockCanceledTransfer);

      const result = await service.cancel(transferId);

      expect(result.status).toBe(TransferStatus.CANCELED);
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw ConflictException when trying to cancel non-PENDING transfer', async () => {
      const transferId = '123';
      const mockTransfer = {
        id: transferId,
        status: TransferStatus.SUCCESS,
      };

      mockRepository.findById.mockResolvedValue(mockTransfer);

      await expect(service.cancel(transferId)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
