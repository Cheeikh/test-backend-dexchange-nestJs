import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  ValidateNested,
  Min,
} from 'class-validator';

import { IsPhoneNumber } from '../../common/validators/is-phone-number.validator';
import { IsValidCurrency } from '../../common/validators/is-valid-currency.validator';

export enum TransferChannel {
  WAVE = 'WAVE',
  ORANGE_MONEY = 'ORANGE_MONEY',
  FREE_MONEY = 'FREE_MONEY',
  MOOV_MONEY = 'MOOV_MONEY',
}

export class RecipientDto {
  @ApiProperty({
    example: '+221770000000',
    description: 'Phone number in E.164 format',
  })
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber()
  phone!: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsNotEmpty()
  @IsString()
  name!: string;
}

export class CreateTransferDto {
  @ApiProperty({ example: 12500, description: 'Amount in XOF' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiProperty({
    example: 'XOF',
    default: 'XOF',
    description: 'Currency code (XOF, XAF, USD, EUR, etc.)',
  })
  @IsOptional()
  @IsString()
  @IsValidCurrency()
  currency?: string;

  @ApiProperty({ enum: TransferChannel, example: TransferChannel.WAVE })
  @IsNotEmpty()
  @IsEnum(TransferChannel)
  channel!: TransferChannel;

  @ApiProperty({ type: RecipientDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RecipientDto)
  recipient!: RecipientDto;

  @ApiProperty({ example: { orderId: 'ABC-123' }, required: false })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
