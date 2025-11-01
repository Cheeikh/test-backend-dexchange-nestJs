# Transfer Management API

> 🇬🇧 English version | [🇫🇷 Version française](./README.md)

A comprehensive RESTful API for managing money transfers with support for multiple payment channels (WAVE, Orange Money, Free Money, Moov Money). Built with NestJS, Prisma, and PostgreSQL (Neon DB).

## Features

- **API Key Authentication**: Secure endpoints with header-based API key authentication
- **Transfer Management**: Create, retrieve, process, and cancel transfers
- **Multiple Payment Channels**: Support for WAVE, Orange Money, Free Money, and Moov Money
- **Business Rules**: Automatic fee calculation (0.8%, min 100, max 1500 XOF)
- **State Management**: Controlled state transitions (PENDING → PROCESSING → SUCCESS/FAILED)
- **Audit Logging**: Complete audit trail for all transfer operations
- **Cursor-based Pagination**: Efficient pagination with filtering capabilities
- **Provider Simulation**: Realistic transfer processing simulation (70% success rate)
- **Swagger Documentation**: Interactive API documentation at `/docs`
- **Unit & E2E Tests**: Comprehensive test coverage
- **Docker Support**: Ready for containerized deployment

## Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon DB)
- **ORM**: Prisma 5
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest, Supertest
- **Package Manager**: pnpm

## Prerequisites

- Node.js 20+
- pnpm (or npm/yarn)
- PostgreSQL database (Neon DB account recommended)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd test-backend-dexchange-nestJs
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Application
NODE_ENV=development
PORT=3000

# Database (Neon DB)
DATABASE_URL="postgresql://user:password@host.neon.tech:5432/transferdb?sslmode=require"

# API Keys (comma-separated)
API_KEYS="test-api-key-123,dev-api-key-456"

# Transfer Configuration
DEFAULT_CURRENCY=XOF
FEE_PERCENTAGE=0.8
MIN_FEE=100
MAX_FEE=1500

# Provider Simulation
SUCCESS_RATE=0.7
```

### 4. Database Setup

Generate Prisma client:

```bash
pnpm prisma:generate
```

Run migrations:

```bash
pnpm prisma:migrate
```

Seed the database with sample data:

```bash
pnpm seed
```

### 5. Start the application

Development mode:

```bash
pnpm start:dev
```

Production mode:

```bash
pnpm build
pnpm start:prod
```

The API will be available at `http://localhost:3000`

Swagger documentation: `http://localhost:3000/docs`

## API Endpoints

All endpoints require the `x-api-key` header for authentication.

### Create Transfer

```http
POST /transfers
Content-Type: application/json
x-api-key: test-api-key-123

{
  "amount": 12500,
  "currency": "XOF",
  "channel": "WAVE",
  "recipient": {
    "phone": "+221770000000",
    "name": "Jane Doe"
  },
  "metadata": {
    "orderId": "ABC-123"
  }
}
```

