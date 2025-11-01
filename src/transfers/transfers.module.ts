import { Module } from '@nestjs/common';

import {
  ProviderSimulator,
  WaveAdapter,
  OrangeMoneyAdapter,
  FreeMoneyAdapter,
  MoovMoneyAdapter,
} from './provider.simulator';
import { TransfersController } from './transfers.controller';
import { TransfersRepository } from './transfers.repository';
import { TransfersService } from './transfers.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [TransfersController],
  providers: [
    TransfersService,
    TransfersRepository,
    ProviderSimulator,
    WaveAdapter,
    OrangeMoneyAdapter,
    FreeMoneyAdapter,
    MoovMoneyAdapter,
  ],
})
export class TransfersModule {}
