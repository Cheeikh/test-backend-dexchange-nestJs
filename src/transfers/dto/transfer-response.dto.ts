import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

export class TransferResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'TRF-20250101-AB12' })
  reference!: string;

  @ApiProperty({ example: 12500 })
  amount!: number;

  @ApiProperty({ example: 'XOF' })
  currency!: string;

  @ApiProperty({ example: 'WAVE' })
  channel!: string;

  @ApiProperty({ example: 'PENDING' })
  status!: string;

  @ApiProperty({ example: 100 })
  fees!: number;

  @ApiProperty({ example: 12600 })
  total!: number;

  @ApiProperty({ example: '+221770000000' })
  recipientPhone!: string;

  @ApiProperty({ example: 'Jane Doe' })
  recipientName!: string;

  @ApiPropertyOptional({ example: { orderId: 'ABC-123' }, nullable: true })
  metadata?: Prisma.JsonValue | null;

  @ApiPropertyOptional({ example: 'WAVE-REF-123456', nullable: true })
  providerRef?: string | null;

  @ApiPropertyOptional({ example: 'INSUFFICIENT_FUNDS', nullable: true })
  errorCode?: string | null;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2025-01-01T10:05:00.000Z' })
  updatedAt!: Date;
}

export class PaginatedTransfersResponseDto {
  @ApiProperty({ type: [TransferResponseDto] })
  items!: TransferResponseDto[];

  @ApiPropertyOptional({
    example: 'MTk1ZDFmOGYtOTQ3ZS00N2UwLWJiMjMtM2VjYjViMjU5N2M3',
    description:
      'Cursor for the next page. Use this value in the cursor query parameter to fetch the next page. Null if no more results.',
  })
  nextCursor?: string;
}
