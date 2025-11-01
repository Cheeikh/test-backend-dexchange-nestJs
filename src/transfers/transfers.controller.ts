import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

import { CreateTransferDto } from './dto/create-transfer.dto';
import { ListTransfersQueryDto } from './dto/list-transfers.dto';
import {
  TransferResponseDto,
  PaginatedTransfersResponseDto,
} from './dto/transfer-response.dto';
import { TransfersService } from './transfers.service';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@ApiTags('Transfers')
@ApiSecurity('x-api-key')
@Controller('transfers')
@UseGuards(ApiKeyGuard)
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transfer' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Transfer successfully created',
    type: TransferResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'API key is missing',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Invalid API key' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async create(
    @Body() createTransferDto: CreateTransferDto,
  ): Promise<TransferResponseDto> {
    return this.transfersService.create(createTransferDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transfers with filters and pagination' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELED'],
  })
  @ApiQuery({
    name: 'channel',
    required: false,
    enum: ['WAVE', 'ORANGE_MONEY', 'FREE_MONEY', 'MOOV_MONEY'],
  })
  @ApiQuery({ name: 'minAmount', required: false, type: Number })
  @ApiQuery({ name: 'maxAmount', required: false, type: Number })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search in reference or recipient name',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description:
      'Cursor for pagination. Leave empty for first page, then use nextCursor from response.',
    example: 'MTk1ZDFmOGYtOTQ3ZS00N2UwLWJiMjMtM2VjYjViMjU5N2M3',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of transfers',
    type: PaginatedTransfersResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'API key is missing',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Invalid API key' })
  async findAll(
    @Query() query: ListTransfersQueryDto,
  ): Promise<PaginatedTransfersResponseDto> {
    return this.transfersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transfer by ID' })
  @ApiParam({ name: 'id', description: 'Transfer ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transfer found',
    type: TransferResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transfer not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'API key is missing',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Invalid API key' })
  async findOne(@Param('id') id: string): Promise<TransferResponseDto> {
    return this.transfersService.findOne(id);
  }

  @Post(':id/process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process a transfer' })
  @ApiParam({ name: 'id', description: 'Transfer ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transfer processed successfully',
    type: TransferResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transfer not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Transfer is already in a final state',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'API key is missing',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Invalid API key' })
  async process(@Param('id') id: string): Promise<TransferResponseDto> {
    return this.transfersService.process(id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a transfer' })
  @ApiParam({ name: 'id', description: 'Transfer ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transfer canceled successfully',
    type: TransferResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transfer not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Only PENDING transfers can be canceled',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'API key is missing',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Invalid API key' })
  async cancel(@Param('id') id: string): Promise<TransferResponseDto> {
    return this.transfersService.cancel(id);
  }
}