**Response** (201 Created):

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "reference": "TRF-20250101-AB12",
  "amount": 12500,
  "currency": "XOF",
  "channel": "WAVE",
  "status": "PENDING",
  "fees": 100,
  "total": 12600,
  "recipientPhone": "+221770000000",
  "recipientName": "Jane Doe",
  "metadata": { "orderId": "ABC-123" },
  "createdAt": "2025-01-01T10:00:00.000Z",
  "updatedAt": "2025-01-01T10:00:00.000Z"
}
```

### List Transfers

```http
GET /transfers?status=PENDING&channel=WAVE&limit=20&cursor=base64cursor
x-api-key: test-api-key-123
```

**Query Parameters**:
- `status`: Filter by status (PENDING, PROCESSING, SUCCESS, FAILED, CANCELED)
- `channel`: Filter by channel (WAVE, ORANGE_MONEY, FREE_MONEY, MOOV_MONEY)
- `minAmount`: Minimum amount filter
- `maxAmount`: Maximum amount filter
- `q`: Search in reference or recipient name
- `limit`: Results per page (max 50, default 20)
- `cursor`: Cursor for pagination

**Response** (200 OK):

```json
{
  "items": [
    {
      "id": "...",
      "reference": "TRF-20250101-AB12",
      "amount": 12500,
      "status": "PENDING",
      ...
    }
  ],
  "nextCursor": "base64-encoded-cursor"
}
```

### Get Transfer by ID

```http
GET /transfers/:id
x-api-key: test-api-key-123
```

**Response** (200 OK): Transfer object

### Process Transfer

```http
POST /transfers/:id/process
x-api-key: test-api-key-123
```

**⚠️ Important**: This endpoint simulates real provider processing with:
- **70% success rate** → Status becomes `SUCCESS` with a `providerRef`
- **30% failure rate** → Status becomes `FAILED` with an `errorCode`
- **2-3 seconds delay** to simulate real processing time

**Response** (200 OK): Updated transfer with status `SUCCESS` or `FAILED`

**Success example**:
```json
{
  "id": "...",
  "status": "SUCCESS",
  "providerRef": "WAVE-1730461234-XY7K",
  "errorCode": null
}
```

**Failure example**:
```json
{
  "id": "...",
  "status": "FAILED",
  "providerRef": null,
  "errorCode": "PROVIDER_TIMEOUT"
}
```

**Note**: If a transfer fails, it becomes final and cannot be processed again. Use a different PENDING transfer to test again. The seed creates 10 PENDING transfers for testing.

### Cancel Transfer

```http
POST /transfers/:id/cancel
x-api-key: test-api-key-123
```

Only PENDING transfers can be canceled.

**Response** (200 OK): Updated transfer with status CANCELED

## Business Rules

### Fee Calculation

Fees are calculated as follows:
- **Rate**: 0.8% of transfer amount (rounded up)
- **Minimum**: 100 XOF
- **Maximum**: 1500 XOF

Examples:
- Amount: 5,000 → Fees: 100 (minimum applied)
- Amount: 12,500 → Fees: 100 (0.8% = 100)
- Amount: 50,000 → Fees: 400 (0.8% = 400)
- Amount: 300,000 → Fees: 1,500 (maximum applied)

### State Flow

```
PENDING → PROCESSING → SUCCESS | FAILED
   ↓
CANCELED
```

- **PENDING**: Transfer created, awaiting processing
- **PROCESSING**: Transfer being processed by provider (takes 2-3 seconds)
- **SUCCESS**: Transfer completed successfully (**70% probability** in simulation)
- **FAILED**: Transfer failed (**30% probability** in simulation)
- **CANCELED**: Transfer canceled by user (only from PENDING state)

**⚠️ Important**: Final states (SUCCESS, FAILED, CANCELED) cannot be changed or reprocessed.

**For testing**: If a transfer fails during processing, you must use a different PENDING transfer to test again. The seed script creates **10 PENDING transfers** specifically for testing the process endpoint multiple times.

### Reference Generation

Format: `TRF-YYYYMMDD-XXXX`

Example: `TRF-20250101-AB12`

## Testing

### Run unit tests

```bash
pnpm test
```

### Run e2e tests

```bash
pnpm test:e2e
```

### Run tests with coverage

```bash
pnpm test:cov
```

### Manual testing via Swagger

The seed script creates **10 PENDING transfers** for easy testing. Access Swagger at `http://localhost:3000/docs`.

**Testing the process endpoint**:

1. Get a list of PENDING transfers:
   ```
   GET /transfers?status=PENDING
   ```

2. Copy an ID from the response

3. Process the transfer:
   ```
   POST /transfers/{id}/process
   ```

4. **If SUCCESS** (70% chance):
   - Status changes to `SUCCESS`
   - `providerRef` is generated (e.g., `WAVE-1730461234-XY7K`)
   - Transfer is complete

5. **If FAILED** (30% chance):
   - Status changes to `FAILED`
   - `errorCode` is set (e.g., `PROVIDER_TIMEOUT`)
   - Transfer cannot be reprocessed
   - **Use a different PENDING transfer** from step 1

**Tip**: With 10 PENDING transfers, you can test the process endpoint multiple times even if some fail.

## Docker Deployment

### Using docker-compose (with local PostgreSQL)

```bash
docker-compose up -d
```

### Using docker-compose (with Neon DB)

