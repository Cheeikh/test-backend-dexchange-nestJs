import { Injectable, Logger } from '@nestjs/common';

export interface ProcessResult {
  success: boolean;
  providerRef?: string;
  errorCode?: string;
}

export interface ProviderAdapter {
  process(
    transferId: string,
    amount: number,
    recipientPhone: string,
  ): Promise<ProcessResult>;
}

@Injectable()
export class WaveAdapter implements ProviderAdapter {
  private readonly logger = new Logger(WaveAdapter.name);

  async process(
    transferId: string,
    amount: number,
    recipientPhone: string,
  ): Promise<ProcessResult> {
    this.logger.log(
      `Processing transfer ${transferId} via WAVE for ${amount} to ${recipientPhone}`,
    );

    await this.simulateDelay();

    const random = Math.random();
    const successRate = 0.7;

    if (random < successRate) {
      return {
        success: true,
        providerRef: `WAVE-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      };
    } else {
      const errors = [
        'INSUFFICIENT_FUNDS',
        'INVALID_PHONE',
        'PROVIDER_TIMEOUT',
        'DAILY_LIMIT_EXCEEDED',
      ];
      return {
        success: false,
        errorCode: errors[Math.floor(Math.random() * errors.length)],
      };
    }
  }

  private async simulateDelay(): Promise<void> {
    const delay = 2000 + Math.random() * 1000;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

@Injectable()
export class OrangeMoneyAdapter implements ProviderAdapter {
  private readonly logger = new Logger(OrangeMoneyAdapter.name);

  async process(
    transferId: string,
    amount: number,
    recipientPhone: string,
  ): Promise<ProcessResult> {
    this.logger.log(
      `Processing transfer ${transferId} via Orange Money for ${amount} to ${recipientPhone}`,
    );

    await this.simulateDelay();

    const random = Math.random();
    const successRate = 0.7;

    if (random < successRate) {
      return {
        success: true,
        providerRef: `OM-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      };
    } else {
      const errors = [
        'ACCOUNT_NOT_FOUND',
        'SERVICE_UNAVAILABLE',
        'INVALID_AMOUNT',
        'FRAUD_DETECTED',
      ];
      return {
        success: false,
        errorCode: errors[Math.floor(Math.random() * errors.length)],
      };
    }
  }

  private async simulateDelay(): Promise<void> {
    const delay = 2000 + Math.random() * 1000;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

@Injectable()
export class FreeMoneyAdapter implements ProviderAdapter {
  private readonly logger = new Logger(FreeMoneyAdapter.name);

  async process(
    transferId: string,
    amount: number,
    recipientPhone: string,
  ): Promise<ProcessResult> {
    this.logger.log(
      `Processing transfer ${transferId} via Free Money for ${amount} to ${recipientPhone}`,
    );

    await this.simulateDelay();

    const random = Math.random();
    const successRate = 0.7;

    if (random < successRate) {
      return {
        success: true,
        providerRef: `FREE-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      };
    } else {
      const errors = ['NETWORK_ERROR', 'RECIPIENT_BLOCKED', 'MAINTENANCE_MODE'];
      return {
        success: false,
        errorCode: errors[Math.floor(Math.random() * errors.length)],
      };
    }
  }

  private async simulateDelay(): Promise<void> {
    const delay = 2000 + Math.random() * 1000;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

@Injectable()
export class MoovMoneyAdapter implements ProviderAdapter {
  private readonly logger = new Logger(MoovMoneyAdapter.name);

  async process(
    transferId: string,
    amount: number,
    recipientPhone: string,
  ): Promise<ProcessResult> {
    this.logger.log(
      `Processing transfer ${transferId} via Moov Money for ${amount} to ${recipientPhone}`,
    );

    await this.simulateDelay();

    const random = Math.random();
    const successRate = 0.7;

    if (random < successRate) {
      return {
        success: true,
        providerRef: `MOOV-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      };
    } else {
      const errors = ['TRANSACTION_REJECTED', 'KYC_REQUIRED', 'BLACKLISTED'];
      return {
        success: false,
        errorCode: errors[Math.floor(Math.random() * errors.length)],
      };
    }
  }

  private async simulateDelay(): Promise<void> {
    const delay = 2000 + Math.random() * 1000;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

@Injectable()
export class ProviderSimulator {
  private readonly logger = new Logger(ProviderSimulator.name);
  private readonly adapters: Map<string, ProviderAdapter>;

  constructor(
    private waveAdapter: WaveAdapter,
    private orangeMoneyAdapter: OrangeMoneyAdapter,
    private freeMoneyAdapter: FreeMoneyAdapter,
    private moovMoneyAdapter: MoovMoneyAdapter,
  ) {
    this.adapters = new Map<string, ProviderAdapter>([
      ['WAVE', this.waveAdapter as ProviderAdapter],
      ['ORANGE_MONEY', this.orangeMoneyAdapter as ProviderAdapter],
      ['FREE_MONEY', this.freeMoneyAdapter as ProviderAdapter],
      ['MOOV_MONEY', this.moovMoneyAdapter as ProviderAdapter],
    ]);
  }

  async processTransfer(
    channel: string,
    transferId: string,
    amount: number,
    recipientPhone: string,
  ): Promise<ProcessResult> {
    const adapter = this.adapters.get(channel);

    if (!adapter) {
      this.logger.error(`No adapter found for channel: ${channel}`);
      return {
        success: false,
        errorCode: 'UNSUPPORTED_CHANNEL',
      };
    }

    try {
      return await adapter.process(transferId, amount, recipientPhone);
    } catch (error) {
      this.logger.error(`Error processing transfer via ${channel}`, error);
      return {
        success: false,
        errorCode: 'PROVIDER_ERROR',
      };
    }
  }
}
