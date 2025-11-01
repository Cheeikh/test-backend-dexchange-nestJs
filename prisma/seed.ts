import { PrismaClient, TransferStatus, TransferChannel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  console.log('Cleaning up existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.apiKey.deleteMany();

  console.log('Creating API keys...');
  const apiKeys = await Promise.all([
    prisma.apiKey.create({
      data: {
        key: 'test-api-key-123',
        name: 'Test API Key',
        isActive: true,
      },
    }),
    prisma.apiKey.create({
      data: {
        key: 'dev-api-key-456',
        name: 'Development API Key',
        isActive: true,
      },
    }),
    prisma.apiKey.create({
      data: {
        key: 'prod-api-key-789',
        name: 'Production API Key',
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${apiKeys.length} API keys`);

  console.log('Creating sample transfers...');

  const transfers = [
    {
      reference: 'TRF-20250101-ABC1',
      amount: 12500,
      currency: 'XOF',
      channel: TransferChannel.WAVE,
      status: TransferStatus.SUCCESS,
      fees: 100,
      total: 12600,
      recipientPhone: '+221770000000',
      recipientName: 'Amadou Diallo',
      metadata: { orderId: 'ORD-001', source: 'mobile_app' },
      providerRef: 'WAVE-20250101-XYZ123',
    },
    {
      reference: 'TRF-20250101-ABC2',
      amount: 25000,
      currency: 'XOF',
      channel: TransferChannel.ORANGE_MONEY,
      status: TransferStatus.PENDING,
      fees: 200,
      total: 25200,
      recipientPhone: '+221775000000',
      recipientName: 'Fatou Sall',
      metadata: { orderId: 'ORD-002' },
    },
    {
      reference: 'TRF-20250101-ABC3',
      amount: 50000,
      currency: 'XOF',
      channel: TransferChannel.WAVE,
      status: TransferStatus.FAILED,
      fees: 400,
      total: 50400,
      recipientPhone: '+221776000000',
      recipientName: 'Ousmane Ndiaye',
      metadata: { orderId: 'ORD-003' },
      errorCode: 'INSUFFICIENT_FUNDS',
    },
    {
      reference: 'TRF-20250101-ABC4',
      amount: 100000,
      currency: 'XOF',
      channel: TransferChannel.FREE_MONEY,
      status: TransferStatus.PROCESSING,
      fees: 800,
      total: 100800,
      recipientPhone: '+221777000000',
      recipientName: 'Aissatou Ba',
      metadata: { orderId: 'ORD-004', priority: 'high' },
    },
    {
      reference: 'TRF-20250101-ABC5',
      amount: 15000,
      currency: 'XOF',
      channel: TransferChannel.MOOV_MONEY,
      status: TransferStatus.CANCELED,
      fees: 120,
      total: 15120,
      recipientPhone: '+221778000000',
      recipientName: 'Moussa Sarr',
      metadata: { orderId: 'ORD-005' },
    },
    {
      reference: 'TRF-20250101-ABC6',
      amount: 200000,
      currency: 'XOF',
      channel: TransferChannel.WAVE,
      status: TransferStatus.SUCCESS,
      fees: 1500,
      total: 201500,
      recipientPhone: '+221779000000',
      recipientName: 'Mariama Diop',
      metadata: { orderId: 'ORD-006', vip: true },
      providerRef: 'WAVE-20250101-ABC789',
    },
    {
      reference: 'TRF-20250102-DEF1',
      amount: 5000,
      currency: 'XOF',
      channel: TransferChannel.ORANGE_MONEY,
      status: TransferStatus.PENDING,
      fees: 100,
      total: 5100,
      recipientPhone: '+221770111111',
      recipientName: 'Ibrahima Fall',
      metadata: { orderId: 'ORD-007' },
    },
    {
      reference: 'TRF-20250102-DEF2',
      amount: 75000,
      currency: 'XOF',
      channel: TransferChannel.WAVE,
      status: TransferStatus.SUCCESS,
      fees: 600,
      total: 75600,
      recipientPhone: '+221770222222',
      recipientName: 'Khady Gueye',
      metadata: { orderId: 'ORD-008' },
      providerRef: 'WAVE-20250102-MNOP456',
    },
    {
      reference: 'TRF-20250102-DEF3',
      amount: 30000,
      currency: 'XOF',
      channel: TransferChannel.FREE_MONEY,
      status: TransferStatus.FAILED,
      fees: 240,
      total: 30240,
      recipientPhone: '+221770333333',
      recipientName: 'Modou Kebe',
      metadata: { orderId: 'ORD-009' },
      errorCode: 'PROVIDER_TIMEOUT',
    },
    {
      reference: 'TRF-20250102-DEF4',
      amount: 10000,
      currency: 'XOF',
      channel: TransferChannel.MOOV_MONEY,
      status: TransferStatus.PENDING,
      fees: 100,
      total: 10100,
      recipientPhone: '+221770444444',
      recipientName: 'Seynabou Cisse',
      metadata: { orderId: 'ORD-010' },
    },
    // Additional transfers for pagination testing (21-30)
    {
      reference: 'TRF-20250103-GHI1',
      amount: 8000,
      currency: 'XOF',
      channel: TransferChannel.WAVE,
      status: TransferStatus.PENDING,
      fees: 100,
      total: 8100,
      recipientPhone: '+221770555555',
      recipientName: 'Awa Diop',
      metadata: { orderId: 'ORD-011' },
    },
    {
      reference: 'TRF-20250103-GHI2',
      amount: 45000,
      currency: 'XOF',
      channel: TransferChannel.ORANGE_MONEY,
      status: TransferStatus.SUCCESS,
      fees: 360,
      total: 45360,
      recipientPhone: '+221770666666',
      recipientName: 'Mamadou Kane',
      metadata: { orderId: 'ORD-012' },
      providerRef: 'OM-20250103-KLM789',
    },
    {
      reference: 'TRF-20250103-GHI3',
      amount: 22000,
      currency: 'XOF',
      channel: TransferChannel.FREE_MONEY,
      status: TransferStatus.PENDING,
      fees: 176,
      total: 22176,
      recipientPhone: '+221770777777',
      recipientName: 'Bineta Sow',
      metadata: { orderId: 'ORD-013' },
    },
    {
      reference: 'TRF-20250103-GHI4',
      amount: 90000,
      currency: 'XOF',
      channel: TransferChannel.WAVE,
      status: TransferStatus.SUCCESS,
      fees: 720,
      total: 90720,
      recipientPhone: '+221770888888',
      recipientName: 'Cheikh Sy',
      metadata: { orderId: 'ORD-014', express: true },
      providerRef: 'WAVE-20250103-PQR456',
    },
    {
      reference: 'TRF-20250103-GHI5',
      amount: 35000,
      currency: 'XOF',
      channel: TransferChannel.MOOV_MONEY,
      status: TransferStatus.FAILED,
      fees: 280,
      total: 35280,
      recipientPhone: '+221770999999',
      recipientName: 'Coumba Faye',
      metadata: { orderId: 'ORD-015' },
      errorCode: 'ACCOUNT_NOT_FOUND',
    },
    {
      reference: 'TRF-20250104-JKL1',
      amount: 18000,
      currency: 'XOF',
      channel: TransferChannel.WAVE,
      status: TransferStatus.PENDING,
      fees: 144,
      total: 18144,
      recipientPhone: '+221771000000',
      recipientName: 'Abdoulaye Niang',
      metadata: { orderId: 'ORD-016' },
    },
    {
      reference: 'TRF-20250104-JKL2',
      amount: 60000,
      currency: 'XOF',
      channel: TransferChannel.ORANGE_MONEY,
      status: TransferStatus.SUCCESS,
      fees: 480,
      total: 60480,
      recipientPhone: '+221771111111',
      recipientName: 'Sokhna Mbaye',
      metadata: { orderId: 'ORD-017' },
      providerRef: 'OM-20250104-STU123',
    },
    {
      reference: 'TRF-20250104-JKL3',
      amount: 7500,
      currency: 'XOF',
      channel: TransferChannel.FREE_MONEY,
      status: TransferStatus.PENDING,
      fees: 100,
      total: 7600,
      recipientPhone: '+221771222222',
      recipientName: 'Lamine Diagne',
      metadata: { orderId: 'ORD-018' },
    },
    {
      reference: 'TRF-20250104-JKL4',
      amount: 125000,
      currency: 'XOF',
      channel: TransferChannel.WAVE,
      status: TransferStatus.SUCCESS,
      fees: 1000,
      total: 126000,
      recipientPhone: '+221771333333',
      recipientName: 'Ndeye Thiam',
      metadata: { orderId: 'ORD-019', vip: true },
      providerRef: 'WAVE-20250104-VWX789',
    },
    {
      reference: 'TRF-20250104-JKL5',
      amount: 42000,
      currency: 'XOF',
      channel: TransferChannel.MOOV_MONEY,
      status: TransferStatus.FAILED,
      fees: 336,
      total: 42336,
      recipientPhone: '+221771444444',
      recipientName: 'Babacar Diouf',
      metadata: { orderId: 'ORD-020' },
      errorCode: 'DAILY_LIMIT_EXCEEDED',
    },
    {
      reference: 'TRF-20250105-MNO1',
      amount: 16000,
      currency: 'XOF',
      channel: TransferChannel.WAVE,
      status: TransferStatus.PENDING,
      fees: 128,
      total: 16128,
      recipientPhone: '+221771555555',
      recipientName: 'Penda Cissé',
      metadata: { orderId: 'ORD-021' },
    },
    {
      reference: 'TRF-20250105-MNO2',
      amount: 85000,
      currency: 'XOF',
      channel: TransferChannel.ORANGE_MONEY,
      status: TransferStatus.SUCCESS,
      fees: 680,
      total: 85680,
      recipientPhone: '+221771666666',
      recipientName: 'Youssou Ndour',
      metadata: { orderId: 'ORD-022' },
      providerRef: 'OM-20250105-YZA456',
    },
    {
      reference: 'TRF-20250105-MNO3',
      amount: 28000,
      currency: 'XOF',
      channel: TransferChannel.FREE_MONEY,
      status: TransferStatus.PENDING,
      fees: 224,
      total: 28224,
      recipientPhone: '+221771777777',
      recipientName: 'Astou Seck',
      metadata: { orderId: 'ORD-023' },
    },
    {
      reference: 'TRF-20250105-MNO4',
      amount: 150000,
      currency: 'XOF',
      channel: TransferChannel.WAVE,
      status: TransferStatus.SUCCESS,
      fees: 1200,
      total: 151200,
      recipientPhone: '+221771888888',
      recipientName: 'Alioune Badara',
      metadata: { orderId: 'ORD-024', priority: 'high' },
      providerRef: 'WAVE-20250105-BCD123',
    },
    {
      reference: 'TRF-20250105-MNO5',
      amount: 38000,
      currency: 'XOF',
      channel: TransferChannel.MOOV_MONEY,
      status: TransferStatus.FAILED,
      fees: 304,
      total: 38304,
      recipientPhone: '+221771999999',
      recipientName: 'Mariétou Diallo',
      metadata: { orderId: 'ORD-025' },
      errorCode: 'NETWORK_ERROR',
    },
    {
      reference: 'TRF-20250106-PQR1',
      amount: 9500,
      currency: 'XOF',
      channel: TransferChannel.WAVE,
      status: TransferStatus.PENDING,
      fees: 100,
      total: 9600,
      recipientPhone: '+221772000000',
      recipientName: 'Bassirou Faye',
      metadata: { orderId: 'ORD-026' },
    },
    {
      reference: 'TRF-20250106-PQR2',
      amount: 72000,
      currency: 'XOF',
      channel: TransferChannel.ORANGE_MONEY,
      status: TransferStatus.SUCCESS,
      fees: 576,
      total: 72576,
      recipientPhone: '+221772111111',
      recipientName: 'Ndèye Diop',
      metadata: { orderId: 'ORD-027' },
      providerRef: 'OM-20250106-EFG789',
    },
    {
      reference: 'TRF-20250106-PQR3',
      amount: 14000,
      currency: 'XOF',
      channel: TransferChannel.FREE_MONEY,
      status: TransferStatus.PENDING,
      fees: 112,
      total: 14112,
      recipientPhone: '+221772222222',
      recipientName: 'Malick Gaye',
      metadata: { orderId: 'ORD-028' },
    },
    {
      reference: 'TRF-20250106-PQR4',
      amount: 95000,
      currency: 'XOF',
      channel: TransferChannel.WAVE,
      status: TransferStatus.SUCCESS,
      fees: 760,
      total: 95760,
      recipientPhone: '+221772333333',
      recipientName: 'Rama Sarr',
      metadata: { orderId: 'ORD-029' },
      providerRef: 'WAVE-20250106-HIJ456',
    },
    {
      reference: 'TRF-20250106-PQR5',
      amount: 52000,
      currency: 'XOF',
      channel: TransferChannel.MOOV_MONEY,
      status: TransferStatus.CANCELED,
      fees: 416,
      total: 52416,
      recipientPhone: '+221772444444',
      recipientName: 'El Hadji Diouf',
      metadata: { orderId: 'ORD-030' },
    },
  ];

  const createdTransfers = await Promise.all(
    transfers.map((transfer) => prisma.transfer.create({ data: transfer })),
  );

  console.log(`Created ${createdTransfers.length} transfers`);

  console.log('Creating audit logs...');
  const auditLogs: any[] = [];

  for (const transfer of createdTransfers) {
    auditLogs.push(
      prisma.auditLog.create({
        data: {
          action: 'TRANSFER_CREATED',
          transferId: transfer.id,
          metadata: {
            amount: transfer.amount,
            channel: transfer.channel,
          },
        },
      }),
    );

    if (transfer.status === TransferStatus.SUCCESS) {
      auditLogs.push(
        prisma.auditLog.create({
          data: {
            action: 'TRANSFER_PROCESSING',
            transferId: transfer.id,
            metadata: {},
          },
        }),
      );

      auditLogs.push(
        prisma.auditLog.create({
          data: {
            action: 'TRANSFER_SUCCESS',
            transferId: transfer.id,
            metadata: {
              providerRef: transfer.providerRef,
            },
          },
        }),
      );
    } else if (transfer.status === TransferStatus.FAILED) {
      auditLogs.push(
        prisma.auditLog.create({
          data: {
            action: 'TRANSFER_PROCESSING',
            transferId: transfer.id,
            metadata: {},
          },
        }),
      );

      auditLogs.push(
        prisma.auditLog.create({
          data: {
            action: 'TRANSFER_FAILED',
            transferId: transfer.id,
            metadata: {
              errorCode: transfer.errorCode,
            },
          },
        }),
      );
    } else if (transfer.status === TransferStatus.CANCELED) {
      auditLogs.push(
        prisma.auditLog.create({
          data: {
            action: 'TRANSFER_CANCELED',
            transferId: transfer.id,
            metadata: {},
          },
        }),
      );
    } else if (transfer.status === TransferStatus.PROCESSING) {
      auditLogs.push(
        prisma.auditLog.create({
          data: {
            action: 'TRANSFER_PROCESSING',
            transferId: transfer.id,
            metadata: {},
          },
        }),
      );
    }
  }

  await Promise.all(auditLogs);

  console.log(`Created ${auditLogs.length} audit logs`);

  console.log('Seed completed successfully!');
  console.log('\nSummary:');
  console.log(`- API Keys: ${apiKeys.length}`);
  console.log(`- Transfers: ${createdTransfers.length}`);
  console.log(`- Audit Logs: ${auditLogs.length}`);
  console.log('\nAvailable API Keys:');
  apiKeys.forEach((key) => {
    console.log(`  - ${key.name}: ${key.key}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