1. Update `.env` with your Neon DB connection string
2. Comment out the `postgres` service in `docker-compose.yml`
3. Update `app` service dependencies

```bash
docker-compose up -d
```

### Build Docker image only

```bash
docker build -t transfer-api .
```

## Project Structure

```
src/
├── common/
│   ├── guards/
│   │   └── api-key.guard.ts       # API key authentication guard
│   ├── decorators/                # Custom decorators
│   └── filters/                   # Exception filters
├── transfers/
│   ├── dto/
│   │   ├── create-transfer.dto.ts # Transfer creation DTO
│   │   ├── list-transfers.dto.ts  # Query & filter DTOs
│   │   └── transfer-response.dto.ts # Response DTOs
│   ├── transfers.controller.ts    # REST endpoints
│   ├── transfers.service.ts       # Business logic
│   ├── transfers.repository.ts    # Data access layer
│   ├── transfers.module.ts        # Module definition
│   └── provider.simulator.ts      # Payment provider simulation
├── audit/
│   ├── audit.service.ts           # Audit logging service
│   └── audit.module.ts            # Module definition
├── prisma/
│   ├── prisma.service.ts          # Prisma client service
│   └── prisma.module.ts           # Module definition (global)
├── app.module.ts                  # Root module
└── main.ts                        # Application bootstrap
prisma/
├── schema.prisma                  # Database schema
└── seed.ts                        # Database seeding script
test/
├── app.e2e-spec.ts               # App e2e tests
└── transfers.e2e-spec.ts         # Transfers e2e tests
```

## Available Scripts

```bash
# Development
pnpm start:dev          # Start in watch mode
pnpm start:debug        # Start in debug mode

# Build & Production
pnpm build              # Build the application
pnpm start:prod         # Start production server

# Database
pnpm prisma:generate    # Generate Prisma client
pnpm prisma:migrate     # Run migrations
pnpm prisma:studio      # Open Prisma Studio
pnpm seed               # Seed database with sample data

# Testing
pnpm test               # Run unit tests
pnpm test:watch         # Run tests in watch mode
pnpm test:cov           # Run tests with coverage
pnpm test:e2e           # Run e2e tests

# Code Quality
pnpm lint               # Lint code
pnpm format             # Format code with Prettier
```

## Technical Choices

### Why NestJS?

- **Modular architecture**: Clean separation of concerns with modules
- **TypeScript first**: Strong typing and better developer experience
- **Built-in validation**: Seamless integration with class-validator
- **Dependency injection**: Easy testing and maintainability
- **Swagger integration**: Auto-generated API documentation

### Why Prisma?

- **Type-safe queries**: Generated types from schema
- **Migration management**: Version control for database schema
- **Multi-database support**: Easy to switch between databases
- **Great developer experience**: Intuitive query API

### Why Cursor-based Pagination?

- **Performance**: More efficient for large datasets
- **Consistency**: No missing/duplicate items during pagination
- **Scalability**: Works well with real-time data

### Provider Adapter Pattern

Each payment channel has its own adapter:
- Separation of concerns
- Easy to add new providers
- Testable in isolation
- Realistic simulation with delays

## Future Improvements

With more time, I would add:

### Security
- Rate limiting (using @nestjs/throttler)
- Request encryption/signing
- API key rotation mechanism
- Role-based access control (RBAC)

### Features
- Webhook support for real-time notifications
- Batch transfer processing
- Recurring transfers/scheduled payments
- Multi-currency support with exchange rates
- Transfer reversal/refund functionality

### Infrastructure
- Redis caching for frequently accessed data
- Message queue (RabbitMQ/SQS) for async processing
- Monitoring & observability (Prometheus, Grafana)
- Distributed tracing (OpenTelemetry)

### Testing
- Load testing (k6, Artillery)
- Contract testing (Pact)
- Mutation testing
- Security testing (OWASP ZAP)

### Database
- Read replicas for scalability
- Database connection pooling
- Soft deletes for transfers
- Archive old transfers

### Developer Experience
- OpenAPI SDK generation for clients
- GraphQL API alternative
- Admin dashboard
- CLI tool for operations

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
