import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  Min,
  Max,
} from 'class-validator';

export enum TransferStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
}

export enum TransferChannel {
  WAVE = 'WAVE',
  ORANGE_MONEY = 'ORANGE_MONEY',
  FREE_MONEY = 'FREE_MONEY',
  MOOV_MONEY = 'MOOV_MONEY',
}

export class ListTransfersQueryDto {
  @ApiPropertyOptional({ enum: TransferStatus })
  @IsOptional()
  @IsEnum(TransferStatus)
  status?: TransferStatus;

  @ApiPropertyOptional({ enum: TransferChannel })
  @IsOptional()
  @IsEnum(TransferChannel)
  channel?: TransferChannel;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({
    example: 'TRF-20250101',
    description: 'Search in reference or recipient name',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 20, default: 20, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional({
    example: 'MTk1ZDFmOGYtOTQ3ZS00N2UwLWJiMjMtM2VjYjViMjU5N2M3',
    description:
      'Cursor for pagination. Use the nextCursor value from the previous response. Leave empty for the first page.',
  })
  @IsOptional()
  @IsString()
  cursor?: string;
}
